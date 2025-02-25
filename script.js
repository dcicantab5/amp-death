// Set the dimensions and margins of the graph
const margin = {top: 40, right: 120, bottom: 180, left: 60},
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append the svg object to the div
const svg = d3.select("#visualization")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Get the tooltip div
const tooltip = d3.select("#tooltip");

// Load and process the data
d3.json("data.json").then(function(data) {
  
  // Sort hospitals by death rate
  data.sort((a, b) => a.deathRate - b.deathRate);
  
  // Calculate average death rate
  const avgDeathRate = d3.mean(data, d => d.deathRate);
  
  // Create X scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.name.split(" ").slice(0, 2).join(" "))) // Use first 2 words of name
    .range([0, width])
    .padding(0.2);
  
  // Create Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.deathRate) * 1.1]) // Add 10% padding at top
    .range([height, 0]);
  
  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "10px");
  
  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(y));
  
  // Add Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Death Rate (%)");
  
  // Add horizontal average line
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(avgDeathRate))
    .attr("y2", y(avgDeathRate))
    .attr("stroke", "#999")
    .attr("stroke-dasharray", "4")
    .attr("stroke-width", 1);
  
  // Add average line label
  svg.append("text")
    .attr("x", width)
    .attr("y", y(avgDeathRate) - 5)
    .attr("text-anchor", "end")
    .style("font-size", "10px")
    .style("fill", "#666")
    .text(`Average: ${avgDeathRate.toFixed(2)}%`);
  
  // Add dots
  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.name.split(" ").slice(0, 2).join(" ")) + x.bandwidth() / 2)
      .attr("cy", d => y(d.deathRate))
      .attr("r", d => d.name === "HOSPITAL AMPANG" ? 8 : 6)
      .style("fill", d => {
        if (d.name === "HOSPITAL AMPANG") return "#e41a1c"; // Red for Ampang
        return d.deathRate > avgDeathRate ? "#377eb8" : "#4daf4a"; // Blue for above average, green for below
      })
      .style("opacity", d => d.name === "HOSPITAL AMPANG" ? 1 : 0.7)
      .style("stroke", d => d.name === "HOSPITAL AMPANG" ? "#333" : "none")
      .style("stroke-width", 1)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", d.name === "HOSPITAL AMPANG" ? 10 : 8)
          .style("opacity", 1);
        
        tooltip
          .style("visibility", "visible")
          .html(`
            <strong>${d.name}</strong><br/>
            State: ${d.state}<br/>
            Death Rate: ${d.deathRate.toFixed(2)}%<br/>
            Discharges: ${d.discharges.toLocaleString()}<br/>
            Deaths: ${d.deaths.toLocaleString()}<br/>
            Bed Occupancy: ${d.bedOccupancy.toFixed(2)}%
          `);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .attr("r", d.name === "HOSPITAL AMPANG" ? 8 : 6)
          .style("opacity", d.name === "HOSPITAL AMPANG" ? 1 : 0.7);
        
        tooltip.style("visibility", "hidden");
      });
  
  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 100}, 15)`);
  
  // Ampang
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 6)
    .style("fill", "#e41a1c");
  
  legend.append("text")
    .attr("x", 10)
    .attr("y", 4)
    .text("Hospital Ampang")
    .style("font-size", "10px");
  
  // Above Average
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("r", 6)
    .style("fill", "#377eb8")
    .style("opacity", 0.7);
  
  legend.append("text")
    .attr("x", 10)
    .attr("y", 24)
    .text("Above Average")
    .style("font-size", "10px");
  
  // Below Average
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 40)
    .attr("r", 6)
    .style("fill", "#4daf4a")
    .style("opacity", 0.7);
  
  legend.append("text")
    .attr("x", 10)
    .attr("y", 44)
    .text("Below Average")
    .style("font-size", "10px");
  
  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "right")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Death Rates of Hospitals with Similar Discharge Numbers");
});
