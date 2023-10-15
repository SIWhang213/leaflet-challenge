// Define depth categories and their corresponding colors
const depthCategories = [
    { maxDepth: 10, color: "#33FF33", label: "-10-10" },
    { maxDepth: 30, color: "#99FF33", label: "10-30" },
    { maxDepth: 50, color: "#FFFF33", label: "30-50" },
    { maxDepth: 70, color: "#FF9933", label: "50-70" },
    { maxDepth: 90, color: "#FF6633", label: "70-90" },
    { maxDepth: Infinity, color: "#FF3333", label: "90+" },
];

// Creating the map object
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 6
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Store the API query for getting the GeoJSON data.
let baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";
let period = "all_week.geojson";
//let period = "all_month.geojson";
let url = baseURL + period;

// Define function to style markers based on magnitude and depth
function styleMarker(feature) {
    const magnitude = feature.properties.mag;
    const depth = feature.geometry.coordinates[2];

    // Adjust marker size based on magnitude
    const radius = magnitude * 5;

    // Find the depth category for the earthquake
    const category = depthCategories.find(c => depth <= c.maxDepth);
    return {
        radius: radius,
        fillColor: category.color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
    };
}

// Getting our GeoJSON data
d3.json(url).then(function (data) {
    // Creating a GeoJSON layer with the retrieved data and custom styling
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, styleMarker(feature));
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<b>Location:</b> " +
                feature.properties.place +
                "<br><b>Magnitude:</b> " +
                feature.properties.mag +
                "<br><b>Depth:</b> " +
                feature.geometry.coordinates[2]+                
                "<br><b>Time:</b> " +
                new Date(feature.properties.time)
            );
        }
    }).addTo(myMap);

    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");

        depthCategories.forEach(function(category) {
           div.innerHTML += "<li style=\"background-color: " + category.color + "\"></li> " + category.label + "<br>";
        });

        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
});
  