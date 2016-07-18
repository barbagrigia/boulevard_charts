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
    .attr("class", "labelName");
  g.append("g")
    .attr("class", "labelValue");
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
  	.innerRadius(radius * 0.9)
  	.outerRadius(radius * 0.9);

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
    var aggregationKey = data.aggregation.key;
    var aggregate = data.aggregation.aggregate;

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

    // var text = g.select(".labelName").selectAll("text")
    //   .data(pie(data), function(d){ return d.data[aggregationKey] });
    //
    // text.enter()
    //   .append("text")
    //   .attr("dy", ".35em")
    //   .text(function(d) {
    //     return (d.data[aggregationKey]+": "+d.data.percentage+"%");
    //   });
    //
    // function midAngle(d){
    //   return d.startAngle + (d.endAngle - d.startAngle)/2;
    // }
    //
    // text
    //   .transition().duration(1000)
    //   .attrTween("transform", function(d) {
    //     this._current = this._current || d;
    //     var interpolate = d3.interpolate(this._current, d);
    //     this._current = interpolate(0);
    //     return function(t) {
    //       var d2 = interpolate(t);
    //       var pos = outerArc.centroid(d2);
    //       pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
    //       return "translate("+ pos +")";
    //     };
    //   })
    //   .styleTween("text-anchor", function(d){
    //     this._current = this._current || d;
    //     var interpolate = d3.interpolate(this._current, d);
    //     this._current = interpolate(0);
    //     return function(t) {
    //       var d2 = interpolate(t);
    //       return midAngle(d2) < Math.PI ? "start":"end";
    //     };
    //   })
    //   .text(function(d) {
    //     return (d.data[aggregationKey]+": "+d.data.percentage+"%");
    //   });
    //
    //
    // text.exit()
    //   .remove();

    EventBus.emit({source: 'blvd:charts', message: 'ready'});
  };

  return chart;
};
