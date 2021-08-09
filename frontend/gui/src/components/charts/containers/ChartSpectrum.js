import React, { Component } from 'react'
import {
	CCard,
	CCardBody,
	CCardGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {fetchSignal,deleteItemInputsReady} from '../../../redux/actions/Diagram'
import {connect} from 'react-redux'
import ChartPSD from '../ChartPSD'

import {PrepareDataForPlot} from '../../../tools/Utils'
import { node } from 'prop-types'
import {updatePlotParams} from '../../../redux/actions/Plot' 



//import  CanvasJSReact from '../../canvasjs/canvasjs.react'
//import {Line} from 'react-chartjs-2'

class ChartSpectrum extends Component {
    constructor(props){
        super(props);
		const nodePlot=this.props.elements.find((elem) => elem.id==this.props.nodeId) //Busco nodoPlot para setear los params
		let params={}
		if(nodePlot.params.channels==null){ 
			params={ //Default params
				channels:['EEG 016'], //Para ChartTemporal, los canales son una lista de strings
				minXWindow:null,
				maxXWindow:null,
				size:'m'
				
			}
		}else{
			params={
				channels:nodePlot.params.channels,
				minXWindow:parseFloat(nodePlot.params.minFreqWindow),
				maxXWindow:parseFloat(nodePlot.params.maxFreqWindow),
				size:nodePlot.params.size==null ? 'm' : nodePlot.params.size
			}
		}

		this.preprocessData=this.preprocessData.bind(this);

		let style={} //Seteando las dimensiones del grafico en base a los parametros
		
		switch(params.size){
			case 'l':	// TODO: Mejorar esto, no funciona el dividir de forma inteligente
				style={
					height:'75vh',
				}
				break;
			case 'm':
				style={
					height:'60vh',
					width:'600px'
				}
				break;
			case 's':
				style={
					height:'40vh',
					width:'600px'
				}
				break;
		}

		let data=[];
		let dataReady=false;
		let channels;
		let oldSignalId=null;
		const dataType='PSD';
		if(nodePlot.inputData.fetchInput){
			const nodeInput=this.props.elements.find((elem) => elem.id==nodePlot.inputData.inputNodeId)
			const signalData=nodeInput.signalsData.find(d => d.dataType==dataType)

			if(nodeInput.params.channels==undefined){
				channels=nodePlot.params.channels
			}
			else{
				channels=nodeInput.params.channels
			}
			if(signalData==undefined){
				this.props.fetchSignal(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,dataType)
				this.props.updatePlotParams(nodePlot.id,{...nodePlot.params})
			}
			else{
				if(!signalData.dataReady){
					this.props.deleteItemInputsReady(signalData.id)
					oldSignalId=signalData.id
					this.props.fetchSignal(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,dataType)
					this.props.updatePlotParams(nodePlot.id,{...nodePlot.params})
				}
				else{
					if(Object.keys(this.props.prevParams).includes(nodePlot.id)){
						if(JSON.stringify(this.props.prevParams[nodePlot.id])!==JSON.stringify(nodePlot.params)){
							this.props.deleteItemInputsReady(signalData.id)
							oldSignalId=signalData.id
							this.props.fetchSignal(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,dataType)
							this.props.updatePlotParams(nodePlot.id,{...nodePlot.params})
						}
					}
				}
			}
		}

		this.state={
			dataReady:dataReady,
			inputNodeId:nodePlot.inputData.inputNodeId,
			dataType:dataType,
			params:params,
			style:style,
			data:data,
			oldSignalId:oldSignalId,

		}
    }

	preprocessData(dataParams){
		if(this.state.dataReady==true){
			return
		}
		let dataX=[]

		let minIndex=0;
		let limit=dataParams.freqs.length;
		let maxIndex=limit;
		let target;
		let goal;
		if(this.state.params.minXWindow!=null){
			goal=this.state.params.minXWindow
			target=dataParams.freqs.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
			minIndex=dataParams.freqs.findIndex(f => f==target)
			if(minIndex>=limit) minIndex=0; //Se paso, tira error
		}
		if(this.state.params.maxXWindow!=null){
			goal=this.state.params.maxXWindow
			target=dataParams.freqs.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
			maxIndex=dataParams.freqs.findIndex(f => f==target)
			if(maxIndex>limit) maxIndex=limit; //Se paso, tira error
    	}
    	
		let data=PrepareDataForPlot(
			dataParams.freqs, //if empty [] --> SampleToTimes 
			dataParams.data,
			dataParams.sFreq,
			dataParams.chNames,
			this.state.params.channels,
			minIndex,
			maxIndex,
			1//Math.pow(10,6)
			)
		
		this.setState({
			data:data,
			dataReady:true,
			params:{
				...this.state.params,
				channels:this.state.params.channels.filter(c => dataParams.chNames.includes(c))
			} 
		})
	}

    render() {
		const nodeInput=this.props.elements.find((elem) => elem.id==this.state.inputNodeId)
		if(nodeInput!=undefined){
			const signalData=nodeInput.signalsData.find(d => d.dataType==this.state.dataType)
			if(signalData!=undefined){
				if(this.props.inputsReady.includes(signalData.id) && this.state.oldSignalId!=signalData.id){
					this.preprocessData(signalData)
				}
			}
		}
		return (
			<>
				
					<CCardBody >
						{ this.state.dataReady ?
							<div style={this.state.style}>
								<ChartPSD
								data={this.state.params.channels.length==1 ?this.state.data[0]: this.state.data}
								chartStyle={{height: '100%', width:'100%'}}
								channels={this.state.params.channels} //Lo dejamos por las dudas --->//==undefined ? nodeInput.dataParams.chNames[0] : this.state.params.channels[0]}
								/> 
							</div>
							:
							<div style={{alignItems:'center', textAlign:'center', margin:'auto',...this.state.style}}>
								<h4>Cargando...</h4>
								<CIcon size= "xl" name="cil-cloud-download"/>
							</div>
						}
					</CCardBody>
				
			</>
			
		)
		
    }
}


const mapStateToProps = (state) => {
	return{
	  elements:state.diagram.elements,
	  inputsReady: state.diagram.inputsReady,
	  prevParams:state.plotParams.plots
	};
}
  
const mapDispatchToProps = (dispatch) => {
	return {
		fetchSignal: (id,channels,plotParams,nodeId,type) => dispatch(fetchSignal(id,channels,plotParams,nodeId,type)),
		updatePlotParams: (params) => dispatch(updatePlotParams(params)),
		deleteItemInputsReady: (id) => dispatch(deleteItemInputsReady(id)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartSpectrum)