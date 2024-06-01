import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

function setThresholdValues(min, max, counter) {
  const thresholdValues = []
  const step = (max - min) / counter

  for (let i = 1; i <= counter; i++) {
    thresholdValues.push(min + step * i)
  }

  return thresholdValues
}

const endpoint = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

const data = await d3.json(endpoint)

console.log(data)

const [ minYear, maxYear ] = d3.extent(data.monthlyVariance, item => item.year)

d3.select('#description')
  .text(`${minYear} - ${maxYear}: base temperature ${data.baseTemperature}°C`)

const tooltip = d3.select('.svg-container')
  .append('div')
  .classed('tooltip', true)
  .attr('id', 'tooltip')

const width = 1500
const height = 600
const padding = {
  top: 50,
  right: 30,
  bottom: 200,
  left: 90
}

const svg = d3.select('.svg-container')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

const years = data.monthlyVariance.filter((item, index, array) => {
  return index === 0 || item.year !== array[index - 1].year
}).map(item => item.year)

const xScale = d3.scaleBand(years, [padding.left, width - padding.right])

const months = Array(12).fill(0).map((_, index) => index)

const yScale = d3.scaleBand(months, [height - padding.bottom, padding.top])

const xAxis = d3.axisBottom(xScale)
  .tickValues(years.filter(year => year % 10 === 0))
  .tickFormat(d3.format(''))

const yAxis = d3.axisLeft(yScale)
  .tickFormat(number => {
    const month = d3.timeMonth().setMonth(number)
    return d3.timeFormat('%B')(month)
  })

const colorScheme = d3.reverse(d3.schemeRdYlBu[11])
const [ minTemp, maxTemp ] = d3.extent(data.monthlyVariance, (d) => data.baseTemperature + d.variance)

const thresholdValues = setThresholdValues(minTemp, maxTemp, colorScheme.length)

const colorScale = d3.scaleThreshold(thresholdValues, colorScheme)

svg.append('g')
  .attr('id', 'x-axis')
  .attr('transform', `translate(0, ${height - padding.bottom})`)
  .call(xAxis)

svg.append('g')
  .attr('id', 'y-axis')
  .attr('transform', `translate(${padding.left}, 0)`)
  .call(yAxis)

const rects = svg.selectAll('rect.cell')
  .data(data.monthlyVariance)
  .join('rect')
  .classed('cell', true)
  .attr('x', d => xScale(d.year))
  .attr('y', d => yScale(d.month - 1))
  .attr('width', (width - (padding.left + padding.right)) / years.length)
  .attr('height', (height - (padding.top + padding.bottom)) / 12)
  .attr('data-month', d => d.month - 1)
  .attr('data-year', d => d.year)
  .attr('data-temp', d => data.baseTemperature + d.variance)
  .attr('fill', d => colorScale(data.baseTemperature + d.variance))

rects.on('mouseover', (event, d) => {
  const x = event.target.x.baseVal.value
  const y = event.target.y.baseVal.value

  tooltip.classed('active', true)
    .attr('data-year', event.target.getAttribute('data-year'))
    .style('left', x + 'px')
    .style('top', y + 'px')
    .html(`
      <p>${d.year} - ${d3.timeFormat('%B')(d3.timeMonth().setMonth(d.month - 1))}</p>
      <p>${d3.format('.1f')(data.baseTemperature + d.variance)}</p>
      <p>${d3.format('+.1f')(d.variance)}</p>
    `)
})

rects.on('mouseout', () => tooltip.classed('active', false))

const legendScale = d3.scaleLinear(
  [thresholdValues[0], thresholdValues[thresholdValues.length - 1]],
  [padding.left, 380]
)

const legend = svg.append('g')
  .attr('id', 'legend')

const legendXAxis = d3.axisBottom(legendScale)
  .tickValues(colorScale.domain())
  .tickFormat(d3.format('.1f'))

legend.append('g')
  .attr('id', 'legend-x-axis')
  .attr('transform', `translate(0, ${height - 60})`)
  .call(legendXAxis)

const colors = colorScale.domain().slice(0, -1)

legend.selectAll('rect')
  .data(colors)
  .join('rect')
  .attr('x', (d) => legendScale(d))
  .attr('y', height - 90)
  .attr('width', 30)
  .attr('height', 30)
  .attr('fill', (d) => colorScale(d))
