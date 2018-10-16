// Grab the width of the containing box
var width = parseInt(d3.select("#scatter").style("width"));

// Designate the height of the graph
var height = width - width / 3.9;

// Margin spacing for graph
var margin = 20;

//space for placing words
var labelArea = 110;

// padding for the text at the bottom and left axes
var tPadBot = 40;
var tPadLeft = 40;

//Create the actual canvas for the graph
var svg = d3
	.select("#scatter")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
    .attr("class", "chart");
    

// Set the radius for each dot that will appear in the graph
// Note: Making this a function allows us to easily call
// it in the mobility section of our code.
var circRadius;
function crGet() {
	if (width <= 530) {
		circRadius = 5;
	}
	else {
		circRadius = 10;
	}
}
crGet();

// The Labels for our Axes

// A) Bottom Axis
// ==============

// We create a group element to nest our bottom axes labels.
svg.append("g").attr("class","xText");
// xText will allow us to select the group without excess code
var xText = d3.select(".xText");

// We give xText a transform property that places it at the bottom of the chart.
// By nesting this attribute in a function, we can easily change the location of the label group
// whenever the width of the window changes.
function xTextRefresh() {
	xText.attr(
		"transform",
		"translate(" +
		((width - labelArea) / 2 + labelArea) +
		", " +
		(height - margin - tPadBot) +
		")"
	);
}
xTextRefresh();

// Now we use XText to append three text SVGs, with y coordinates sp
// 1. Poverty
xText
	.append("text")
	.attr("y", -26)
	.attr("data-name", "poverty")
	.attr("data-axis", "x")
	.attr("class", "aText active x")
	.text("In Poverty (%)");

// 2. Age
xText
	.append("text")
	.attr("y", 0)
	.attr("data-name", "age")
	.attr("class", "aText inactive x")
	.text("Age (Median)");

// 3. Income
xText
	.append("text")
	.attr("y", 26)
	.attr("data-name", "income")
	.attr("data-axis", "x")
	.attr("class", "aText inactive x")
	.text("Household Income (Median)");

// B) Left Axis
// ============

// Specifying the variables like this allows us to make our transform 
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// We add a second label group, this time for the axis left of the chart.
svg.append("g").attr("class","yText");

// yText will allows us to select group without excess code.
var yText = d3.select(".yText");

// Like before, we nest the group's transform attr in a function
// to make changing it on window change an easy operation
function yTextRefresh() {
	yText.attr(
	"transform",
	"translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
	);
}
yTextRefresh();

// Now we append the text.
// 1. Obesity
yText
	.append("text")
	.attr("y", -26)
	.attr("data-name","obesity")
	.attr("data-axis","y")
	.attr("class", "aText active y")
	.text("Obese (%)");

// 2. Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// 3. Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

 

 
// 2. Import our .csv files
// ============
// Import our CSV data with d3's .csv import method.
d3.csv("data.csv").then(function(healthData) {
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.phys_act = +data.phys_act;
        
    });

    var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      // x key
      var theX;
      // Grab the state name.
      var theState = "<div>" + d.state + "</div>";
      // Snatch the y value's key and value.
      var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
      // If the x key is poverty
      if (curX === "poverty") {
        // Grab the x key and a version of the value formatted to show percentage
        theX = "<div>" + curX + ": " + d[curX] + "%</div>";
      }
      else {
        // Otherwise
        // Grab the x key and a version of the value formatted to include commas after every third digit.
        theX = "<div>" +
          curX +
          ": " +
          parseFloat(d[curX]).toLocaleString("en") +
          "</div>";
      }
      // Display what we capture.
      return theState + theX + theY;
    });
  // Call the toolTip function.
  svg.call(toolTip)
     // min will grab the smallest datum from the selected column.
  xMin = d3.min(healthData, function(d) {
    return parseFloat(d.poverty) * 0.90;
  });

  // .max will grab the largest datum from the selected column.
  xMax = d3.max(healthData, function(d) {
    return parseFloat(d.obesity) * 1.10;
  });

  var xScale = d3
  .scaleLinear()
  .domain([xMin, xMax])
  .range([margin + labelArea, width - margin]);
var yScale = d3
  .scaleLinear()
  .domain([yMin, yMax])
  // Height is inverses due to how d3 calc's y-axis placement
  .range([height - margin - labelArea, margin]);

    // Now let's make a grouping for our dots and their labels.
var theCircles = svg.selectAll("g theCircles").data(healthData).enter();

// We append the circles for each row of data (or each state, in this case).
theCircles
  .append("circle")
  // These attr's specify location, size and class.
  .attr("cx", function(d) {
    return xScale(d.poverty);
  })
  .attr("cy", function(d) {
    return yScale(d.obesity);
  })
  .attr("r", circRadius)
  .attr("class", function(d) {
    return "stateCircle " + d.abbr;
  })
  // Hover rules
  .on("mouseover", function(d) {
    // Show the tooltip
    toolTip.show(d, this);
    // Highlight the state circle's border
    d3.select(this).style("stroke", "#323232");
  })
  .on("mouseout", function(d) {
    // Remove the tooltip
    toolTip.hide(d);
    // Remove highlight
    d3.select(this).style("stroke", "#e3e3e3");
  });

// With the circles on our graph, we need matching labels.
// Let's grab the state abbreviations from our data
// and place them in the center of our dots.
theCircles
  .append("text")
  // We return the abbreviation to .text, which makes the text the abbreviation.
  .text(function(d) {
    return d.abbr;
  })
  // Now place the text using our scale.
  .attr("dx", function(d) {
    return xScale(d.poverty);
  })
  .attr("dy", function(d) {
    // When the size of the text is the radius,
    // adding a third of the radius to the height
    // pushes it into the middle of the circle.
    return yScale(d.obesity) + circRadius / 2.5;
  })
  .attr("font-size", circRadius)
  .attr("class", "stateText")
  // Hover Rules
  .on("mouseover", function(d) {
    // Show the tooltip
    toolTip.show(d);
    // Highlight the state circle's border
    d3.select("." + d.abbr).style("stroke", "#323232");
  })
  .on("mouseout", function(d) {
    // Remove tooltip
    toolTip.hide(d);
    // Remove highlight
    d3.select("." + d.abbr).style("stroke", "#e3e3e3");
  });


/// Create scale functions
var yLinearScale = d3.scaleLinear().range([height, 0]);
var xLinearScale = d3.scaleLinear().range([0, width]);

// Create axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// Scale the domain
var xMin;
var xMax;
var yMin;
var yMax;

xMin = d3.min(healthData, function(data) {
    return +data.poverty * 0.95;
});

xMax = d3.max(healthData, function(data) {
    return +data.poverty * 1.05;
});

yMin = d3.min(healthData, function(data) {
    return +data.phys_act * 0.98;
});

yMax = d3.max(healthData, function(data) {
    return +data.phys_act *1.02;
});

xLinearScale.domain([xMin, xMax]);
yLinearScale.domain([yMin, yMax]);



// Append y-axis label
svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-margin.left + 40)
    .attr("x", 0 - height/2)
    .attr("dy","1em")
    .attr("class", "axis-text")
    .text("Physically Active (%)")

// Append x-axis labels
svg
    .append("text")
    .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 30) + ")"
    )
    .attr("class", "axis-text")
    .text("In Poverty (%)");
});

