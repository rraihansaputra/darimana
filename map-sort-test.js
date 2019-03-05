// Tested this on the browser. Algorithm is still not fully coded

// PSEODOCODE ALGO
// get the latlong of the place selected and filter current station by straightline distance (15km)
var stops = []; // list of stops
var place = new google.maps.LatLng(lat,lng); //get coords

var newstops = stops.map() //map the thing have new value based on computeDistanceBetween
//filter distance <= 10k
const result = newstops.filter(stop => stop.ddist < 10000)

// async get the distance for each station and put them into
// {id: stationid, dist: returned distance} objects and array them
//      need to have an individual getGMapsDistance() that calls axios and returns the object

// Assume this is the result of the distance from googlemaps
var wota = [
    { id: 'this is not', dist: 3.4 },
    { id: 'other station', dist: 0.5 },
    { id: 'yet another station', dist: 4.4 },
    { id: 'straight to hell', dist: 99 },
    { id: 'home', dist: 0.1 }
]

console.log(
    // returns the sorted array based on the dist property of the object
    wota.sort(function(a,b) {
        if (a.dist > b.dist) {
            return 1
        } 
        if (a.dist < b.dist) {
            return -1
        } return 0
    }));

// get the objects added with info from the json
//      add stop information (stop name)
//      add lines information
//      add tracks information

google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(6.2326307,106.8237375),
    new google.maps.LatLng(-6.22, 106.85))

    google.maps.geometry.spherical.computeDistanceBetween(
        {lat:-6.2326307,lng:106.8237375},
        {lat:-6.22, lng :106.85}
        )