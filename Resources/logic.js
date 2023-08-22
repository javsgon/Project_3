// Load the JSON data
const url = "http://127.0.0.1:5000/api/v1.0/dataset";
d3.json(url).then(function (data) {
    console.log("Loaded data:", data);

    // Define colors for fuel types
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

    // Map each fuel type to a color
    const fuelTypeColors = {
        "Ethanol Fuel": colors[0],
        "Compressed Natural Gas": colors[1],
        "Liquified Petroleum Gas": colors[2],
        "ELEC": colors[3],
        "Biodiesel": colors[4],
        "Liquified Natural Gas": colors[5],
    };

    // Function to get the color of a fuel type
    function getFuelTypeColor(fuelType) {
        return fuelTypeColors[fuelType] || "#000000"; // Default color for unknown types
    }

    // Extract fuel types from the data
    const fuelTypes = [...new Set(data.map(entry => entry.fuel_type_code))];
    fuelTypes.sort(); // Sort fuel types in ascending order

    // Create the map
    const map = L.map('fuelStation').setView([41.9002646, -87.941968], 7);

    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create a legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');

        for (const fuelType of fuelTypes) {
            const color = getFuelTypeColor(fuelType);
            const colorLabel = `<div style="display: inline-block; width: 20px; height: 20px; background-color: ${color}"></div>`;
            div.innerHTML +=
                `${colorLabel}&nbsp;&nbsp;<i>${fuelType}</i><br />`;
        }
        return div;
    };
    legend.addTo(map);

    // Create an array to hold all markers
    const markers = [];

    // Add markers for each station
    data.forEach(dt => {
        const lat = dt.latitude;
        const lon = dt.longitude;
        const city = dt.city;
        const station = dt.station_name;
        const fuelType = dt.fuel_type_code;
        const openedData = dt.open_date;

        const marker = L.circleMarker([lat, lon], {
            radius: 10,
            fillColor: getFuelTypeColor(fuelType),
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        });

        marker.bindPopup(`Location: ${lat}, ${lon} <br> City: ${city} <br> Station: ${station}<br>Open Date: ${openedData}`);
        markers.push({ marker, fuelType });
    });

    // Add all markers to the map
    markers.forEach(mark => {
        mark.marker.addTo(map);
    });

    // Populate the dropdown options
    const fuelTypeDropdown = document.getElementById("fuelType");

    // "All fuel types" option
    const allFuelTypeOption = document.createElement("option");
    allFuelTypeOption.value = "all"; // Use 'all' as the value
    allFuelTypeOption.textContent = "All fuel types"; // Display text
    fuelTypeDropdown.appendChild(allFuelTypeOption);

    // Populate the rest of the fuel type options
    fuelTypes.forEach(fuelType => {
        const option = document.createElement("option");
        option.value = fuelType;
        option.textContent = fuelType;
        fuelTypeDropdown.appendChild(option);
    });

    // Set the "All fuel types" option as the selected option
    fuelTypeDropdown.value = "all";

    fuelTypeDropdown.addEventListener("change", function () {
        const selectedFuelType = fuelTypeDropdown.value;

        markers.forEach(mark => {
            const isVisible = selectedFuelType === "all" || selectedFuelType === mark.fuelType;
            if (isVisible) {
                map.addLayer(mark.marker);
            } else {
                map.removeLayer(mark.marker);
            }
        });
    });

    // Convert city-fuel type hierarchy to treemap chart data
    var cityFuelDistribution = {};

    data.forEach(function (entry) {
        var city = entry["city"];
        var fuelType = entry["fuel_type_code"];

        if (!cityFuelDistribution[city]) {
            cityFuelDistribution[city] = {};
        }

        if (!cityFuelDistribution[city][fuelType]) {
            cityFuelDistribution[city][fuelType] = 1;
        } else {
            cityFuelDistribution[city][fuelType]++;
        }
    });

    // Convert city-fuel type hierarchy to treemap chart data
    var treemapChartData = {
        type: "treemap",
        labels: [],
        parents: [],
        values: [],
        branchvalues: 'total' // Set the branch values to 'total'
    };
    
    function buildTreemapData(hierarchy) {
        Object.keys(hierarchy).forEach(function (city) {
            const totalFuelTypes = Object.values(hierarchy[city]).reduce((total, count) => total + count, 0);
    
            treemapChartData.labels.push(city);
            treemapChartData.parents.push("");
            treemapChartData.values.push(totalFuelTypes);
    
            Object.keys(hierarchy[city]).forEach(function (fuelType) {
                const fuelTypeCount = hierarchy[city][fuelType];
                const percentage = ((fuelTypeCount / totalFuelTypes) * 100).toFixed(0);
                const label = `${fuelType} (${percentage}%)`; // Display the percentage
                treemapChartData.labels.push(label);
                treemapChartData.parents.push(city);
                treemapChartData.values.push(fuelTypeCount);
            });
        });
    }
    
    buildTreemapData(cityFuelDistribution);

    // Create the treemap chart
    var treemapData = [treemapChartData];

    var treemapLayout = {
        margin: { l: 0, r: 0, b: 0, t: 0 },
        treemapcolorway: "Viridis", // colors array
        hoverlabel: {
            bgcolor: "#fff",
            bordercolor: "#000"
        }
    };

    // Render the treemap chart
    Plotly.newPlot("treemap-chart", treemapData, treemapLayout);
    console.log("Treemap chart rendered");

    // Convert city-fuel type distribution to pie chart data
    var pieChartData = buildPieChartData(cityFuelDistribution);

    function buildPieChartData(hierarchy) {
        var fuelTypeCounts = {};

        Object.keys(hierarchy).forEach(function (city) {
            Object.keys(hierarchy[city]).forEach(function (fuelType) {
                if (!fuelTypeCounts[fuelType]) {
                    fuelTypeCounts[fuelType] = hierarchy[city][fuelType];
                } else {
                    fuelTypeCounts[fuelType] += hierarchy[city][fuelType];
                }
            });
        });

        return Object.keys(fuelTypeCounts).map(function (fuelType) {
            return {
                label: fuelType,
                value: fuelTypeCounts[fuelType],
                color: getFuelTypeColor(fuelType) // Use the color mapping function here
            };
        });
    }

    // Create a pie chart for fuel type distribution
    var pieData = [{
        type: "pie",
        labels: pieChartData.map(item => item.label),
        values: pieChartData.map(item => item.value),
        hoverinfo: "label+value",
        textinfo: "percent",
        marker: {
            colors: pieChartData.map(item => item.color) // Use the color mapping here
        }
    }];

    var pieLayout = {
        margin: { l: 0, r: 0, b: 0, t: 30 },
    };

    // Render the pie chart
    Plotly.newPlot("pie-chart", pieData, pieLayout);
    console.log("Pie chart rendered");
});
