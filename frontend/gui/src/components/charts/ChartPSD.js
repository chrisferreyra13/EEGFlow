import React, {Component} from 'react'
import {
    lightningChart,
    emptyFill,
    emptyLine,
    SolidFill,
    ColorHSV,
    AxisTickStrategies,
    SolidLine,
    translatePoint,
    Themes,
    LegendBoxPositionXY
} from "@arction/lcjs"

// TODO: Poner los estilos en un css

// Use theme if provided
class ChartPSD extends Component {
    constructor(props) {
        super(props)
        // Generate random ID to use as the containerId for the chart and the target div id.
        this.chartId = Math.trunc(Math.random() * 100000).toString(10)
    }
    createChart(){
        let theme = Themes.light
        // Define channels.
        const channels = this.props.channels
        let yMin
        let yMax
        if(this.props.data[0].x!=undefined){
            yMin=Math.min.apply(Math, this.props.data.map(function(o) { return o.y; }))
            yMax=Math.max.apply(Math, this.props.data.map(function(o) { return o.y; }))
        }
        else{
            yMin=Math.min.apply(Math, this.props.data[0].map(function(o) { return o.y; }))
            yMax=Math.max.apply(Math, this.props.data[0].map(function(o) { return o.y; }))
        }
        // Create Chart.
        this.chart = lightningChart().ChartXY({
            theme: theme,
            container: this.chartId
        })
        
        
        if(this.props.epoch!=null){
            this.chart.setTitle('PSD Epoca: '+this.props.epoch)
        }else{
            // Hide title.
            this.chart.setTitle('PSD')
        }
        // Configurure Axes Scrolling modes.
        this.chart
            .getDefaultAxisX()
            .setTitle('Hz')
        
        this.axisY = this.chart.getDefaultAxisY()
            .setTitle('\u03BCV²/Hz (dB)')
            .setInterval(yMin-0.8*Math.abs(yMin), (yMax+0.8*Math.abs(yMax)))

        // Create a LineSeries for each "channel".
        this.series = channels.map((ch, i) => {
            const series = this.chart
                .addLineSeries()
                .setName(ch)
                .setStrokeStyle(new SolidLine({
                    thickness: 1,
                    fillStyle: new SolidFill({color: ColorHSV( i * 20,0.9 )})
                }))
                // Specify data to be cleaned after a buffer of approx. 10 seconds.
                // Regardless of this value, data has to be out of view to be cleaned in any case.
                //.setMaxPointCount(approxPointsPerSecondChannel * 10)
            return series
        })

        this.chart.addLegendBox()
            .setPosition({ x: 90, y: 40 })
            .add(this.chart)
        
        this.series.forEach((series, i) => {
            if(channels.length==1){
                series.add(this.props.data)
            }
            else{
                series.add(this.props.data[i])
            }
            
        })

        // Style AutoCursor.
        this.chart.setAutoCursor((autoCursor) => autoCursor
            .setGridStrokeYStyle(emptyLine)
            .disposeTickMarkerY()
        )
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
    
    render(){
        return <div id={this.chartId} style={this.props.chartStyle}></div>
    }
    
}

export default ChartPSD;

