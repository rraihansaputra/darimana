var appInput = new Vue ({
    el: '.app-input',
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
            var place = this.autocomplete.getPlace()
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
          const stopLatLng = new google.maps.LatLng(stop.lat, stop.lng);
          return {
            id: stop.id,
            stopLatLng: stopLatLng,
            dist: getStraightLineDistance(stopLatLng),
          };
        }).sort(this.sortByDist).filter(stop => stop.dist < 10000);

        var directionsService = new google.maps.DirectionsService();

        var travelDistancePromiseArray = straightLineDistance.map(stop => {
          dist = 0;
          const directionsRequest = {
            origin: stop.stopLatLng,
            destination: placeLatLng,
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.METRIC,
          }
          return new Promise ((resolve, reject) => {
              directionsService.route(directionsRequest, (results, status) => {
              if (status == 'OK') {
                var traveldist = results.routes[0].legs[0].distance.value;
                result = {
                  id: stop.id,
                  dist: traveldist,
                }
                resolve(result);
              } else { resolve({id: stop.id, dist: null}); }
            });
          });
        });

        Promise.all(travelDistancePromiseArray).then((values) => {
          this.filteredStops = values.filter(stop => stop.dist != null);
        }).catch(err => {console.log(err)});

      },
    },
    mounted: function() {
      this.gAutocomplete()
      this.getData()
    }
  });