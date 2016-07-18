'use strict';
const EventBus = require('../eventBus');
const Formatters = require('../formatters');

module.exports = function pieChart(chart, svg) {
  chart.margin = {top: 0, right: 0, bottom: 0, left: 0};
  chart.width = parseInt(d3.select('#container').style('width')) - chart.margin.right - chart.margin.left;
  chart.height = parseInt(d3.select('#container').style('height')) - chart.margin.top - chart.margin.bottom;

  svg.attr('width', chart.width + chart.margin.left + chart.margin.right)
     .attr('height', chart.height + chart.margin.top + chart.margin.bottom);

  var g = svg.append("g")
    .attr("transform", "translate(" + chart.width / 2 + "," + chart.height / 2 + ")");

  g.append("g")
    .attr("class", "slices");
  g.append("g")
    .attr("class", "labels");
  g.append("g")
    .attr("class", "lines");

  var radius = Math.min(chart.width, chart.height) / 2;
  var width = chart.width;
  var height = chart.height;

  var pie = d3.pie()
  	.sort(null)
  	.value(function(d) { return d.grossServiceRevenue; });

  var arc = d3.arc()
  	.outerRadius(radius * 0.8)
  	.innerRadius(radius * 0.4);

  var outerArc = d3.arc()
  	.outerRadius(radius * 0.9)
  	.innerRadius(radius * 0.9);

  var div = d3.select("body").append("div").attr("class", "d3-tip");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  function tooltipFn(data) {
    var isoDay = data.date;
    var d = new Date(Date.parse(isoDay));
    var month = monthsOfYear[d.getUTCMonth()];
    var dateString = month + ' ' + d.getUTCDate();
    return '<span class=\'date\'>' + dateString + '</span>' + '<br/><span> $' + Formatters.formatMoney(data.total) + '</span>'
  }

  chart.processData = function(data) {
    var aggregationKey = data.meta.key;
    var aggregate = data.meta.aggregate;

    function groupData(d) {
      var rollup = {};
      var point;
      var totalAggregate = 0;

      for (var i = 0; i < d.length; i++) {
        point = d[i];
        totalAggregate += point[aggregate];
        rollup[point[aggregationKey]] = (rollup[point[aggregationKey]] || 0) + point[aggregate];
      }

      var res = [];

      Object.keys(rollup).forEach(function(aggregateKeyValue) {
        var percentage = Math.round(1000.0 * rollup[aggregateKeyValue] / totalAggregate) / 10.0;
        var row = {grossServiceRevenue: rollup[aggregateKeyValue], percentage: percentage};
        row[aggregationKey] = aggregateKeyValue;
        res.push(row);
      });

      return res;
    };

    data = groupData(data.data);

  	/* ------- PIE SLICES -------*/
  	var slice = g.select(".slices").selectAll("path.slice").data(function(d){ return pie(data); });

    slice.enter()
      .insert("path")
      .attr("d", arc.outerRadius(radius).innerRadius(radius * 0.6))
      .style("fill", function(d) { return color(d.data[aggregationKey]); })
      .attr("class", "slice")
      .on("mousemove", function(d){
        div.style("left", d3.event.pageX+10+"px");
        div.style("top", d3.event.pageY-25+"px");
        div.style("display", "inline-block");
        div.html('<span class=\'date\'>' + d.data[aggregationKey] + '</span>' + '<br/><span> $' + Formatters.formatMoney(d.data[aggregate]) + '</span>');
      })
      .on("mouseout", function(d){
        div.style("display", "none");
      });

    slice.exit()
      .remove();


	/* ------- TEXT LABELS -------*/

    // var key = function(d){ return d.data[aggregationKey]; };
    var textFn = function(d) { return (d.data[aggregationKey]+": "+d.data.percentage+"%"); };

    var text = g.select('.labels').selectAll('text').data(function(d){ return pie(data); });

    function midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.enter()
      .append('text')
      .attr('dy', '.35em')
      .text(textFn)
      .attr('transform', function(d) {
        var pos = outerArc.centroid(d);
        pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
      })
      .attr('text-anchor', function(d) {
        return midAngle(d) < Math.PI ? "start":"end";
      });

    text.exit()
  		.remove();


    /* ------- SLICE TO TEXT POLYLINES -------*/

  	var polyline = svg.select(".lines").selectAll("polyline").data(function(d){ return pie(data); });

  	polyline.enter()
  		.append('polyline')
      .attr('points', function(d) {
  			var pos = outerArc.centroid(d);
  			pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
  			return [arc.centroid(d), outerArc.centroid(d), pos].join(',');
  		});

  	polyline.exit()
  		.remove();

    EventBus.emit({source: 'blvd:charts', message: 'ready'});
  };

  return chart;
};
