import React, {Component} from 'react'
import {
    lightningChart,
    PalettedFill,
    LUT,
    emptyFill,
    emptyLine,
    AxisScrollStrategies,
    LegendBoxBuilders,
    ColorHSV,
    translatePoint,
    AxisTickStrategies,

    Themes,
} from "@arction/lcjs"

// TODO: Poner los estilos en un css

// Use theme if provided
class ChartTFR extends Component {
    constructor(props) {
        super(props)
        // Generate random ID to use as the containerId for the chart and the target div id.
        this.chartId = Math.trunc(Math.random() * 100000).toString(10)
    }
    createChart(){
        const spectrogramColumns = 1024;
        const spectrogramRows = 1024;
        
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

         // Define function that maps Uint8 [0, 255] to Decibels.
        const intensityDataToDb = (intensity) =>
            intensity//minDecibels + (intensity / 255) * (maxDecibels - minDecibels);

        // Create Chart.
        this.chart = lightningChart().ChartXY({
                theme: theme,
                container: this.chartId
            })
        this.seriesSpectrogram=this.chart.addHeatmapGridSeries({
                columns: spectrogramColumns,
                rows: spectrogramRows,
                dataOrder: "rows",
                heatmapDataType: "intensity",
            })
            .setMouseInteractions(false)
            .setWireframeStyle(emptyLine)
            .setFillStyle(
                new PalettedFill({
                  lut: new LUT({
                    steps: [
                      {
                        value: 0,
                        color: ColorHSV(0, 1, 0),
                        label: `${Math.round(intensityDataToDb(255 * (0 / 7)))}`,
                      },
                      {
                        value: 255 * (1 / 7),
                        color: ColorHSV(270, 0.84, 0.2),
                        label: `${Math.round(intensityDataToDb(255 * (1 / 7)))}`,
                      },
                      {
                        value: 255 * (2 / 7),
                        color: ColorHSV(289, 0.86, 0.35),
                        label: `${Math.round(intensityDataToDb(255 * (2 / 7)))}`,
                      },
                      {
                        value: 255 * (3 / 7),
                        color: ColorHSV(324, 0.97, 0.56),
                        label: `${Math.round(intensityDataToDb(255 * (3 / 7)))}`,
                      },
                      {
                        value: 255 * (4 / 7),
                        color: ColorHSV(1, 1, 1),
                        label: `${Math.round(intensityDataToDb(255 * (4 / 7)))}`,
                      },
                      {
                        value: 255 * (5 / 7),
                        color: ColorHSV(44, 0.64, 1),
                        label: `${Math.round(intensityDataToDb(255 * (5 / 7)))}`,
                      },
                      {
                        value: 255,
                        color: ColorHSV(62, 0.32, 1),
                        label: `${Math.round(intensityDataToDb(255 * (6 / 7)))}`,
                      },
                    ],
                    units: "dB",
                    interpolate: true,
                  }),
                })
            )
            .setWireframeStyle(emptyLine)
            .setCursorResultTableFormatter((builder, series, dataPoint) =>
                builder
                    .addRow(series.getName())
                    .addRow("X:", "", series.axisX.formatValue(dataPoint.x))
                    .addRow("Y:", "", series.axisY.formatValue(dataPoint.y))
                    .addRow("", intensityDataToDb(dataPoint.intensity).toFixed(1) + " dB")
            );

        this.seriesSpectrogram.invalidateIntensityValues(this.props.data);
        
        this.chart.setTitle('Time - Frequency')
        // Configurure Axes Scrolling modes.
        this.chart
            .getDefaultAxisX()
            .setTitle('seg')
            .setTickStrategy(AxisTickStrategies.Empty)
            .setTitleMargin(0)
            .setScrollStrategy(undefined)
            .setMouseInteractions(false);
            
        this.axisY = this.chart.getDefaultAxisY()
            .setTitle('Hz')
            .setScrollStrategy(AxisScrollStrategies.fitting);
        
        const legend = this.chart.addLegendBox(LegendBoxBuilders.HorizontalLegendBox)
        // Dispose example UI elements automatically if they take too much space. This is to avoid bad UI on mobile / etc. devices.
            .setAutoDispose({
                type: 'max-width',
                maxWidth: 0.80,
            })
            .add(this.chart);
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

export default ChartTFR;

