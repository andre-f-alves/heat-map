import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

const endpoint = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

const data = await d3.json(endpoint)

const [minYear, maxYear] = d3.extent(data.monthlyVariance, item => item.year)

d3.select('#description')
  .text(`${minYear} - ${maxYear}: base temperature ${data.baseTemperature}°C`)

const width = 1200
const height = 700
const padding = 60

const svg = d3.select('.svg-container')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

const xScale = d3.scaleLinear(
  [minYear, maxYear],
  [padding, width - padding]
)

const yScale = d3.scaleBand(
  Array(12).fill(0).map((_, index) => index),
  [height - padding, padding]
)

const xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.format(''))
  .ticks(20)

const yAxis = d3.axisLeft(yScale)
  .tickFormat(number => {
    const month = d3.timeMonth().setMonth(number)
    return d3.timeFormat('%B')(month)
  })

svg.append('g')
  .attr('transform', `translate(0, ${height - padding})`)
  .call(xAxis)

svg.append('g')
  .attr('transform', `translate(${padding}, 0)`)
  .call(yAxis)
