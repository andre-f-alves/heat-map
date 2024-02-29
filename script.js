import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

const endpoint = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

const data = await d3.json(endpoint)

const [ minYear, maxYear ] = d3.extent(data.monthlyVariance, item => item.year)

d3.select('#description')
  .text(`${minYear} - ${maxYear}: base temperature ${data.baseTemperature}°C`)

const width = 1200
const height = 700
const padding = 30

const svg = d3.select('.svg-container')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

const xScale = d3.scaleTime(
  [new Date(minYear, 0), new Date(maxYear, 0)],
  [padding, width - padding]
)

svg.append('g')
  .attr('transform', `translate(0, ${height - padding})`)
  .call(d3.axisBottom(xScale).ticks(20))
