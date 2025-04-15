const myH1 = document.getElementById("myH1");

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
    const line = departure.line.id;
    const destination = departure.destination;
    const time = departure.display;
    const display = document.getElementById(`output${index}`);
    display.textContent =`${line} ${destination} ${time}`;
}

async function displayingData(SITE_ID){
    const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
    if(metaRefresh){
        getTime();
        const buses = await fetchDepartures(SITE_ID);
        let n = 0;
        for(let i = 0; i<buses.departures.length;i++){
            if(buses.departures[i].destination == "Mörby station" ||
                buses.departures[i].destination == "Brommaplan" ||
                buses.departures[i].destination == "Brommaplan (bussbyte)"){
                n++;
                updatingDisplay(buses.departures[i],n);
            }
        }
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
myH1.textContent = "Träkvista";

const csvUrl = 'https://raw.githubusercontent.com/thuma/StorstockholmsLokaltrafikAPI/master/sl.csv';
const newUrl = 'https://raw.githubusercontent.com/thuma/StorstockholmsLokaltrafikAPI/master/sl.csv'

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

createJsonFromCSV(csvUrl)


