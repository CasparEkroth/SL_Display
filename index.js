const myH1 = document.getElementById("myH1");
const csvUrl = 'https://raw.githubusercontent.com/thuma/StorstockholmsLokaltrafikAPI/master/sl.csv';

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
        console.log(JSON.stringify(jsonData, null, 2));
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

async function refresh(){
    const input = document.getElementById('searchInput').value.trim().toLowerCase();
    const matches = dataForID.filter(item =>
        item.name.toLowerCase() === input ||
        item.fullName.toLowerCase() === `${input} t-bana`
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
        return;
        }
    }
    myH1.textContent = `Couldn't find live data for "${input}"`;
    document.querySelectorAll('p').forEach(p => p.classList.add('hidden'));
}
// de gamla intervalet värkar vara kvards