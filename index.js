import { getWasm, readPointerArray, allocString, allocStringArray } from "./wasm-loader.js";

const COUNT_RETURN_STATIONS = 5;
const csvUrl = 'https://raw.githubusercontent.com/thuma/StorstockholmsLokaltrafikAPI/master/sl.csv';

// DOM elements
const searchInput         = document.getElementById('searchInput');
const searchButton        = document.getElementById('searchButton');
const myH1                = document.getElementById('myH1');
// Container for autocomplete suggestions (add <ul id="suggestions"></ul> in your HTML below the input)
const suggestionContainer = document.getElementById('suggestions');

// WASM and station data
let wasmExports, wasmMemory;
let arrayPtr, stationPtrs, stationNames = [];
let dataForID = [];

// Initialization: load CSV, init WASM, allocate station array once
(async function init() {
    try {
        dataForID    = await createJsonFromCSV(csvUrl);
        stationNames = dataForID.map(o => o.name);

        const wasm    = await getWasm();
        wasmExports  = wasm.exports;
        wasmMemory   = wasm.memory;

        ({ arrayPtr, stringPtrs: stationPtrs } =
        allocStringArray(wasmMemory, wasmExports.malloc, stationNames));

        console.log('Initialized WASM. arrayPtr:', arrayPtr);

        // Wire up events
        searchInput.addEventListener('input',  e => runSearch(e.target.value));
        searchButton.addEventListener('click', () => refresh());
    } catch (err) {
        console.error('Initialization error:', err);
    }
})();

// Fetch and parse CSV into JSON
async function createJsonFromCSV(url) {
    const resp    = await fetch(url);
    const csvText = await resp.text();
    return csvText.split('\n')
        .filter(line => line.trim())
        .map(line => { const f = line.split(';'); return { name: f[0], id: f[4], fullName: f[6], lat: parseFloat(f[7]), lng: parseFloat(f[8]) }; });
}

// Autocomplete via WASM fuzzySearch
async function runSearch(input) {
    if (!input.trim() || !wasmExports) {
        suggestionContainer.innerHTML = '';
        return;
    }
    const { malloc, free, fuzzySearch, freeFuzzyResults } = wasmExports;
    const inPtr     = allocString(wasmMemory, malloc, input);
    const resultPtr = fuzzySearch(inPtr, arrayPtr, stationNames.length);

    let matches = [];
    if (resultPtr) {
        matches = readPointerArray(wasmMemory, resultPtr, COUNT_RETURN_STATIONS);
        freeFuzzyResults(resultPtr);
    }
    free(inPtr);

    // Render suggestions
    suggestionContainer.innerHTML = '';
    matches.forEach(text => {
        if (!text) return;
        const li = document.createElement('li');
        li.textContent = text;
        li.addEventListener('click', () => {
        searchInput.value = text;
        suggestionContainer.innerHTML = '';
        runSearch(text);
        refresh();
        });
        suggestionContainer.appendChild(li);
    });
}

// === Live departures display logic ===
async function fetchDepartures(siteId) {
    try {
        const res  = await fetch(`https://transport.integration.sl.se/v1/sites/${siteId}/departures`);
        return await res.json();
    } catch (err) {
        console.error('Error fetching departures:', err);
        return null;
    }
}

async function updatingDisplay(departure, index) {
    const disp = document.getElementById(`output${index}`);
    if (!disp) return;
    disp.textContent = `${departure.line.id} ${departure.destination} ${departure.display}`;
}

async function displayingData(siteId) {
    getTime();
    const data = await fetchDepartures(siteId);
    if (!data || !data.departures || data.departures.length < 4) return false;
    for (let i = 0; i < 4; i++) await updatingDisplay(data.departures[i], i);
    return true;
}

function getTime() {
    const now = new Date();
    const h   = now.getHours().toString().padStart(2, '0');
    const m   = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('curentTime').textContent = `${h}:${m}`;
}

// Search-to-live-data logic
const triedIds   = new Set();
let refreshTimer = null;
let lastInput    = '';

async function refresh() {
    const input = searchInput.value.trim().toLowerCase();
    if (input === lastInput) return;
    lastInput = input;
    triedIds.clear();
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }

    const matches = dataForID.filter(item =>
        item.name.toLowerCase().startsWith(input) ||
        item.fullName.toLowerCase().startsWith(input)
    );

    for (const station of matches) {
        if (triedIds.has(station.id)) continue;
        triedIds.add(station.id);
        if (await displayingData(station.id)) {
        myH1.textContent = station.name;
        document.querySelectorAll('p').forEach(p => p.classList.remove('hidden'));
        refreshTimer = setInterval(() => displayingData(station.id), 20000);
        return;
        }
    }
    myH1.textContent = `Couldn't find live data for "${input}"`;
    document.querySelectorAll('p').forEach(p => p.classList.add('hidden'));
}
