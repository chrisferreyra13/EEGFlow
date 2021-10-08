import React, { Component } from 'react'
import {
	CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {fetchSignal,deleteItemInputsReady} from '../../../redux/actions/Diagram'
import {connect} from 'react-redux'
import ChartTFR from '../ChartTFR'
import {PrepareDataForPlot} from '../../../tools/Utils'

import {updatePlotParams} from '../../../redux/actions/Plot' 

class ChartTimeFrequency extends Component {
    constructor(props){
        super(props);
		const nodePlot=this.props.elements.find((elem) => elem.id==this.props.nodeId) //Busco nodoPlot para setear los params
		let params={}
		if(nodePlot.params.channels==null){ 
			params={ //Default params
				channels:null,
				minXWindow:null,
     			maxXWindow:null,
				size:'l'
				
			}
		}else{
			params={
				channels:nodePlot.params.channels,
				size:nodePlot.params.size==null ? 'm' : nodePlot.params.size
			}
				
		}

		this.preprocessData=this.preprocessData.bind(this);

		let style={} //Seteando las dimensiones del grafico en base a los parametros
		switch(params.size){
			case 'l':
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
		
		}

		let data=[];
		let dataReady=false;

		let channels;
		let oldSignalId=null;

		let limit;
		let minIndex=0;
		let maxIndex=0;
		const dataType='TIME_FREQUENCY';
		if(nodePlot.inputData.inputNodeId!=null){
			const nodeInput=this.props.elements.find((elem) => elem.id==nodePlot.inputData.inputNodeId)
			//let signalData=nodeInput.signalsData.find(d => d.dataType==dataType)

			if(nodeInput.params.channels==undefined){
				channels=nodePlot.params.channels
			}
			else{
				channels=nodeInput.params.channels
			}
			let signalData=nodeInput.signalsData.find(s => {
				if(s.processId==nodePlot.processParams.processId && s.dataType==dataType)return true
				return false
			})
			if(signalData==undefined){
				this.props.fetchSignal(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,dataType,nodePlot.processParams.processId)
				this.props.updatePlotParams(nodePlot.id,{...nodePlot.params})
			}
			else{
				if(!signalData.dataReady){
					this.props.deleteItemInputsReady(signalData.id)
					oldSignalId=signalData.id
					this.props.fetchSignal(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,dataType,nodePlot.processParams.processId)
					this.props.updatePlotParams(nodePlot.id,{...nodePlot.params})
				}
				else{
					if(Object.keys(this.props.prevParams).includes(nodePlot.id)){
						if(JSON.stringify(this.props.prevParams[nodePlot.id])!==JSON.stringify(nodePlot.params)){
							this.props.deleteItemInputsReady(signalData.id)
							oldSignalId=signalData.id
							this.props.fetchSignal(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,dataType,nodePlot.processParams.processId)
							this.props.updatePlotParams(nodePlot.id,{...nodePlot.params})
						}
					}
				}
			}
		
			if(signalData!=undefined){
				if(this.props.inputsReady.includes(signalData.id)){
					if(signalData.chNames.some(ch => params.channels.includes(ch))){ //Check if at least one channels is in plot params
						data=this.preprocessData(signalData,params,false)
						dataReady=true
					}
				}
			}
			
			
		}
		this.state={
			dataReady:dataReady,
			inputNodeId:nodePlot.inputData.inputNodeId,
			processId:nodePlot.processParams.processId,
			dataType:dataType,
			params:params,
			style:style,
			data:data,
			oldSignalId:oldSignalId,
			minIndex:minIndex,
			maxIndex:maxIndex,

		}

    }

	preprocessData(signalData, plotParams,updating){
		let times=signalData.times
		let freqs=signalData.freqs
		let power=signalData.data[0] // solo funciona si es average
		/*let minIndex=0;
		let maxIndex=limit;
		if(plotParams.minXWindow!=null){
			minIndex=Math.round(plotParams.minXWindow*signalData.sFreq)
			if(minIndex>=limit) minIndex=0; //Se paso, tira error
		}
		if(plotParams.maxXWindow!=null){
			maxIndex=Math.round(plotParams.maxXWindow*signalData.sFreq)
			if(maxIndex>limit) maxIndex=limit; //Se paso, tira error
    	}*/
		let data={
			power:power,
			times:times,
			freqs:freqs
		}
		
		if(updating)
			this.setState({
				data:data,
				dataReady:true,
			})
		else return data

	}
	
	componentDidUpdate(prevProps,prevState){
		if(prevProps.inputsReady!==this.props.inputsReady){
			let minIndex=0;
			let dataReady=false;
			const nodeInput=this.props.elements.find((elem) => elem.id==this.state.inputNodeId)
			if(nodeInput!=undefined){
				let signalData=nodeInput.signalsData.find(s => {
					if(s.processId==this.state.processId && s.dataType==this.state.dataType)return true
					return false
				})
				if(signalData!=undefined){
					if(this.props.inputsReady.includes(signalData.id) && this.state.oldSignalId!=signalData.id){
						if(this.state.dataReady==false){
							if(signalData.chNames.some(ch => this.state.params.channels.includes(ch))){ //Check if at least one channels is in plot params
								this.preprocessData(signalData,this.state.params,true)
								//dataReady=true
							}
						}
					}
				}
			}
		}
		
	}

    render() {
		
		return (
			<>
				
				<CCardBody >
						{ this.state.dataReady ?
							<div style={this.state.style}>
								<ChartTFR
								data={this.state.params.channels.length==1 ?this.state.data[0]: this.state.data}
								chartStyle={{height: '100%', width:'100%'}}
								channels={this.state.params.channels}
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
		fetchSignal: (id,channels,plotParams,nodeId,type,plotProcessId) => dispatch(fetchSignal(id,channels,plotParams,nodeId,type,plotProcessId)),
		updatePlotParams: (id,params) => dispatch(updatePlotParams(id,params)),
		deleteItemInputsReady: (id) => dispatch(deleteItemInputsReady(id)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartTimeFrequency)