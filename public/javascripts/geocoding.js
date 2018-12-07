var marker, map, infowindow;

$(document).ready(function() {
    initMap();

    //initialize map
    function initMap() {
        map = new google.maps.Map(document.getElementById("map-canvas"), {
            center: { lat: 41.0815, lng: -74.1746 },
            zoom: 6
        });
    }

    //get table data to put on map
    $(".clickable").on("click", "tr", function() {
        var lat = $(this).data("geolat"),
            lng = $(this).data("geolng"),
            name = $(this).data("name"),
            address = $(this).data("address"),
            email = $(this).data("email"),
            phone = $(this).data("phone");

        map.setCenter({ lat: lat, lng: lng })

        var contentString = '<h3>' + name + '</h3><p>' + address + '</p><p>' + email + '</p><p>' + phone + '</p>';

        infowindow = new google.maps.InfoWindow({
            content: contentString
        })

        marker = new google.maps.Marker({
            map: map,
            position: { lat: lat, lng: lng },
            title: name,
            animation: google.maps.Animation.DROP

        })

        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
    })
});