Timeline = function () {};


Timeline.prototype.drawTimeline = function(data) {
  var areaDiv = $("#timeLine");

  var margin = {top: areaDiv.height() - 80, right: 40, bottom: 20, left: 40},
      width = areaDiv.width() - margin.left - margin.right,
      height = areaDiv.height() - margin.top - margin.bottom;

  //Sets the scales 
  var x = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]);

  //Sets the axis 
  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left");

  //Assigns the brush to the chart's x axis
  var brush = d3.svg.brush()
          .x(x)
          .on("brush", brush);

  //Creates the chart        
      var area = d3.svg.area()
          .interpolate("step")
          .x(function (d) {
              return x(d.date);
          })
          .y0(height)
          .y1(function (d) {
              return y(d.count);
          });

  //Assigns the svg canvas to the area div
  var svg = d3.select("#timeLine").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

  //Defines the context area
  var context = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Initializes the axis domains for the chart
  x.domain(d3.extent(data.map(function(d) { return d.date; })));
  y.domain([d3.min(data.map(function(d) { return d.count; })), d3.max(data.map(function(d) { return d.count; }))]);

  //Appends the chart to the focus area        
  context.append("path")
          .datum(data)
          .style("fill", "red")
          .attr("d", area);

  //Appends the x axis 
  context.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

  //Appends the brush 
  context.append("g")
          .attr("class", "x brush")
          .call(brush)
          .selectAll("rect")
          .attr("y", -6)
          .attr("height", height + 7);


  //Method for brushing
  function brush() {
      x.domain(brush.empty() ? x.domain() : brush.extent());
  };
};