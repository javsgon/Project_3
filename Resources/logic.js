// Load the CSV data
d3.csv("Resources/filtered_data.json").then(function(data) {
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

    Plotly.newPlot("sunburst-chart", sunburstData, sunburstLayout);
});