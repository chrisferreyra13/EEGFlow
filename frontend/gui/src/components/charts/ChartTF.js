import React, {Component} from 'react'
import {connect} from 'react-redux'
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
    UIElementBuilders,
    SolidLine,
    SolidFill,
    Themes,
} from "@arction/lcjs"
import {updateSavePlot} from '../../redux/actions/Plot'
// Use theme if provided
class ChartTF extends Component {
    constructor(props) {
        super(props)
        // Generate random ID to use as the containerId for the chart and the target div id.
        this.chartId = Math.trunc(Math.random() * 100000).toString(10)
        this.state={
          showITC:Object.keys(this.props.data).includes('itc') ? true: false
        }
    }
    createChannel(
      dashboard,
      chartIndex,
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
          rowIndex: chartIndex,
          rowSpan: 1,
        })
        // Hide the chart title
        //
      const isITC=chartIndex==this.props.channels.length? true:false
      if(isITC){
        chart.setTitle('ITC')
      }else{
        if(this.props.average){
          chart.setTitle('Promedio de epocas')
        }
        else{
          if(this.props.epoch!=null){
            chart.setTitle('Epoca: '+this.props.epoch)
          }else{
            chart.setTitleFillStyle(emptyFill)
          }
        }
      }
      
      let unit='';
      if(!isITC){
        unit=this.props.unit
      }
      
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
      const ajustValueExpression=(v,f) => {
        if(v==0){
          return '0'
        }
        else{
          if(Math.abs(v)<1000){
            if(Math.abs(v)<10){
              if(Math.abs(v)<0.0001){
                return scientificNotString(v,f)
                 //is a power value
              }else{
                return v.toFixed(2).toString();
              }
            }else{
              if(Math.abs(maxValue-minValue)<10){return v.toFixed(1).toString();}
              else{return Math.round(v).toString();}
              
            }
          }
          else{
            return scientificNotString(v,f)
          }
        }
      }
      let lutRangeString=lutRange.map(v => {
        return ajustValueExpression(v,1)
      })
      //lut for power plot
      let colorSteps=[
        {value: lutRange[0],color: ColorHSV(221, 1, 0.82),label: `${lutRangeString[0]}`,},
        {value: lutRange[1],color: ColorHSV(200, 0.70, 0.89),label: `${lutRangeString[1]}`,},
        {value: lutRange[2],color: ColorHSV(176, 0.43, 0.94),label: `${lutRangeString[2]}`,},
        {value: lutRange[3],color: ColorHSV(0, 0, 1),label: `${lutRangeString[3]}`,},
        {value: lutRange[4],color: ColorHSV(20, 0.40, 0.99),label: `${lutRangeString[4]}`,},
        {value: lutRange[5],color: ColorHSV(357, 0.80, 0.84),label: `${lutRangeString[5]}`,},
        {value: lutRange[6],color: ColorHSV(354, 0.89, 0.72),label: `${lutRangeString[6]}`,},
      ]
      if(isITC){
        /*colorSteps=[
          {value: lutRange[0],color: ColorHSV(0, 0, 1),label: `${lutRangeString[0]}`,},
          {value: lutRange[1],color: ColorHSV(18, 0.314, 1),label: `${lutRangeString[1]}`,},
          {value: lutRange[2],color: ColorHSV(14, 0.545, 1),label: `${lutRangeString[2]}`,},
          {value: lutRange[3],color: ColorHSV(0, 1, 0.996),label: `${lutRangeString[3]}`,},
          {value: lutRange[4],color: ColorHSV(0, 1, 0.843),label: `${lutRangeString[4]}`,},
          {value: lutRange[5],color: ColorHSV(0, 1, 0.655),label: `${lutRangeString[5]}`,},
          {value: lutRange[6],color: ColorHSV(0, 1, 0.435),label: `${lutRangeString[6]}`,},
        ]*/
        colorSteps=[ //
          {value: lutRange[0],color: ColorHSV(0, 0, 1),label: `${lutRangeString[0]}`,},
          {value: lutRange[1],color: ColorHSV(20, 0.129, 1),label: `${lutRangeString[1]}`,},
          {value: lutRange[2],color: ColorHSV(16, 0.454, 0.976),label: `${lutRangeString[2]}`,},
          {value: lutRange[3],color: ColorHSV(12, 0.732, 0.98),label: `${lutRangeString[3]}`,},
          {value: lutRange[4],color: ColorHSV(12, 0.832, 0.98),label: `${lutRangeString[4]}`,},
          {value: lutRange[5],color: ColorHSV(357, 0.80, 0.84),label: `${lutRangeString[5]}`,},
          {value: lutRange[6],color: ColorHSV(354, 0.89, 0.72),label: `${lutRangeString[6]}`,},
        ]

      }


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
        .setPixelInterpolationMode('disable')
        .setFillStyle(
          new PalettedFill(
            {lut: new LUT({
              steps: colorSteps,
              units: unit,
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
            .addRow("", ajustValueExpression(dataPoint.intensity,2) + " "+unit)
        );
    
      // Set default X axis settings
      series.axisX
        .setInterval(start.x, end.x)
        .setTickStrategy(AxisTickStrategies.Empty)
        .setTitleMargin(0)
        .setScrollStrategy(undefined)
        .setMouseInteractions(false)
        .addCustomTick(UIElementBuilders.AxisTick)
        .setValue(0)
        .setGridStrokeStyle(new SolidLine({
            thickness: 3,
            fillStyle: new SolidFill({color: ColorHSV(333,1,1 )})
        }));
      // Set default chart settings
      chart
        .setPadding({ left: 0, top: 8, right: 8, bottom: 1 })
        .setMouseInteractions(false);
      // Set default X axis settings
      series.axisY
        .setInterval(start.y, end.y)
        .setTitle('Frecuencia (Hz)')
        .setScrollStrategy(AxisScrollStrategies.fitting);
    
      return {
        chart,
        series,
      };
    };
    createDashboard(){
      let numberOfRows=this.state.showITC? this.props.channels.length+1:this.props.channels.length
      
      const lc = lightningChart();
      this.dashboard = lc
        .Dashboard({
          theme: Themes.light,
          container: this.chartId,
          numberOfColumns: 1,
          numberOfRows: numberOfRows,
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
      minTime=this.props.data.times[0];
      maxTime=this.props.data.times[this.props.data.times.length-1];
      minFreq=this.props.data.freqs[0];
      maxFreq=this.props.data.freqs[this.props.data.freqs.length-1];
      for (let i = 0; i < this.props.channels.length; i += 1) {
        // Create a chart for the channel
        
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
      if(this.state.showITC){
        const ch = this.createChannel(
          this.dashboard,
          this.props.channels.length,
          this.props.data.freqs.length,
          this.props.data.times.length,
          minFreq,
          maxFreq,
          minTime,
          maxTime,
          0, //vmin
          1 //vmax
        );

        // Set the heatmap data
        ch.series.invalidateIntensityValues({
          iRow: 0,
          iColumn: 0,
          values: this.props.data.itc[0],
        });
        // Add the created chart and series to collection
        charts.push(ch);
      }
      charts.forEach(ch => {
        ch.series.axisX
        .setTickStrategy(AxisTickStrategies.Numeric)
        .setScrollStrategy(AxisScrollStrategies.fitting)
        .setTitle('Tiempo (seg)')
        .setMouseInteractions(true);
      })

      
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
      
      //Add charts to legend box and set the title
      charts.forEach((c,j) => {
        if(j==this.props.channels.length){
          legend.add(c.chart)
        }else{
          legend.add(c.chart).setTitle(this.props.channels[j])
        }
        
        
      });
      // Link chart X axis scales
      const syncedAxes = charts.map(chart => chart.series.axisX)
      synchronizeAxisIntervals(...syncedAxes)

    }
    componentDidUpdate(prevProps){
      if(prevProps.savePlot.save!==this.props.savePlot.save){
        if(this.props.savePlot.save && this.props.savePlot.id==this.props.nodeId){
          this.dashboard.saveToFile(
                this.props.savePlot.filename,
                'image/'+this.props.savePlot.format
                )
          this.props.updateSavePlot(this.props.savePlot.id,this.props.savePlot.filename,this.props.savePlot.format)
        }
      }
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

const mapStateToProps = (state) => {
	return{
	  savePlot:state.plotParams.savePlot
	};
}
  
const mapDispatchToProps = (dispatch) => {
	return {
        updateSavePlot:(nodeId,filename,format) => dispatch(updateSavePlot(nodeId,filename,format)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartTF)
