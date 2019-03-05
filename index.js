var appInput = new Vue ({
    el: '.app-input',
    data: {
        place: {},
        stopsBase:{},
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
            this.place = place
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
    },
    mounted: function() {
      this.gAutocomplete()
      this.getData()
    }
  });