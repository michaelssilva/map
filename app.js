var map;

// 1. Load the Google Map
function initMap() {
    // Create a map
    var mapOptions = {
        center: { lat: -23.624556, lng: -46.700483 },
        zoom: 17,
        scrollwheel: false,
        styles: [
            {
                "featureType": "poi.business",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "poi.attraction",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "poi.government",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "poi.medical",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "poi.park",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "poi.place_of_worship",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "poi.school",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "poi.sports_complex",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "transit.station",
                "stylers": [
                    { "visibility": "on" }
                ]
            }
        ]
    };
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, mapOptions);
    ko.applyBindings(new viewModel()); // Activate Knockout.js
}

// Google Map load error function using jQuery
function googleError() {
    $('header').append('<h2> Oops!! Something went wrong. This page did not load the Google Map. Refresh again.</h2>');
}

// 2. Model
var Restaurant = function(data) {
    var self = this;
    self.name = ko.observable(data.name);
    self.lat = ko.observable(data.lat);
    self.lng = ko.observable(data.lng);
    self.marker = ko.observable();
    self.isFavorite = ko.observable(data.isFavorite || false); // Campo para status de favorito
    self.icon = ko.observable(data.icon || 'images/restaurant_icon.ico'); // Ícone padrão se não especificado
};

// 3. JavaScript Constructor
var Restaurant = function(data) {
    var self = this;
    self.name = ko.observable(data.name);
    self.lat = ko.observable(data.lat);
    self.lng = ko.observable(data.lng);
    self.marker = ko.observable();
    self.isFavorite = ko.observable(data.isFavorite || false); // Field for favorite status
    self.icon = ko.observable(data.icon || 'images/restaurant_icon.ico'); // Default icon if not specified
};


// 4. ViewModel
var viewModel = function() {
    var self = this;
    var infowindow = new google.maps.InfoWindow({ maxWidth: 200 }),
        favoriteImage = 'images/favorite_icon.ico'; // Ícone para favoritos

    self.restaurants = ko.observableArray([]);
    self.locationList = ko.observableArray([]);
    self.visible = ko.observableArray([]);
    self.search = ko.observable('');

    // Carregar dados de restaurante do arquivo JSON
    $.getJSON('restaurants.json', function(data) {
        var restaurants = [];
        data.forEach(function(restaurantItem) {
            var restaurant = new Restaurant(restaurantItem);
            restaurants.push(restaurant);
        });

        self.restaurants(restaurants);
        self.locationList(restaurants);
        self.visible(restaurants);

        // Configuração dos marcadores
        self.restaurants().forEach(function(restaurantItem) {
            var markerIcon = restaurantItem.isFavorite() ? favoriteImage : restaurantItem.icon(); // Usa o ícone específico do restaurante

            var markerLabel = {
                text: restaurantItem.name(),
                color: "red", // Mude a cor conforme desejar
                fontSize: "0px",
                fontWeight: "bold"
            };

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(restaurantItem.lat(), restaurantItem.lng()),
                map: map,
                icon: markerIcon, // Usa o ícone específico do restaurante
                label: markerLabel,
                animation: google.maps.Animation.DROP
            });
            restaurantItem.marker = marker;

            google.maps.event.addListener(restaurantItem.marker, 'click', function() {
                infowindow.setContent('<h4>' + restaurantItem.name() + '</h4>');
                infowindow.open(map, restaurantItem.marker);
                restaurantItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    restaurantItem.marker.setAnimation(null);
                }, 1400);
            });
        });

    }).fail(function(jqxhr, textStatus, error) {
        console.error("Request Failed: " + textStatus + ", " + error);
    });

    // 10. Mostrar o marcador quando o usuário clica na lista
    self.showMarker = function(restaurantItem) {
        google.maps.event.trigger(restaurantItem.marker, 'click');
    };

    // 12. Filtragem dos locais de restaurante
    self.filter = function() {
        var filter = self.search().toLowerCase();
        // Fecha as infowindows atuais quando o usuário tenta buscar
        infowindow.close();
        self.visible.removeAll();
        self.locationList().forEach(function(resto) {
            resto.marker.setVisible(false);
            // Se a entrada do usuário estiver incluída no nome, torna o marcador visível
            if (resto.name().toLowerCase().indexOf(filter) !== -1) {
                self.visible.push(resto);
            }
        });
        self.visible().forEach(function(resto) {
            resto.marker.setVisible(true);
        });
    }; // Fim do filtro
}; // Fim do ViewModel


// Initialize the map
initMap();
