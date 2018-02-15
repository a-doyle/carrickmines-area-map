// Locations shown to the user.
var locations = [
    {name: 'Carrickmines Luas Stop', lat:53.25406993337829, lng:-6.170001716199232},
    {name: 'Carrickmines Tennis Club', lat:53.25588132335208, lng:-6.172842683014686},
    {name: 'The Park Carrickmines', lat:53.25109290911255, lng:-6.180100107590849},
    {name: 'Carrickmines Golf Club', lat:53.247745596081026, lng:-6.171109746282646},
    {name: 'Cabinteely Park', lat:53.261362531619014, lng:-6.156291961669922},
    {name: 'Cornelscourt Shopping Centre', lat:53.26636798353237, lng:-6.160669326782227},
    {name: 'Leopardstown Racecourse', lat:53.26593229303037, lng:-6.194801020671965},
    {name: 'Aldos Diner', lat:53.26829300134124, lng:-6.166119575500488}
];

// Global variables declared.
var map;

// This function controls all the data for each location.
var Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.address1 = "";
    this.address2 = "";
    this.phone = "";

    this.visible = ko.observable(true);

    // The API call for Foursquare.
    var foursquare = 'http://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&client_id=UMO1IKWLV5FRALY5X5XUGCTZHBIDMLNMPWNE5CCBXNPOCODM&client_secret=GQFFZSTKC5MUZA3WSFTARKX01GNXX03M4KPPA0GR53SOF2EI&v=20180125';

    // Using JQuery to record the information for each location from the Foursquare API.
    $.getJSON(foursquare).done(function(data) {
        var response = data.response.venues[0];
        self.address1 = response.location.formattedAddress[0];
        self.address2 = response.location.formattedAddress[1];
        self.phone = response.contact.formattedPhone;
        if (typeof self.address1 === 'undefined'){
			self.address1 = "";
        }
        if (typeof self.address2 === 'undefined'){
			self.address2 = "";
        }
        if (typeof self.phone === 'undefined'){
			self.phone = "";
		}
    }).fail(function() {
        window.alert("The Foursquare API call returned an error. Please try again");
    });

    // Creates the infowindow.
    this.infoWindow = new google.maps.InfoWindow({content: self.infoWindowContent});

    // Used to style the markers post mouseover.
    var defaultIcon = makeMarkerIcon('0091ff');
    // Used to style the markers when the user mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        map: map,
        title: data.name,
        animation: google.maps.Animation.DROP
    });

    // Fires an event to display the infowindow when a marker is clicked.
    this.marker.addListener('click', function(){
		self.infoWindowContent = '<div><div><strong>' + data.name + '</strong></div>' +
        '<div>' + self.address1 + '</div>' +
        '<div>' + self.address2 + '</div>' +
        '<div>' + self.phone +'</div></div>';

        self.infoWindow.setContent(self.infoWindowContent);
        self.infoWindow.open(map, this);
    });
    // Two event listeners - one for mouseover, one for mouseout, to change the colors.
    this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });
    this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });
    // This function sets the bounce animation on each marker when it is clicked from the list.
    this.bounce = function(place) {
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
       }, 1500);
		google.maps.event.trigger(self.marker, 'click');
	};
}

// This function takes in a color and creates a new marker given the specified parameters.
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

// Acting as the ViewModel, this function acts as the program engine.
function initMap() {
    // Create a styles array to use with the map.
    var styles = [
        {
            "featureType": "all",
            "elementType": "all",
            "stylers": [
                {
                    "invert_lightness": true
                },
                {
                    "saturation": "-9"
                },
                {
                    "lightness": "0"
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "all",
            "stylers": [
                {
                    "weight": "1.00"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [
                {
                    "weight": "0.49"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "weight": "0.01"
                },
                {
                    "lightness": "-7"
                },
                {
                    "saturation": "-35"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        }
    ];
    var self = this;
    this.searchText = ko.observable("");
    this.locationList = ko.observableArray([]);
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 53.2549558, lng: -6.1721979},
        zoom: 14,
        styles: styles,
    });

    // Pushes each location into a new array.
    locations.forEach(function(location) {
        self.locationList.push(new Location(location));
    });


    // This function compares the user input with the given list for use in the filter function
    var stringStartsWith = function(string, startsWith) {
        string = string || "";
        if (startsWith.length > string.length)
            return false;
        return string.substring(0, startsWith.length) === startsWith;
    };

    // This function filters the locations in response to the user's input in the seach box.
    this.filteredList = ko.computed( function() {
		var filter = self.searchText().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(location){
				location.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(location) {
                return stringStartsWith(location.name.toLowerCase(), filter);
			});
		}
    }, self);
}

// This function uses KnockoutJS to run the program.
function openMap() {
    ko.applyBindings(new initMap());
}