import React, { Component } from 'react'
import {
    lightningChart,
    SolidLine,
    SolidFill,
    ColorHEX,
    Themes,
    customTheme
} from '@arction/lcjs'

class ChartChannel extends Component {
    constructor(props) {
        super(props)
        // Generate random ID to use as the containerId for the chart and the target div id.
        this.chartId = Math.trunc(Math.random() * 100000).toString(10)
    }

    // Define a function which creates a chart.
    createChart() {
        const myTheme = customTheme(Themes.light, { dashboardBackGroundFillStyle: new SolidFill({color: ColorHEX('#f121')}) } )
        // Create a chartXY, the containerId determines which div the chart will be rendered to.
        this.chart = lightningChart().ChartXY({ container: this.chartId, theme: myTheme  })
        // Set the Title of the chart.
        this.chart.setTitle('Canal ' +this.props.channel)
        // Add LineSeries to the chart.
        this.lineSeries = this.chart.addLineSeries()
        // Set the strokeStyle of the lineSeries.
        this.lineSeries.setStrokeStyle(new SolidLine({
            thickness: 2,
            fillStyle: new SolidFill({ color: ColorHEX('#5aafc7') })
        }))

        const yMin=Math.min.apply(Math, this.props.data.map(function(o) { return o.y; }))
        const yMax=Math.max.apply(Math, this.props.data.map(function(o) { return o.y; }))
        this.chart
            .getDefaultAxisY()
            .setTitle('uV')
            .setInterval(yMin-0.30*Math.abs(yMin), (yMax+0.30*Math.abs(yMax)))
            //.setScrollStrategy(AxisScrollStrategies.expansion)
        this.chart
        .getDefaultAxisX()
        .setTitle('seg')

        // Add data points from props to the lineSeries.
        this.lineSeries.add(this.props.data)
    }

    componentDidMount() {
        // Chart can only be created when the component has mounted the DOM as 
        // the chart needs the element with specified containerId to exist in the DOM
        this.createChart()
    }

    componentWillUnmount() {
        // "dispose" should be called when the component will unmount to free all the resources used by the chart.
        this.chart.dispose()
    }

    render() {
        // render a component, which includes a div element. The chart will be created inside the div element.
        return (
            <div id={this.chartId} style={this.props.chartStyle}></div>
        )
    }
}

export default ChartChannel
