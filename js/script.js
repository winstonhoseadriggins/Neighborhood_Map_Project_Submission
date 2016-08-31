'use strict';

var map, resetMap;

/* Hardcoding 5 Industrial Park locations - our data - model*/
var indparks = [
    {
        title: "Pureland Industrial Complex",
        lat: 39.760487,
        lng: -75.353761,
        streetAddress: "545 Beckett Rd",
        cityAddress: "Bridgeport, NJ 08014",
        visible: ko.observable(true),
        id: "nav0",
        showIt: true
    },
    {
        title: "Airport Business Complex",
        lat: 39.864896,
        lng: -75.289191,
        streetAddress: "10 Industrial Highway",
        cityAddress: "Philadelphia, PA 19113",
        visible: ko.observable(true),
        id: "nav1",
        showIt: true
    },
    {
        title: "Evonik Degussa Corporation",
        lat: 39.837249,
        lng: -75.372360,
        streetAddress: "1200 W.Front Street",
        cityAddress: "Chester, PA 19013",
        visible: ko.observable(true),
        id: "nav2",
        showIt: true
    },
    {
        title: "Riverbridge Industrial Center",
        lat: 39.839792,
        lng: -75.370551,
        streetAddress: "800 W.Front Street",
        cityAddress: "Chester, PA 19013",
        visible: ko.observable(true),
        id: "nav3",
        showIt: true
    },
    {
        title: "Penn Terminals",
        lat: 39.852398,
        lng: -75.341967,
        streetAddress: "1 Saville Avenue",
        cityAddress: "Eddystone, PA 19022",
        visible: ko.observable(true),
        id: "nav4",
        showIt: true
    }
];

/* Function that alert error if google map load fails */
function googleError(){
    alert("ERROR: Google maps not loaded");
}

/* Initializing map, markers */
function initMap() {

    var myLatlng = new google.maps.LatLng(39.818257, -75.361085);
    var mapOptions = {
        zoom: 6,
        center: myLatlng,
        disableDefaultUI: true
    };

    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(39.755996, -75.525880), //SW coordinates here
        new google.maps.LatLng(39.887575, -75.145822) //NE coordinates here
    );

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    map.fitBounds(bounds);

    setMarkers(indparks);
    setMapWithMarker();

    /* Function to reset the map zoom and set center */
    resetMap = function() {
        map.fitBounds(bounds);
    }

    $(window).resize(function(){
        map.fitBounds(bounds);
    });
}

/* Controlling the visibility of marker based on the 'showIt' property */
function setMapWithMarker() {
    for (var i = 0; i <indparks.length; i++) {
        if(indparks[i].showIt === true) {
            indparks[i].locMarker.setMap(map);
        } else {
            indparks[i].locMarker.setMap(null);
        }
    }
}

/* Setting markers on map and attaching content to each of their info windows */
function setMarkers(location) {
    var img = 'img/airport.png';
    for (var i = 0; i < location.length; i++) {
        location[i].locMarker = new google.maps.Marker({
            position: new google.maps.LatLng(location[i].lat, location[i].lng),
            map: map,
            animation: google.maps.Animation.DROP,
            title: location.title,
            icon:img
        });

        var indparkTitle = location[i].title;
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
        indparkTitle + '&format=json&callback=wikiCallback';

        (function(i){
            var wikiRequestTimeout = setTimeout(function() {
                $('.show-error').html('ERROR: Failed to load wikipedia data - Industrial park details will not show up! Sorry for the inconvenience caused.');
            }, 5000);

            $.ajax({
                url: wikiUrl,
                dataType: "jsonp"
            }).done(function(response){
                var article = response[2][0];
                    location[i].contentString =
                    '<strong>'+ location[i].title + '</strong><br><p>' + location[i].streetAddress
                    + '<br>' + location[i].cityAddress + '<br></p><p>' + article +
                    '</p><p>Source: Wikipedia</p>';
                    clearTimeout(wikiRequestTimeout);
            });
        })(i);

        /* info window initialization and setting content to each marker's info window */
        var infowindow = new google.maps.InfoWindow({});

        new google.maps.event.addListener(location[i].locMarker, 'click',
            (function(indparks, i) { return function() {
                indparks.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    indparks.setAnimation(null);
                }, 2400);
                infowindow.setContent(location[i].contentString);
                infowindow.open(map,this);
                map.setZoom(15);
                map.setCenter(indparks.getPosition());
            };
        })(location[i].locMarker, i));

        /* info window call when clicked on indparks menu item */
        var searchNav = $('#nav' + i);
        searchNav.click((function(indparks, i) {
            return function() {
                indparks.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    indparks.setAnimation(null);
                }, 2200);
                infowindow.setContent(location[i].contentString);
                infowindow.open(map,indparks);
                map.setZoom(15);
                map.setCenter(indparks.getPosition());
            };
        })(location[i].locMarker, i));
    }
}

/* Function for toggling the menu */
function slideToggle() {
    $(this).toggleClass('toggled');
    $( "#listing" ).toggle( "slow", function() {
        // Animation complete.
    });
}

/* Our view model */
function viewModel() {
    var self = this;
    this.locMarkerSearch = ko.observable('');
    ko.computed(function() {
        var search = self.locMarkerSearch().toLowerCase();
        return ko.utils.arrayFilter(indparks, function(indparks) {
            if (indparks.title.toLowerCase().indexOf(search) >= 0) {
                indparks.showIt = true;
                return indparks.visible(true);
            } else {
                indparks.showIt = false;
                setMapWithMarker();
                return indparks.visible(false);
            }
        });
    });
};

// Activates knockout.js
ko.applyBindings(new viewModel());

$(window).resize(function(){
    var windowWidth = $(window).width();
    if (windowWidth > 768) {
        $( "#listing" ).slideDown( "slow", function() {
            // Animation complete.
        });
    }
});