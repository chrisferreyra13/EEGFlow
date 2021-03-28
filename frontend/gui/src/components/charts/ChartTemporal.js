import React, { Component } from 'react'
import {
	CCard,
	CCardBody,
	CCardGroup,
} from '@coreui/react'

import {connect} from 'react-redux'
import ChartChannel from './ChartChannel'
import ChartChannels from './ChartChannels'
import {SamplesToTimes} from '../../tools/Signal'
import { node } from 'prop-types'
//import  CanvasJSReact from '../../canvasjs/canvasjs.react'
//import {Line} from 'react-chartjs-2'

class ChartTemporal extends Component {
    constructor(props){
        super(props);
		const nodePlot=this.props.elements.find((elem) => elem.id==this.props.nodeId)
		let params={}
		if(nodePlot.params==null){
			params={ //Default params
				channels:['317','316'],
				minTimeWindow:null,
				maxTimeWindow:null,
				largeSize:'on',
				mediumSize:'off',
				smallSize:'off',
				
			}
		}else{
			params={
				channels:nodePlot.params.channels.split(","),
				...nodePlot.params
			}
				
		}
		console.log(params)

		let data=[]
		let limit = this.props.timeSeries[1].length;
		let dataPoints = [];
		let minTimeIndex=0;
		let maxTimeIndex=limit;
		if(params.minTimeWindow!=null){
			minTimeIndex=Math.round(params.minTimeWindow*this.props.samplingFreq)
			if(minTimeIndex>=limit) minTimeIndex=0; //Se paso, tira error
		}
		if(params.maxTimeWindow!=null){
			maxTimeIndex=Math.round(params.maxTimeWindow*this.props.samplingFreq)
			if(maxTimeIndex>limit) maxTimeIndex=limit; //Se paso, tira error
		}

		if(params.channels.length!=0){
			// Si no coinciden hay error, tenerlo en cuenta para hacer una excepcion
			const idxs=params.channels.map((ch) => this.props.chNames.findIndex((chName) => ch===chName))
			for(var j = 0; j < params.channels.length; j += 1){
				for (var i = minTimeIndex; i < maxTimeIndex; i += 1) {
					dataPoints.push({
					x: SamplesToTimes(i,this.props.samplingFreq,3),
					y: Math.pow(10,6)*this.props.timeSeries[idxs[j]][i]
				});
				}
				data.push(dataPoints)
				dataPoints=[]
			}
		}else{
			for (var i = minTimeIndex; i < maxTimeIndex; i += 1) {
				dataPoints.push({
				x: SamplesToTimes(i,this.props.samplingFreq,3),
				y: Math.pow(10,6)*this.props.timeSeries[1][i]
			});
			}
			data=dataPoints
		}	
		let style={} //Seteando las dimensiones del grafico en base a los parametros
		//Cambiar esto, no va a funcionar, el form solo envia uno de los 3, los otros 2 quedan undefined
		if(params.largeSize==='on'){// TODO: Mejorar esto, no funciona el dividir de forma inteligente
			style={
				height:'75vh',
			}
		}else if(params.mediumSize==='on'){
			style={
				height:'60vh',
				width:'600px'
			}
		}else{
			style={
				height:'40vh',
				width:'600px'
			}
		}

		this.state={
			nodeId:this.props.nodeId,
			params:params,
			style:style,
			data:data
		}

    }

    render() {
		if(this.props.timeSeries[1]==undefined){
			return null
		}else{
			return (
				<div>
					<CCard style={this.state.style}>
						<CCardBody>
							{this.state.params.channels.length<=1 ?
							<ChartChannel
							data={this.state.data}
							chartStyle={{height: '100%', width:'100%'}}
							channel={this.state.params.channels[1]==undefined ? this.props.chNames[1] : this.state.params.channels[1]}
							/> :
							<ChartChannels 
							data={this.state.data}
							chartStyle={{height: '100%', width:'100%'}}
							channels={this.state.params.channels}
							/>
						}
						</CCardBody>
					</CCard>
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
	  chNames: state.timeSeries.chNames,
	  elements:state.diagram.elements
	};
  }
  
  const mapDispatchToProps = (dispatch) => {
	return {
		//
	};
  };
export default connect(mapStateToProps, mapDispatchToProps)(ChartTemporal)