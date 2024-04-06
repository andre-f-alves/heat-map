import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

const endpoint = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

const data = await d3.json(endpoint)

const [minYear, maxYear] = d3.extent(data.monthlyVariance, item => item.year)

d3.select('#description')
  .text(`${minYear} - ${maxYear}: base temperature ${data.baseTemperature}°C`)

const tooltip = d3.select('.svg-container')
  .append('div')
  .classed('tooltip', true)
  .attr('id', 'tooltip')

const width = 1800
const height = 600
const padding = 60

const svg = d3.select('.svg-container')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

const years = data.monthlyVariance.filter((item, index, array) => {
  return index === 0 || item.year !== array[index - 1].year
}).map(item => item.year)

const xScale = d3.scaleBand(years, [padding, width - padding])

const months = Array(12).fill(0).map((_, index) => index)

const yScale = d3.scaleBand(months, [height - padding, padding])

const xAxis = d3.axisBottom(xScale)
  .tickValues(years.filter(year => year % 10 === 0))
  .tickFormat(d3.format(''))

const yAxis = d3.axisLeft(yScale)
  .tickFormat(number => {
    const month = d3.timeMonth().setMonth(number)
    return d3.timeFormat('%B')(month)
  })

const colorScheme = d3.reverse(d3.schemeRdYlBu[11])
const temperatures = d3.extent(data.monthlyVariance, (item) => item.variance)

const colorScale = d3.scaleQuantize(temperatures, colorScheme)

svg.append('g')
  .attr('id', 'x-axis')
  .attr('transform', `translate(0, ${height - padding})`)
  .call(xAxis)

svg.append('g')
  .attr('id', 'y-axis')
  .attr('transform', `translate(${padding}, 0)`)
  .call(yAxis)

const rects = svg.selectAll('rect.cell')
  .data(data.monthlyVariance)
  .join('rect')
  .classed('cell', true)
  .attr('x', d => xScale(d.year))
  .attr('y', d => yScale(d.month - 1))
  .attr('width', (width - padding * 2) / years.length)
  .attr('height', (height - padding * 2) / 12)
  .attr('data-month', d => d.month)
  .attr('data-year', d => d.year)
  .attr('data-temp', d => data.baseTemperature + d.variance)
  .attr('fill', d => colorScale(d.variance))

rects.on('mouseover', (event, d) => {
  const x = event.target.x.baseVal.value
  const y = event.target.y.baseVal.value

  tooltip.classed('active', true)
    .style('left', x + 'px')
    .style('top', y + 'px')
    .html(`
      <p>${d.year} - ${d3.timeFormat('%B')(d3.timeMonth().setMonth(d.month - 1))}</p>
      <p>${parseFloat(data.baseTemperature + d.variance).toFixed(1)}</p>
      <p>${d3.format('+.1f')(d.variance)}</p>
    `)
})

rects.on('mouseout', () => tooltip.classed('active', false))
