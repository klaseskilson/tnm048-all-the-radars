minTimeline = function () {};

minTimeline.prototype.drawTimeline = function(data) {
  var areaDiv = $("#minTimeLine");

  var margin = { top: 15, right: 35, bottom: 20, left: 30 },
      width = areaDiv.width() - margin.left - margin.right,
      height = areaDiv.height() - margin.top - margin.bottom;

  //Sets the scales 
  var x = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]);

  //Sets the axis 
  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5),
      yAxis = d3.svg.axis().scale(y).orient("left").ticks([5]);

  //Sets the sliderMins position
  var sliderMinPosition = {x: 0, y: 0};

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

  //Clear old data from the div
  d3.select("#minTimeLine").html("");
  d3.select("#minTimeLine").selectAll("*").remove();

  //Assigns the svg canvas to the area div
  var svg = d3.select("#minTimeLine").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  //Defines the context area
  var context = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Initializes the axis domains for the chart
  x.domain(d3.extent(data.map(function(d) { return d.date; })));
  y.domain([d3.min(data.map(function(d) { return d.count; })), d3.max(data.map(function(d) { return d.count; }))]);

  //Create drag variable to move the sliderMin
  var drag = d3.behavior.drag()
      .origin(Object)
      .on("drag", dragMove)
      .on('dragend', dragEnd);

  context.append("rect")
      .attr("height", height)
      .attr("width", width)
      .attr("opacity", 0);

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

  context.append('rect')
      .attr("height", height)
      .attr("width", 25)
      .attr("fill", "#2394F5")
      .attr("opacity", 0.6)
      .attr("id", "sliderMin")
      .data([sliderMinPosition])
      .call(drag);

  context.on("click", function() {
    moveSliderMin(d3.select("#sliderMin")[0][0], ((d3.mouse(this)[0] / 2) - 6));
  });

  function dragMove(d) {
    sliderMinPosition.x += (d3.event.dx / 2);
    sliderMinPosition.x = Math.max(-6, Math.min(d.x, (width / 2) - 6));
    d3.select(this)
      .attr('x', sliderMinPosition.x)
      .attr("transform", "translate(" + sliderMinPosition.x + "," + sliderMinPosition.y + ")")
      .attr("opacity", 0.3);
  };

  function dragEnd(d) {
    d3.select(this)
      .attr('opacity', 0.6);
    chooseMin(d.x);
  };

  function moveSliderMin(d, mouseX) {
    d.setAttribute("x", mouseX);
    sliderMinPosition.x = mouseX;
    d.setAttribute("transform", "translate(" + mouseX + ",0)");
    chooseMin(mouseX);
  };

  function chooseMin(x) {
    var pos = (x + 6) / (width / 2);
    var limits = d3.extent(data.map(function(d) { return d.date; }));
    var millisec = Math.round(limits[0].getTime() + pos * (limits[1].getTime() - (limits[0].getTime())));

    var startMin = new Date();
    startMin.setTime(millisec);
    startMin = closestMinute(startMin);
    setMinute(startMin);
  };


  function setMinute(startMin) {
    startMin.setSeconds(0);
    startMin.setMilliseconds(0);

    var endMin = new Date(startMin.getTime());
    endMin.setSeconds(59);
    endMin.setMilliseconds(999);

    Session.set('selectedTaxiId', null);

    var dataContext = Session.get('mapDataContext');
    dataContext.range = [startMin, endMin];
    dataContext.query = {};
    Session.set('mapDataContext', dataContext);
  };

  function closestMinute(testDate) {
    var bestDate = data[0].date;
    var bestDiff = Infinity;
    var currDiff = 0;

    for(var i = 0; i < data.length; ++i) {
      currDiff = Math.abs(data[i].date - testDate);
      if(currDiff < bestDiff){
        bestDate = data[i].date;
        bestDiff = currDiff;
      }
    }
    return bestDate;
  }
};