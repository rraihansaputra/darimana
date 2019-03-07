var app = new Vue ({
    el: '#app',
    data: {
        place: {},
        stopsBase:[],
        // #TODO watch filtered stops to render results
        filteredStops: [],
        stopsInfo: {},
        tracksInfo: {},
        linesInfo: {},
    },
    methods: {
      gAutocomplete: function() {
        this.autocomplete = new google.maps.places.Autocomplete(
          this.$refs.autocomplete)
          this.autocomplete.setComponentRestrictions(
              {'country': ['id']}
          );
    
          // Set the data fields to return when the user selects a place.
          // Set fields to [''] to get all the data
          this.autocomplete.setFields([
            'address_components', 
            'name',
            'id',
            'place_id',
            'reference',
            'url',
            'geometry',
            ]);
           
          this.autocomplete.addListener('place_changed', () => {
            var place = this.autocomplete.getPlace();
            this.place = place; // is the trigger correct? how to deal with the button?
            this.filterStops();
            if (!place.geometry) {
              // User entered the name of a Place that was not suggested and
              // pressed the Enter key, or the Place Details request failed.
              window.alert("No details available for input: '" + place.name + "'");
              return;
            }
          });
      },
      getData: function(){
        axios
        .get('krl_stops.json')
        .then(response => {
          this.stopsBase = response.data;
        });
        axios
          .get('all.json')
          .then(response => {
            this.stopsInfo = response.data.stops;
            this.tracksInfo = response.data.tracks;
            this.linesInfo = response.data.lines;
          });
      },
      getStationName: function(stopId){
        return this.stopsBase.find(stop => stop.id == stopId).name
      },
      getLines: function(stopId){
        lines = Object.keys(this.stopsInfo[stopId])
        res = []
        for (line of lines) {
          res.push(this.linesInfo[line])
        }
        return res
      },
      getGmapsLink: function(destinationLatLng, destinationPlaceId, originLatLng, originPlaceId){
        baseurl = 'https://www.google.com/maps/dir/?api=1&destination=' + destinationLatLng.lat() + ','+ destinationLatLng.lng()
        baseurl += '&destination_place_id=' + destinationPlaceId;

        if (originPlaceId.length > 0) {
          baseurl += '&travelmode=driving&origin=' + originLatLng.lat() + ',' + originLatLng.lng();
          baseurl += '&origin_place_id=' + originPlaceId;
        }

        return baseurl
      },
      sortByDist: function(a,b){ // TODO comments
        if (a.dist > b.dist) {
          return 1
        } 
        if (a.dist < b.dist) {
            return -1
        } return 0
      },
      filterStops: function(){ // TODO split this to saner functions
        // Prep const and vars
        const place = this.place;
        const placeLatLng = place.geometry.location;
        var getStraightLineDistance = google.maps.geometry.spherical.computeDistanceBetween.bind(null, placeLatLng);

        // filter by straight line distance
        var straightLineDistance = this.stopsBase.map(stop => {
          const stopLatLng = new google.maps.LatLng(stop.lat, stop.lng); // Create LatLng Object
          return {
            id: stop.id,
            stopLatLng: stopLatLng, // Pass LatLng Object to next step
            dist: getStraightLineDistance(stopLatLng),
            name: stop.name,
          };
        }).sort(this.sortByDist) // function to sort by distance
          .filter(stop => stop.dist < 10000).slice(0,10); // filter < 10km

        var directionsService = new google.maps.DirectionsService();

        var travelDistancePromiseArray = straightLineDistance.map(stop => {

          // Request Object for directions
          const directionsRequest = {
            origin: stop.stopLatLng,
            destination: placeLatLng,
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.METRIC,
          }

          return new Promise (async (resolve, reject) => {
            result = await directionsService.route(directionsRequest, async (results, status) => {
              if (status == 'OK') {
                const traveldist = results.routes[0].legs[0].distance.value; // get the distance
                const originGmapsId = results.geocoded_waypoints[0].place_id; 
                result = {
                  id: stop.id,
                  dist: traveldist,
                  formattedDist: (traveldist/1000).toFixed(2),
                  name: stop.name,
                  stopLatLng: stop.stopLatLng,
                  destination: place,
                  destinationLatLng: placeLatLng,
                  originGmapsId: originGmapsId,
                }
                resolve(result);
              } else {resolve({id:stop.id, dist: traveldist, status: status})}
            });
          });
      
        });

        // Wait for all the requests to finish
        Promise.all(travelDistancePromiseArray).then((values) => {
          this.filteredStops = values.filter(stop => stop.dist != null); // filter non successful queries
        }).catch(err => {console.log(err)});

      },
    },
    mounted: function() {
      this.gAutocomplete()
      this.getData()
    }
  });