// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });


    // Define the dimensions and margins for the SVG
    let width = 680, height = 500;

    let margin = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 150
    };

    // Create the SVG container
    let svg = d3
      .select("#boxplot")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "lightblue");

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    

    // Add scales     
    let yScale = d3.scaleLinear()
                   .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
                   .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleBand()
                   .domain([...new Set(data.map(d => d.Platform))])
                   .range([margin.left + 10, width])
                   .padding(0.5);

    // Add x-axis label
    let xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text('Platforms');

    // Add y-axis label
    let yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left + 10},0)`)
        .call(d3.axisLeft(yScale));

    yAxis.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Likes");
  

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, median, q3, max};
    };

    // Group the data by 'species' and compute statistical quartiles (min, Q1, median, Q3, max) for each species
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByGroups.forEach((quantiles, Platform) => {
        // Get the x-coordinate for the current species using the xScale
        const x = xScale(Platform);

        // Get the width of the box for the current species from the xScale's bandwidth
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3)) 
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3)) 
            .attr("fill", "violet") 
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
      d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;

    let margin = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 150
    };

    // Create the SVG container
    let svg = d3
      .select("#barplot")
      .append("svg")
        .attr("width", width + 60)
        .attr("height", height + margin.top + margin.bottom)
        .style("background", "lightyellow")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([0, width - margin.right])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes) * 1.2])
        .range([height - 20, 0]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y     
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .attr("transform", `translate(margin.left,0)`)
        .call(d3.axisLeft(y))

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2.5)
        .attr("y", height + margin.bottom - 40)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Platforms");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Likes");

    // Group container for bars
    const barGroups = svg.selectAll("bar")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.Platform)},0)`);
      
    // Draw bars
    barGroups.append("rect")
        .attr("x", d => x1(d.PostType))  
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));
            
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
      d.Date = new Date(d.Date);  
      d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;

    let margin = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 150
    };

    // Create the SVG container
    let svg = d3
      .select("#lineplot")
      .append("svg")
        .attr("width", width + 80)
        .attr("height", height + margin.top + margin.bottom + 50)
        .style("background", "lightgreen")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes  
    let xScale = d3.scaleTime()
      .domain([d3.min(data, d => d.Date), d3.max(data, d => d.Date)])
      .range([0, width]);

    let yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes)])
      .nice()
      .range([height, 0]);

    // Draw the axis, you can rotate the text in the x-axis here
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
        .ticks(data.length) 
        .tickFormat(d3.timeFormat("%m/%d/%y"))) 
        .selectAll("text")
        .attr("transform", "rotate(-25)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom + 10)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Likes");

    // Draw the line and path. Remember to use curveNatural. 
    let line = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

});
