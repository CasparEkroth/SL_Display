const COUNT_RETURN_STATIONS = 5;  

import {
    getWasm,
    readPointerArray,
    allocString,
    allocStringArray
} from "./wasm-loader.js";

const myH1 = document.getElementById("myH1");
const csvUrl = 'https://raw.githubusercontent.com/thuma/StorstockholmsLokaltrafikAPI/master/sl.csv';


async function runSearch(input, stationList) {
    const { exports, memory } = await getWasm();
    const { malloc, free, fuzzySearch, freeFuzzyResults } = exports;
    const inPtr = allocString(memory, malloc, input);

    const { arrayPtr, stringPtrs } = allocStringArray(memory, malloc, stationList);
    const listCount = stationList.length;

// Check the actual memory allocation for the string pointers
console.log("Allocated Memory for Array:", arrayPtr);
console.log("String Pointer Count:", stationList.length);

    stationList.forEach(station => {
        const strPtr = allocString(memory, malloc, station);
        console.log("Allocated pointer for station:", strPtr);
    });

    const resultPtr = fuzzySearch(inPtr, arrayPtr, listCount);
    if (!resultPtr) {
        console.error("no matches");
    } else {
        const matches = readPointerArray(memory, resultPtr, COUNT_RETURN_STATIONS);
        console.log("Top matches:", matches);
        freeFuzzyResults(resultPtr);
    }
    stringPtrs.forEach(ptr => free(ptr));
    free(arrayPtr);
    free(inPtr);
}


async function createJsonFromCSV(url){
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const jsonData = lines.map(line => {
            const fields = line.split(';');
            return {
                name: fields[0],
                lat: fields[1],
                lon: fields[2],
                sa: fields[3],
                id: fields[4],
                gtfsid: fields[5],
                fullName: fields[6],
                lat: parseFloat(fields[7]),
                lng: parseFloat(fields[8])
            };
        });
        //console.log(JSON.stringify(jsonData, null, 2));
        return jsonData;
    } catch (error) {
        console.error('Error fetching or processing CSV:', error);
    }
}

async function fetchDepartures(siteId) {
    try {
        const response = await fetch(`https://transport.integration.sl.se/v1/sites/${siteId}/departures`);
        const data = await response.json();
        console.log(data.departures);
        return data;
    } catch (err) {
        console.error("Error fetching departures:", err);
    }
}

async function updatingDisplay(departure,index){
    console.log(departure,index);

    const display = document.getElementById(`output${index}`);
    if (!display) {
        console.warn(`No element with id="output${index}"`);
        return;
    }
    const line = departure.line.id;
    console.log(line);
    const destination = departure.destination;
    const time = departure.display;
    display.textContent =`${line} ${destination} ${time}`;
}

async function displayingData(SITE_ID){
    getTime();
    try{
        const data = await fetchDepartures(SITE_ID);
        if(data.departures.length <= 3) return false;
        for( let i = 0;i < 4; i++){
            updatingDisplay(data.departures[i],i);
        }
        return true;
    }catch(error){
        console.log(error);
        return false;
    }
}


function getTime(){
    const now = new Date();
    let hours = now.getHours();
    hours = hours.toString().padStart(2,0);
    const minutes = now.getMinutes().toString().padStart(2,0);
    const clock = document.getElementById("curentTime");
    clock.textContent = `${hours}:${minutes}`;
}


//const SITE_ID = "3065";//träkvista
//displayingData(SITE_ID)
let dataForID = [];
createJsonFromCSV(csvUrl)
    .then(data => {
    dataForID = data;
    console.log("Data loaded:", dataForID);
    })
    .catch(error => {
        console.error("Error loading CSV data:", error);
    });

const triedIds = new Set();
let refreshTimer = null;
let lastInput = ";"
async function refresh(){
    const input = document.getElementById('searchInput').value.trim().toLowerCase();
    if(input !== lastInput){
        lastInput = input;
        triedIds.clear();
        if(refreshTimer){
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    }
    const matches = dataForID.filter(item =>
        item.name.toLowerCase() === input ||
        item.fullName.toLowerCase() === `${input} t-bana` ||
        item.fullName.toLowerCase() === input ||
        item.name.toLowerCase() === `${input} station`
    );
    for (const station of matches) {
        if (triedIds.has(station.id)) continue;
        triedIds.add(station.id);
    
        console.log(`trying id=${station.id}`);
        const hasData = await displayingData(station.id);  // will now be true/false

        if (hasData) {
        myH1.textContent = station.name;
        document.querySelectorAll('p').forEach(p => p.classList.remove('hidden'));
        console.log("found");
        if(!refreshTimer){
            refreshTimer = setInterval( () => displayingData(station.id),20000);
        }
        return;
        }
    }
    myH1.textContent = `Couldn't find live data for "${input}"`;
    document.querySelectorAll('p').forEach(p => p.classList.add('hidden'));
}

runSearch("Trä", ["Träkvista","Alvik","Brommaplan"]);
