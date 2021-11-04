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
    synchronizeAxisIntervals,
    Themes,
} from "@arction/lcjs"

// Use theme if provided
class ChartTFR extends Component {
    constructor(props) {
        super(props)
        // Generate random ID to use as the containerId for the chart and the target div id.
        this.chartId = Math.trunc(Math.random() * 100000).toString(10)
    }
    createChannel(
      dashboard,
      channelIndex,
      rows,columns,
      minFreq,maxFreq,
      minTime,maxTime,
      minValue,maxValue,
      ){
      // Create a new chart in a specified row
      const chart = dashboard
        .createChartXY({
          columnIndex: 0,
          columnSpan: 1,
          rowIndex: channelIndex,
          rowSpan: 1,
        })
        // Hide the chart title
        //
      if(channelIndex==0){
        if(this.props.epoch!=null){
          chart.setTitle('Epoca: '+this.props.epoch)
        }else{
          chart.setTitleFillStyle(emptyFill)
        }
      }else{
        chart.setTitleFillStyle(emptyFill);
      }
      // Define function that maps Uint8 [0, 255] to Decibels.
      //const intensityDataToDb = (intensity) =>
      //minDecibels + (intensity / 255) * (maxDecibels - minDecibels);
      // Start position of the heatmap
      const start = {
        x: minTime,
        y: minFreq,
      };
      // End position of the heatmap
      const end = {
        x: maxTime, 
        // Use half of the fft data range
        y: maxFreq, 
      };
      // Create the series
      
      let createRange = (start,end,numberOfSteps) => {
        let step=Math.abs(end-start)/numberOfSteps
        let range=[];
        for(let i=0; i<=numberOfSteps; i++){
          range.push(start + step*i)
        }
        return range
      }
      let lutRange=createRange(minValue,maxValue,6)
      const scientificNotString = (x, f) => {
        return Number.parseFloat(x).toExponential(f);
      }
      let lutRangeString=lutRange.map(v => {

        return v==0 ? '0' : scientificNotString(v,1)
      })
      const series = chart
        .addHeatmapGridSeries({
          // Data columns, defines horizontal resolution
          columns: columns,
          // Use half of the fft data range
          rows: rows,
          // Start position, defines where one of the corners for hetmap is
          start,
          // End position, defines the opposite corner of the start corner
          end,
          dataOrder: "rows",
          heatmapDataType: "intensity",
        })
        // Use palletted fill style, intensity values define the color for each data point based on the LUT
        
        .setFillStyle(
          new PalettedFill({
            lut: new LUT({
              steps: [
                {
                  value: lutRange[0],
                  color: ColorHSV(0, 1, 0),
                  label: `${lutRangeString[0]}`,
                },
                {
                  value: lutRange[1],
                  color: ColorHSV(270, 0.84, 0.2),
                  label: `${lutRangeString[1]}`,
                },
                {
                  value: lutRange[2],
                  color: ColorHSV(289, 0.86, 0.35),
                  label: `${lutRangeString[2]}`,
                },
                {
                  value: lutRange[3],
                  color: ColorHSV(324, 0.97, 0.56),
                  label: `${lutRangeString[3]}`,
                },
                {
                  value: lutRange[4],
                  color: ColorHSV(1, 1, 1),
                  label: `${lutRangeString[4]}`,
                },
                {
                  value: lutRange[5],
                  color: ColorHSV(44, 0.64, 1),
                  label: `${lutRangeString[5]}`,
                },
                {
                  value: lutRange[6],
                  color: ColorHSV(62, 0.32, 1),
                  label: `${lutRangeString[6]}`,
                },
              ],
              units: "\u03BCV²/Hz",
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
            .addRow("", scientificNotString(dataPoint.intensity,2) + " \u03BCV²/Hz")
        );
    
      // Set default X axis settings
      series.axisX
        .setInterval(start.x, end.x)
        .setTickStrategy(AxisTickStrategies.Empty)
        .setTitleMargin(0)
        .setScrollStrategy(undefined)
        .setMouseInteractions(false);
      // Set default chart settings
      chart
        .setPadding({ left: 0, top: 8, right: 8, bottom: 1 })
        .setMouseInteractions(false);
      // Set default X axis settings
      series.axisY
        .setInterval(start.y, end.y)
        .setTitle(this.props.channels[channelIndex]+' (Hz)')
        .setScrollStrategy(AxisScrollStrategies.fitting);
    
      return {
        chart,
        series,
      };
    };
    createDashboard(){
      const lc = lightningChart();
      this.dashboard = lc
        .Dashboard({
          theme: Themes.light,
          container: this.chartId,
          numberOfColumns: 1,
          numberOfRows: this.props.channels.length,
        })
        // Hide the dashboard splitter
        .setSplitterStyle(emptyLine);
      
      // Collection of created charts
      const charts = [];

      // Create channels and set data for each channel
      let minTime=0;
      let maxTime=0;
      let minFreq=0;
      let maxFreq=0;
      
      for (let i = 0; i < this.props.channels.length; i += 1) {
        // Create a chart for the channel
        minTime=this.props.data.times[0];
        maxTime=this.props.data.times[this.props.data.times.length-1];
        minFreq=this.props.data.freqs[0];
        maxFreq=this.props.data.freqs[this.props.data.freqs.length-1];
        const ch = this.createChannel(
          this.dashboard,
          i,
          this.props.data.freqs.length,
          this.props.data.times.length,
          minFreq,
          maxFreq,
          minTime,
          maxTime,
          this.props.data.vMin,
          this.props.data.vMax
        );

        // Set the heatmap data
        ch.series.invalidateIntensityValues({
          iRow: 0,
          iColumn: 0,
          values: this.props.data.power[i],
        });
        // Add the created chart and series to collection
        charts.push(ch);
      }
    
      charts[charts.length - 1].series.axisX
        .setTickStrategy(AxisTickStrategies.Numeric)
        .setScrollStrategy(AxisScrollStrategies.fitting)
        .setTitle('seg')
        .setMouseInteractions(true);
      // Add LegendBox.
      const legend = this.dashboard
        .addLegendBox()
        // Dispose example UI elements automatically if they take too much space. This is to avoid bad UI on mobile / etc. devices.
        .setAutoDispose({
          type: "max-width",
          maxWidth: 0.2,
        })
        .setPosition({ x: 100, y: 50 })
        .setOrigin({ x: 1, y: 0 });
      charts.forEach((c) => legend.add(c.chart));
      // Link chart X axis scales
      const syncedAxes = charts.map(chart => chart.series.axisX)
      synchronizeAxisIntervals(...syncedAxes)

    }
    componentDidMount() {
        // Chart can only be created when the component has mounted the DOM as 
        // the chart needs the element with specified containerId to exist in the DOM
        this.createDashboard()
    }

    componentWillUnmount() {
        // "dispose" should be called when the component will unmount to free all the resources used by the chart.
        this.dashboard.dispose()
    }
    
    render(){
        return <div id={this.chartId} style={this.props.chartStyle}></div>
    }
    
}

export default ChartTFR;

