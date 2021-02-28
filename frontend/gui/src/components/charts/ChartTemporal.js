import React, { Component } from 'react'
import {connect} from 'react-redux'
import Chart from './Chart'
import {SamplesToTimes} from '../../tools/Signal'
//import  CanvasJSReact from '../../canvasjs/canvasjs.react'
//import {Line} from 'react-chartjs-2'

class ChartTemporal extends Component {
    constructor(props){
        super(props);
		this.state={
			nodeId:this.props.nodeId
		}
    }

    render() {
		if(this.props.timeSeries[1]==undefined){
			return null
		}else{
			let limit = this.props.timeSeries[1].length;   
			let dataPoints = [];
			for (var i = 0; i < limit; i += 1) {
				dataPoints.push({
				x: SamplesToTimes(i,this.props.samplingFreq,3),
				y: Math.pow(10,6)*this.props.timeSeries[1][i]
			});
			}
			return (
				<div >
					<Chart data={dataPoints} />
				  </div>
			)
		}
		
		
    }
}
const mapStateToProps = (state) => {
	return{
	  fileInfo: state.file.fileInfo,
	  timeSeries: state.timeSeries.signal,
	  samplingFreq: state.timeSeries.sFreq,
	  enableChartTemporal: state.plots.chartTemporal,
	};
  }
  
  const mapDispatchToProps = (dispatch) => {
	return {
		//
	};
  };
export default connect(mapStateToProps, mapDispatchToProps)(ChartTemporal)