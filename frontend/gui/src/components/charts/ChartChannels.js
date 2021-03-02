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

//import { createProgressiveRandomGenerator } from "@arction/xydata"

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
        const channels = [
            'Ch 1',
            'Ch 2',
            'Ch 3',
            'Ch 4',
            'Ch 5',
            'Ch 6',
        ]
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
                    .setTextFillStyle(new SolidFill())
                    .setBackground((background) => background
                        .setFillStyle(emptyFill)
                        .setStrokeStyle(emptyLine)
                    )
                )
                .setGridStrokeStyle(new SolidLine({
                    thickness: 1,
                    fillStyle: new SolidFill({ color: ColorHEX('#3c4b64') })
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

        // Create indicators for points-per-second and frames-per-second.
        /*const indicatorLayout = this.chart.addUIElement(//<UIElementColumn<UIRectangle>>(
            UILayoutBuilders.Column
                .setBackground(UIBackgrounds.Rectangle),
            // Position UIElement with Axis coordinates.
            this.chart.uiScale
        )
        /*const indicatorLayout = chart.addUIElement(UILayoutBuilders.Column
            .setBackground(UIBackgrounds.Rectangle), 
        // Position UIElement with Axis coordinates.
        chart.uiScale)*/
        
            /*.setOrigin(UIOrigins.LeftTop)
            .setPosition(indicatorPos)
            .setDraggingMode(UIDraggingModes.notDraggable)
            // Set dark, tinted Background style.
            .setBackground((background) => background
                .setFillStyle(new SolidFill({ color: ColorHEX('#000').setA(150) }))
                .setStrokeStyle(emptyLine)
            )*/
        // FPS indicator.
        /*const fpsPrefix = 'Rendering frames-per-second (FPS)'
        //const indicatorFPS = indicatorLayout.addElement<UITextBox<UIRectangle>>(UIElementBuilders.TextBox)
        const indicatorFPS = indicatorLayout.addElement(UIElementBuilders.TextBox)
            .setText(fpsPrefix)
            .setFont((font) => font
                .setWeight('bold')
            )*/

        // PPS indicator.
        /*const ppsPrefix = 'Incoming data, at rate of points-per-second (PPS)'
        //const indicatorPPS = indicatorLayout.addElement<UITextBox<UIRectangle>>(UIElementBuilders.TextBox)
        const indicatorPPS = indicatorLayout.addElement(UIElementBuilders.TextBox)
            .setText(ppsPrefix)
            .setFont((font) => font
                .setWeight('bold')
            )*/

        // Measure FPS.
        /*let frameCount = 0
        let frameDelaySum = 0
        let framePrevious= Number | undefined
        const measureFPS = () => {
            const now = window.performance.now()
            frameCount++
            if (framePrevious)
                frameDelaySum += now - framePrevious
            framePrevious = now
            requestAnimationFrame(measureFPS)
        }
        requestAnimationFrame(measureFPS)*/

        // Update displayed FPS and PPS on regular intervals.
        /*let displayPrevious = window.performance.now()
        setInterval(() => {
            const now = window.performance.now()
            const delta = now - displayPrevious
            const fps = 1000 / (frameDelaySum / frameCount)
            const pps = 1000 * pointsAdded / delta

            indicatorFPS.setText(`${fpsPrefix}: ${fps.toFixed(1)}`)
            indicatorPPS.setText(`${ppsPrefix}: ${pps.toFixed(0)}`)

            // Reset counters.
            frameDelaySum = 0
            frameCount = 0
            pointsAdded = 0
            displayPrevious = now
        }, 1000)*/
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
        return <div id={this.chartId} style={{height:Math.floor(window.innerHeight*0.75), width:Math.floor(window.innerWidth*0.75)}}></div>
    }
    
}

export default ChartChannels;

