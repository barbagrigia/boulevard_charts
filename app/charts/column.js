'use strict';
const EventBus = require('../eventBus');
const Formatters = require('../formatters');

module.exports = function columnChart(chart, svg) {
  chart.margin = {top: 50, right: 20, bottom: 25, left: 20};
  chart.width = parseInt(d3.select('#container').style('width')) - chart.margin.right - chart.margin.left;
  chart.height = parseInt(d3.select('#container').style('height')) - chart.margin.top - chart.margin.bottom;

  svg.attr('width', chart.width + chart.margin.left + chart.margin.right)
     .attr('height', chart.height + chart.margin.top + chart.margin.bottom);

  var g = svg.append('g')
    .attr('transform', 'translate(' + chart.margin.left + ',' + chart.margin.top + ')');

  var monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var x = d3.scaleBand()
    .rangeRound([0, chart.width])
    .padding(0.1)
    .align(0.1);

  var y = d3.scaleLinear().rangeRound([chart.height, 0]);

  var tooltipDiv = d3.select("body").append("div").attr("class", "d3-tip");

  function pluralize(value, labels) {
    return `${value} ${value === 1 ? labels.singular : labels.plural}`;
  }

  function tooltipFn(data, meta) {
    var tip = ''
    if (meta.x.datatype === 'date') {
      var isoDay = data.date;
      var d = new Date(Date.parse(isoDay));
      var month = monthsOfYear[d.getUTCMonth()];
      var dateString = month + ' ' + d.getUTCDate();
      tip += `<span class='date'>${dateString}</span><br/>`;
    } else {
      tip += `<span class='date'>${pluralize(data.visits, meta.x.label)}</span><br/>`;
    }

    if (meta.y.datatype === 'money') {
      tip += `<span>$${Formatters.formatMoney(data.total)}</span>`
    } else {
      tip += `<span>${data[meta.y.property]}</span>`;
    }

    return tip;
  }

  var stack = d3.stack();

  chart.processData = function(chartDescription) {
    var data = chartDescription.data;
    var yKey = chartDescription.meta.y;
    var xKey = chartDescription.meta.x;

    x.domain(data.map(function(d) { return d[xKey.property]; }));
    y.domain([0, d3.max(data, function(d) { return Number(d[yKey.property]); })]).nice();

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

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect").attr('class', 'bar')
        .attr("x", function(d) { return x(d[xKey.property]); })
        .attr("y", function(d) { return y(d[yKey.property]); })
        .attr("height", function(d) { return chart.height - y(Number(d[yKey.property])); })
        .attr("width", x.bandwidth())
        .on("mousemove", function(d){
          tooltipDiv.style("left", d3.event.pageX+10+"px");
          tooltipDiv.style("top", d3.event.pageY-25+"px");
          tooltipDiv.style("display", "inline-block");
          tooltipDiv.html(tooltipFn(d, chartDescription.meta));
        })
        .on("mouseout", function(d){
          tooltipDiv.style("display", "none");
        });

    g.append("g")
     .attr("class", "axis axis--x")
     .attr("transform", "translate(0," + chart.height + ")")
     .call(d3.axisBottom(x).tickFormat(function(xValue) {
       if (xKey.datatype === 'date') {
         var d = new Date(Date.parse(xValue));

         if (d.getUTCDay() === 0) {
           var month = monthsOfYear[d.getUTCMonth()];
           return month + ' ' + d.getUTCDate();
         }
       } else {
         return xValue;
       }
     }));

     if (xKey.datatype === 'date') {
       // Hide some tick lines
       d3.selectAll('g.axis--x g.tick line')
         .attr('y2', function(isoDay){
           var d = new Date(Date.parse(isoDay));

           if (d.getUTCDay() === 0) {
             return 6;
           } else {
             return 0;
           }
         });
     }

    EventBus.emit({source: 'blvd:charts', message: 'ready'});
  };

  return chart;
};
