var appInput = new Vue ({
    el: '.app-input',
    mounted: function() {
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
              console.log(place)
              if (!place.geometry) {
              // User entered the name of a Place that was not suggested and
              // pressed the Enter key, or the Place Details request failed.
              window.alert("No details available for input: '" + place.name + "'");
              return;
              }
      });
    }
  })