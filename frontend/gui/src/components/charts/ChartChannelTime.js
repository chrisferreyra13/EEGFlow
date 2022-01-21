import React, { Component } from 'react'
import {connect} from 'react-redux'
import {
    lightningChart,
    SolidLine,
    SolidFill,
    ColorHEX,
    Themes,
    customTheme,
    PointShape,
    ColorHSV,
    UIElementBuilders
} from '@arction/lcjs'
import {updateSavePlot} from '../../redux/actions/Plot'

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
        if(this.props.epoch!=null){
            this.chart.setTitle('Epoca: '+this.props.epoch+' | Canal: ' +this.props.channel)
        }else{
            this.chart.setTitle('Canal: ' +this.props.channel)
        }
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
            .setTitle('\u03BCV')
            .setInterval(yMin-0.30*Math.abs(yMin), (yMax+0.30*Math.abs(yMax)))
            //.setScrollStrategy(AxisScrollStrategies.expansion)
        this.axisX=this.chart.getDefaultAxisX()
        this.axisX.setTitle('seg')
        // Add data points from props to the lineSeries.
        this.lineSeries.add(this.props.data)

        switch(this.props.methodResult.type){
            case "MAX_PEAK":
                if(this.props.methodResult.data.length!=0){
                    this.pointSerie = this.chart
                        .addPointSeries({pointShape: PointShape.Circle})
                        .setName(this.props.channel)
                        .setPointSize(8.0)
        
                    this.props.methodResult.data[0]["locations"].forEach(idx =>{
                        if(idx<this.props.data.length){
                            this.pointSerie.add(this.props.data[idx])  
                        }  
                    })
                }
                break
            case "EVENTS":
                if(this.props.methodResult.data.eventIds!=undefined){
                    let sample=0;
                    let padding=20;

                    this.props.methodResult.data.eventIds.forEach((id,j) => {
                        sample=this.props.methodResult.data.eventSamples[j]
                        if(sample<this.props.data.length){
                            padding=20
                            if(j%2==0){
                                padding=40
                            }
                            this.axisX.addCustomTick(UIElementBuilders.AxisTick)
                            .setValue(this.props.data[sample].x)
                            .setTextFormatter(()=> id.toString())
                            .setTickLabelPadding(padding)
                            .setGridStrokeStyle(new SolidLine({
                                thickness: 1,
                                fillStyle: new SolidFill({color: ColorHSV( id * 20,0.9 )})
                            }))
                        }
                    })
                            
                }
                break
            default:
                break

        }

    }

    componentDidUpdate(prevProps){
		if(prevProps.savePlot.save!==this.props.savePlot.save){
            if(this.props.savePlot.save && this.props.savePlot.id==this.props.nodeId){
                this.chart.saveToFile(
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
export default connect(mapStateToProps, mapDispatchToProps)(ChartChannel)
