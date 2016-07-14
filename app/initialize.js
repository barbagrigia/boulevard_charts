'use strict';

const pieChart = require('./charts/pie');
const columnChart = require('./charts/column');
const EventBus = require('./eventBus');

var savedData;
// document.addEventListener('DOMContentLoaded', () => {
//   // do your setup here
//   console.log('Initialized app');
// });


var chartObj;
function drawAll(svg) {
  if (!chartObj) {
    chartObj = {};
  }

  function dataResponse(error, data) {
    if (error) { throw error; }

    if (!savedData) {
      savedData = data;
      EventBus.emit({source: 'blvd:charts', message: 'data', data: data.data});
    }

    if (data.chart_type === 'donut') {
      pieChart(chartObj, svg);
    } else {
      columnChart(chartObj, svg);
    }

    chartObj.processData(data);
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
  container.selectAll('g').remove();
  drawAll(container);
});
