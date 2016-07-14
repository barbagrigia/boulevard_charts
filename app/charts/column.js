'use strict';
const EventBus = require('../eventBus');
const Formatters = require('../formatters');

module.exports = function columnChart(chart, svg) {
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
    return '<span class=\'date\'>' + dateString + '</span>' + '<br/><span> $' + Formatters.formatMoney(data.total) + '</span>'
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

    EventBus.emit({source: 'blvd:charts', message: 'ready'});
  };

  return chart;
};
