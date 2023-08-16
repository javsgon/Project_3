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

    // Convert city-fuel type hierarchy to sunburst chart data
    var sunburstChartData = {
        name: "Cities",
        children: buildSunburstData(cityFuelDistribution)
    };
    
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
        hoverinfo: "label+percent root",
        textinfo: "label+value+entry", // Show city name, number of fuel types, and fuel types on click
        textfont: { size: 13 },
    }];

    var sunburstLayout = {
        title: "Fuel Type Distribution within Cities",
        margin: { l: 0, r: 0, b: 0, t: 30 },
    };

    // Render the sunburst chart
    Plotly.newPlot("sunburst-chart", sunburstData, sunburstLayout);
    console.log("Sunburst chart rendered");

    // Convert city-fuel type distribution to pie chart data
    var pieChartData = buildPieChartData(cityFuelDistribution);

    function buildPieChartData(hierarchy) {
        var fuelTypeCounts = {};

        Object.keys(hierarchy).forEach(function(city) {
            Object.keys(hierarchy[city]).forEach(function(fuelType) {
                if (!fuelTypeCounts[fuelType]) {
                    fuelTypeCounts[fuelType] = hierarchy[city][fuelType];
                } else {
                    fuelTypeCounts[fuelType] += hierarchy[city][fuelType];
                }
            });
        });

        return Object.keys(fuelTypeCounts).map(function(fuelType) {
            return {
                label: fuelType,
                value: fuelTypeCounts[fuelType]
            };
        });
    }

    // Create a pie chart for fuel type distribution
    var pieData = [{
        type: "pie",
        labels: pieChartData.map(function(item) { return item.label; }),
        values: pieChartData.map(function(item) { return item.value; }),
        hoverinfo: "label+value",
        textinfo: "percent",
    }];

    var pieLayout = {
        title: "Fuel Type Distribution",
        margin: { l: 0, r: 0, b: 0, t: 30 },
    };

    // Render the pie chart
    Plotly.newPlot("pie-chart", pieData, pieLayout);
    console.log("Pie chart rendered");
});