import React, {Component} from 'react'
import {
    lightningChart,
    DataPatterns,
    AxisScrollStrategies,
    emptyFill,
    emptyTick,
    UIOrigins,
    emptyLine,
    SeriesXYFormatter,
    LineSeries,
    UILayoutBuilders,
    UIDraggingModes,
    UIElementBuilders,
    SolidFill,
    ColorHEX,
    UIBackgrounds,
    AxisTickStrategies,
    SolidLine,
    ColorRGBA,
    translatePoint,
    Themes,
    UIRectangle,
    UITextBox,
    UIElementColumn
} from "@arction/lcjs"

// TODO: Poner los estilos en un css

// Use theme if provided
class ChartChannels extends Component {
    constructor(props) {
        super(props)
        // Generate random ID to use as the containerId for the chart and the target div id.
        this.chartId = Math.trunc(Math.random() * 100000).toString(10)
    }
    createChart(){
        let theme = Themes.light
        // Define channels.
        const channels = this.props.channels
        // This is more like a guideline (streaming uses JS setInterval, which is not precise). Refer to in-chart PPS indicator for actual value.
        //const approxPointsPerSecondChannel = 10000
        const intervalMin=Math.min.apply(Math, this.props.data[1].map(function(o) { return o.y; }))
        const intervalMax=Math.max.apply(Math, this.props.data[1].map(function(o) { return o.y; }))
        const channelHeight = Math.abs(intervalMax-intervalMin)
        const channelGap = 0.2


        // Create Chart.
        this.chart = lightningChart().ChartXY({
            theme: theme,
            container: this.chartId
        })
            // Hide title.
            .setTitleFillStyle(emptyFill)

        // Configurure Axes Scrolling modes.
         this.axisX = this.chart.getDefaultAxisX()
            // Scroll along with incoming data.
            //.setScrollStrategy(AxisScrollStrategies.progressive)
        const yHeigthMax=(channels.length * channelHeight + (channels.length - 1) * channelGap)
        const yHeigthMin=intervalMin
        this.axisY = this.chart.getDefaultAxisY()
            // Keep same interval always.
            .setScrollStrategy(undefined)
            .setInterval(0,yHeigthMax)
            // Hide default ticks.
            .setTickStrategy(AxisTickStrategies.Empty)

        // Create a LineSeries for each "channel".
        this.series = channels.map((ch, i) => {
            const series = this.chart
                .addLineSeries({
                    // Specifying progressive DataPattern enables some otherwise unusable optimizations.
                    //dataPattern: DataPatterns.horizontalProgressive
                })
                .setName(ch)
                .setStrokeStyle(new SolidLine({
                    thickness: 2,
                    fillStyle: new SolidFill({ color: ColorHEX('#5aafc7') })
                }))
                // Specify data to be cleaned after a buffer of approx. 10 seconds.
                // Regardless of this value, data has to be out of view to be cleaned in any case.
                //.setMaxPointCount(approxPointsPerSecondChannel * 10)
            // Add Label to Y-axis that displays the Channel name.
            this.axisY.addCustomTick()
                .setValue((i + 0.5) * channelHeight + i * channelGap)
                .setTextFormatter(() => ch)
                .setMarker((marker) => marker
                    .setFont((font) => font
                        .setWeight('bold')
                    )
                    .setTextFillStyle(new SolidFill({ color: ColorHEX('#3c4b64') })) //Color de los canales
                    .setBackground((background) => background
                        .setFillStyle(emptyFill)
                        .setStrokeStyle(emptyLine)
                    )
                )
                .setGridStrokeStyle(new SolidLine({
                    thickness: 1,
                    fillStyle: new SolidFill({ color: ColorHEX('#3c4b64') }) //Color de las lineas grilla
                }))
            return series
        })

        // Create random progressive data stream using 'xydata' library.
        let pointsAdded = 0
        //const randomPointGenerator = createProgressiveRandomGenerator()
            // Generator will repeat same Y values after every 10k points.
            //.setNumberOfPoints(10 * 1000)
        this.series.forEach((series, i) => {
            /*const streamInterval = 1000 / 60
            const streamBatchSize = Math.ceil(approxPointsPerSecondChannel / streamInterval)*/
            /*randomPointGenerator
                .generate()
                .setStreamRepeat(true)
                .setStreamBatchSize(streamBatchSize)
                .setStreamInterval(streamInterval)
                .toStream()*/
            this.props.data[i].forEach((point) => {
                    // Increase Y coordinate based on Series index, so that Series aren't on top of each other.

                    point.y += ((i+0.5) * channelHeight + i * channelGap)
                    series.add(point)      
                    pointsAdded++
                })
        })

        // Style AutoCursor.
        this.chart.setAutoCursor((autoCursor) => autoCursor
            .setGridStrokeYStyle(emptyLine)
            .disposeTickMarkerY()
        )
        const resultTableFormatter=(tableContentBuilder, activeSeries, x, y) => {
            //let activeSeriesFormatted=LineSeries(activeSeries)
            const seriesIndex = this.series.indexOf(activeSeries)
            return tableContentBuilder
                .addRow(activeSeries.getName())
                .addRow('X', '', activeSeries.axisX.formatValue(x))
                // Translate Y coordinate back to [0, 1].
                .addRow('Y', '', activeSeries.axisY.formatValue(y - (seriesIndex + 0.5) * channelHeight + seriesIndex * channelGap))
        }
        
        this.series.forEach((series) => series.setResultTableFormatter(resultTableFormatter))

        const indicatorPos = translatePoint({
            x: this.axisX.scale.getInnerStart(),
            y: this.axisY.scale.getInnerEnd()
        }, {
            x: this.axisX.scale,
            y: this.axisY.scale
        },
            this.chart.uiScale
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

export default ChartChannels;

