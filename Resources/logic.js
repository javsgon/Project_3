// Load the CSV data
d3.csv("Resources/filtered_data.csv").then(function(data) {
    console.log("Loaded data:", data);

    // Process the data to get the required information

    // Create a dictionary to store city-fuel type distribution
    var cityFuelDistribution = {};

    data.forEach(function(entry) {
        var city = entry["City"];
        var fuelType = entry["Fuel Type Code"];

        // Initialize the city-fuel type hierarchy
        if (!cityFuelDistribution[city]) {
            cityFuelDistribution[city] = {};
        }

        // Increment fuel type count within the city
        if (!cityFuelDistribution[city][fuelType]) {
            cityFuelDistribution[city][fuelType] = 1;
        } else {
            cityFuelDistribution[city][fuelType]++;
        }
    });

    console.log("cityFuelDistribution:", cityFuelDistribution);

    // Convert city-fuel type hierarchy to sunburst chart data
    var sunburstChartData = {
        name: "Cities",
        children: buildSunburstData(cityFuelDistribution)
    };

    // Create a function to build sunburst chart data recursively
    function buildSunburstData(hierarchy) {
        return Object.keys(hierarchy).map(function(city) {
            return {
                name: city,
                children: Object.keys(hierarchy[city]).map(function(fuelType) {
                    return {
                        name: fuelType,
                        size: hierarchy[city][fuelType]
                    };
                })
            };
        });
    }

    console.log("sunburstChartData:", sunburstChartData);

    // Create a sunburst chart for city-fuel type distribution
    var sunburstData = [{
        type: "sunburst",
        labels: sunburstChartData.children.map(function(city) { return city.name; }),
        parents: sunburstChartData.children.map(function(city) { return "Cities"; }),
        values: sunburstChartData.children.map(function(city) {
            return city.children.reduce(function(acc, fuelType) {
                return acc + fuelType.size;
            }, 0);
        }),
        hoverinfo: "label+text+value",
        textinfo: "percent root+label",
        textfont: { size: 13 },
    }];

    var sunburstLayout = {
        title: "Fuel Type Distribution within Cities",
        margin: { l: 0, r: 0, b: 0, t: 30 },
    };

    console.log("sunburstData:", sunburstData);

    // Render the sunburst chart
    Plotly.newPlot("sunburst-chart", sunburstData, sunburstLayout);
    console.log("Sunburst chart rendered");

    // Extract unique fuel types from the data
    var uniqueFuelTypes = Array.from(new Set(data.map(entry => entry["Fuel Type Code"])));

    // Add "All" option to both dropdowns
    uniqueFuelTypes.unshift("All");

    // Populate dropdowns with fuel types
    var donutFuelTypeSelect = document.getElementById("donut-fuel-type-select");
    var sunburstFuelTypeSelect = document.getElementById("sunburst-fuel-type-select");

    uniqueFuelTypes.forEach(function(fuelType) {
        var option = document.createElement("option");
        option.value = fuelType;
        option.text = fuelType;
        donutFuelTypeSelect.appendChild(option.cloneNode(true));
        sunburstFuelTypeSelect.appendChild(option.cloneNode(true));
    });

    // Add event listener for donut chart fuel type dropdown
    document.getElementById("donut-fuel-type-select").addEventListener("change", function(event) {
        var selectedFuelType = event.target.value;
        console.log("Selected fuel type for donut chart:", selectedFuelType);
        // Update the donut chart based on the selected fuel type
        updateDonutChart(selectedFuelType);
    });

    // Add event listener for sunburst chart fuel type dropdown
    document.getElementById("sunburst-fuel-type-select").addEventListener("change", function(event) {
        var selectedFuelType = event.target.value;
        console.log("Selected fuel type for sunburst chart:", selectedFuelType);
        // Update the sunburst chart based on the selected fuel type
        updateSunburstChart(selectedFuelType);
    });

    // Function to update donut chart based on selected fuel type
    function updateDonutChart(selectedFuelType) {
        console.log("Updating donut chart with selected fuel type:", selectedFuelType);
        // Update the donut chart based on the selected fuel type
        // Example: Call a function to updateDonutChart(selectedFuelType);
    }

    // Function to update sunburst chart based on selected fuel type
    function updateSunburstChart(selectedFuelType) {
        console.log("Updating sunburst chart with selected fuel type:", selectedFuelType);
        // Filter the sunburstChartData based on selected fuel type
        var filteredChartData = {
            name: "Cities",
            children: sunburstChartData.children.map(function(city) {
                return {
                    name: city.name,
                    children: city.children.filter(function(fuel) {
                        return selectedFuelType === "All" || fuel.name === selectedFuelType;
                    })
                };
            })
        };

        // Update sunburst chart data and redraw
        var updatedSunburstData = [{
            type: "sunburst",
            labels: filteredChartData.children.map(function(city) { return city.name; }),
            parents: filteredChartData.children.map(function(city) { return "Cities"; }),
            values: filteredChartData.children.map(function(city) {
                return city.children.reduce(function(acc, fuelType) {
                    return acc + fuelType.size;
                }, 0);
            }),
            hoverinfo: "label+text+value",
            textinfo: "percent root+label",
            textfont: { size: 13 },
        }];

        console.log("Updating sunburst chart data:", updatedSunburstData);
        Plotly.react("sunburst-chart", updatedSunburstData, sunburstLayout);
        console.log("Sunburst chart updated");
    }
});