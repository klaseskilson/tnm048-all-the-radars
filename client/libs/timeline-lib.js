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
      yAxis = d3.svg.axis().scale(y).orient("left")
       .ticks([5]);

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

  //Create drag variable to move the slider
  var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", dragMove)
    .on('dragend', dragEnd);

  context.append('rect')
    .attr("height", 25)
    .attr("width", 25)
    .attr("fill", "#2394F5")
    .data([{x: 0, y:0}])
    .call(drag);

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

  context.append("g")
            .attr("class", "y axis")
            .call(yAxis);

  function dragMove(d) {
    d.x += (d3.event.dx / 2);
    d.x = Math.max(-5, Math.min(d.x, (width / 2) - 5));
    d3.select(this)
        .attr('x', d.x)
        .attr('y', d.y)
        .attr("transform", "translate(" + d.x + "," + d.y + ")")
        .attr("opacity", 0.6);
  };

  function dragEnd(d) {
      d3.select(this)
        .attr('opacity', 1);
      chooseMinute(d.x);
  };

  function chooseMinute(x) {
    var pos = (x + 5) / (width / 2);
    var limits = d3.extent(data.map(function(d) { return d.date; }));
    var millisecond = Math.round(limits[0].getTime() + pos * (limits[1].getTime() - (limits[0].getTime())));
    var selectedMinute = new Date();
    selectedMinute.setTime(millisecond);
  };
};