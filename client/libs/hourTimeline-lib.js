hourTimeline = function () {};

hourTimeline.prototype.drawTimeline = function(data) {
  var areaDiv = $("#hourTimeLine");

  var margin = { top: 15, right: 15, bottom: 20, left: 45 },
      width = areaDiv.width() - margin.left - margin.right,
      height = areaDiv.height() - margin.top - margin.bottom;

  //Sets the scales 
  var x = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]);

  //Sets the axis 
  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left").ticks([5]);

  //Sets the sliders position
  var sliderPosition = {x: 0, y: 0};

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
  var svg = d3.select("#hourTimeLine").append("svg")
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
      .attr("id", "slider")
      .data([sliderPosition])
      .call(drag);

  context.on("click", function() {
    moveSlider(d3.select("#slider")[0][0], ((d3.mouse(this)[0] / 2) - 6));
  });

  function dragMove(d) {
    sliderPosition.x += (d3.event.dx / 2);
    sliderPosition.x = Math.max(-6, Math.min(d.x, (width / 2) - 6));
    d3.select(this)
      .attr('x', sliderPosition.x)
      .attr("transform", "translate(" + sliderPosition.x + "," + sliderPosition.y + ")")
      .attr("opacity", 0.3);
  };

  function dragEnd(d) {
    d3.select(this)
      .attr('opacity', 0.6);
    chooseHour(d.x);
  };

  function moveSlider(d, mouseX) {
    d.setAttribute("x", mouseX);
    sliderPosition.x = mouseX;
    d.setAttribute("transform", "translate(" + mouseX + ",0)");
    chooseHour(mouseX);
  };

  function chooseHour(x) {
    var pos = (x + 6) / (width / 2);
    var limits = d3.extent(data.map(function(d) { return d.date; }));
    var millisec = Math.round(limits[0].getTime() + pos * (limits[1].getTime() - (limits[0].getTime())));

    var startHour = new Date();
    startHour.setTime(millisec);
    startHour = closestMinute(startHour);
    setHour(startHour);
  };

  function setHour(startHour) {
    startHour.setMinutes(0);
    startHour.setSeconds(0);
    startHour.setMilliseconds(0);

    var endHour = new Date(startHour.getTime());
    endHour.setMinutes(59);
    endHour.setSeconds(59);
    endHour.setMilliseconds(999);

    var endMin = new Date(startHour.getTime());
    endMin.setSeconds(59);
    endMin.setMilliseconds(999);

    var selectedHour = Session.get('selectedHour');
    selectedHour.params = [startHour, endHour];
    selectedHour.query = {resolution: 'minute'};
    Session.set('selectedHour', selectedHour);

    var taxiData = Session.get('dataContext');
    taxiData.params = [startHour, endMin];
    Session.set('dataContext', taxiData);
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