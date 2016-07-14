function formatMoney(n){
  var c = 2,
      d = '.',
      t = ',',
      s = n < 0 ? '-' : '',
      i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
      j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

var messageQueue = [],
    savedData,
    port;

function sendMessage(message) {
  if (port) {
    port.postMessage(message);
  } else {
    messageQueue.push(message);
  }
}

onmessage = function(e) {
  if (e.data === 'port:init') {
    port = e.ports[0];

    while (port && messageQueue.length) {
      sendMessage(messageQueue.pop());
    }
  }
}

var columnChart = function(chart, svg) {
  chart.margin = {top: 50, right: 20, bottom: 25, left: 20};
  chart.width = parseInt(d3.select('#container').style('width')) - chart.margin.right - chart.margin.left;
  chart.height = parseInt(d3.select('#container').style('height')) - chart.margin.top - chart.margin.bottom;

  svg.attr('width', chart.width + chart.margin.left + chart.margin.right)
     .attr('height', chart.height + chart.margin.top + chart.margin.bottom);

  svg = svg.append('g')
    .attr('transform', 'translate(' + chart.margin.left + ',' + chart.margin.top + ')');

  var monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var x = d3.scale.ordinal().rangeRoundBands([0, chart.width], .1);
  var y = d3.scale.linear().range([chart.height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(function(isoDay) {
      var d = new Date(Date.parse(isoDay));

      if (d.getUTCDay() === 0) {
        var month = monthsOfYear[d.getUTCMonth()];
        return month + ' ' + d.getUTCDate();
      }
    })
    .orient('bottom');

  // var yAxis = d3.svg.axis()
  //     .scale(y)
  //     .orient('left')
  //     .ticks(10, '$');

  function tooltipFn(data) {
    var isoDay = data.date;
    var d = new Date(Date.parse(isoDay));
    var month = monthsOfYear[d.getUTCMonth()];
    var dateString = month + ' ' + d.getUTCDate();
    return '<span class=\'date\'>' + dateString + '</span>' + '<br/><span> $' + formatMoney(data.total) + '</span>'
  }

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(tooltipFn);

  svg.call(tip);


  chart.processData = function(data) {
    x.domain(data.map(function(d) { return d.date; }));

    // Apply X-Axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + chart.height + ')')
        .call(xAxis)
      .selectAll('text')
        .attr('y', 14)
        .attr('x', 0)
        .attr('dy', '.35em')
        // .attr('transform', 'rotate(45)')
        .style('text-anchor', 'middle');

    // Hide some tick lines
    d3.selectAll('g.x.axis g.tick line')
      .attr('y2', function(isoDay){
        var d = new Date(Date.parse(isoDay));

        if (d.getUTCDay() === 0) {
          return 6;
        } else {
          return 0;
        }
      });

    y.domain([0, d3.max(data, function(d) { return Number(d.total); })]);
    // Apply yAxis
    // svg.append('g')
    //     .attr('class', 'y axis')
    //     .call(yAxis)
    //   .append('text')
    //     .attr('transform', 'rotate(-90)')
    //     .attr('y', 6)
    //     .attr('dy', '.71em')
    //     .style('text-anchor', 'end')
    //     .text('Earnings ($)');

    var defs = svg.append('defs');
    var grad = defs.append('linearGradient')
      .attr('id', 'Gradient')
      .attr('x1', '0')
      .attr('x2', '0')
      .attr('y1', '0')
      .attr('y2', chart.height)
      .attr('gradientUnits', 'userSpaceOnUse');

    grad.append('stop').attr('offset', '0%').attr('stop-color', '#d44061')
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#b538a8');

    var grad2 = defs.append('linearGradient')
      .attr('id', 'HoverGradient')
      .attr('x1', '0')
      .attr('x2', '0')
      .attr('y1', '0')
      .attr('y2', chart.height)
      .attr('gradientUnits', 'userSpaceOnUse');

    grad2.append('stop').attr('offset', '0%').attr('stop-color', '#d85574')
    grad2.append('stop').attr('offset', '100%').attr('stop-color', '#bf4cb3');

    svg.selectAll('.bar')
      .data(data)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) { return x(d.date); })
      .attr('width', x.rangeBand())
      // .attr('y', function(d) { return Math.min(height - 5, y(Number(d.total))); })
      // .attr('height', function(d) { return Math.max(5, height - y(Number(d.total))); })
      .attr('y', function(d) { return y(Number(d.total)); })
      .attr('height', function(d) { return chart.height - y(Number(d.total)); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

    sendMessage({source: 'blvd:charts', message: 'ready'});
  };

  return chart;
}

var pieChart = function(chart, svg) {
  chart.margin = {top: 0, right: 0, bottom: 0, left: 0};
  chart.width = parseInt(d3.select('#container').style('width')) - chart.margin.right - chart.margin.left;
  chart.height = parseInt(d3.select('#container').style('height')) - chart.margin.top - chart.margin.bottom;

  svg.attr('width', chart.width + chart.margin.left + chart.margin.right)
     .attr('height', chart.height + chart.margin.top + chart.margin.bottom);

  svg = svg.append("g")
    .attr("transform", "translate(" + chart.width / 2 + "," + chart.height / 2 + ")");

  svg.append("g")
    .attr("class", "slices");
  svg.append("g")
    .attr("class", "labelName");
  svg.append("g")
    .attr("class", "labelValue");
  svg.append("g")
    .attr("class", "lines");

  var radius = Math.min(chart.width, chart.height) / 2;
  var width = chart.width;
  var height = chart.height;

  var pie = d3.layout.pie()
  	.sort(null)
  	.value(function(d) {
  		return d.grossServiceRevenue;
  	});

  var arc = d3.svg.arc()
  	.outerRadius(radius * 0.8)
  	.innerRadius(radius * 0.4);

  var outerArc = d3.svg.arc()
  	.innerRadius(radius * 0.9)
  	.outerRadius(radius * 0.9);

  var div = d3.select("body").append("div").attr("class", "toolTip");


  var colorRange = d3.scale.category20();
  var color = d3.scale.ordinal()
  	.range(colorRange.range());

  chart.processData = function(data) {
    function groupData(d) {
      var rollup = {};
      var point;
      var totalGrossServiceRevenue = 0;
      for (var i = 0; i < d.length; i++) {
        point = d[i];
        totalGrossServiceRevenue += point.grossServiceRevenue;
        rollup[point.categoryName] = (rollup[point.categoryName] || 0) + point.grossServiceRevenue;
      }

      var res = [];

      Object.keys(rollup).forEach(function(key) {
        var percentage = Math.round(1000.0 * rollup[key] / totalGrossServiceRevenue) / 10.0;
        res.push({categoryName: key, grossServiceRevenue: rollup[key], percentage: percentage});
      });

      return res;
    };

    data = groupData(data);

  	/* ------- PIE SLICES -------*/
  	var slice = svg.select(".slices").selectAll("path.slice")
      .data(pie(data), function(d){ return d.data.categoryName });

    slice.enter()
      .insert("path")
      .style("fill", function(d) { return color(d.data.categoryName); })
      .attr("class", "slice");

    slice
      .transition().duration(1000)
      .attrTween("d", function(d) {
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function(t) {
            return arc(interpolate(t));
          };
      })
    slice
      .on("mousemove", function(d){
        div.style("left", d3.event.pageX+10+"px");
        div.style("top", d3.event.pageY-25+"px");
        div.style("display", "inline-block");
        div.html((d.data.categoryName)+"<br> $"+formatMoney(d.data.grossServiceRevenue));
      });
    slice
      .on("mouseout", function(d){
        div.style("display", "none");
      });

    slice.exit().remove();

    /* ------- LEGEND -------*/
    //
    // var legendRectSize = (radius * 0.05);
    // var legendSpacing = radius * 0.02;
    // var legend = svg.selectAll('.legend')
    // .data(color.domain())
    // .enter()
    // .append('g')
    // .attr('class', 'legend')
    // .attr('transform', function(d, i) {
    //   var height = legendRectSize + legendSpacing;
    //   var offset =  height * color.domain().length / 2;
    //   var horz = -3 * legendRectSize;
    //   var vert = i * height - offset;
    //   return 'translate(' + horz + ',' + vert + ')';
    // });
    //
    // legend.append('rect')
    //     .attr('width', legendRectSize)
    //     .attr('height', legendRectSize)
    //     .style('fill', color)
    //     .style('stroke', color);
    //
    // legend.append('text')
    //     .attr('x', legendRectSize + legendSpacing)
    //     .attr('y', legendRectSize - legendSpacing)
    //     .text(function(d) { return d; });

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labelName").selectAll("text")
      .data(pie(data), function(d){ return d.data.categoryName });

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function(d) {
        return (d.data.categoryName+": "+d.data.percentage+"%");
      });

    function midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
      .transition().duration(1000)
      .attrTween("transform", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate("+ pos +")";
        };
      })
      .styleTween("text-anchor", function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start":"end";
        };
      })
      .text(function(d) {
        return (d.data.categoryName+": "+d.data.percentage+"%");
      });


    text.exit()
      .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), function(d){ return d.data.categoryName });

    polyline.enter()
      .append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };
      });

    polyline.exit()
      .remove();

    sendMessage({source: 'blvd:charts', message: 'ready'});
  };

  return chart;
}

var chartObj;
function drawAll(svg) {
  if (!chartObj) {
    chartObj = {};
  }

  function dataResponse(error, data) {
    if (error) { throw error; }

    if (!savedData) {
      savedData = data;
      sendMessage({source: 'blvd:charts', message: 'data', data: data.data});
    }

    if (data.chart_type === 'donut') {
      console.log('initializing donut');
      pieChart(chartObj, svg);
    } else {
      columnChart(chartObj, svg);
    }

    chartObj.processData(data.data);
  }

  if (savedData) {
    dataResponse(null, savedData);
  } else {
    d3.json('chart-data.json' + window.location.search, dataResponse);
  }
}

var container = d3.select('#container');
drawAll(container);
d3.select(window).on('resize', function() {
  console.log('removing all g');
  container.selectAll('g').remove();
  drawAll(container);
});
