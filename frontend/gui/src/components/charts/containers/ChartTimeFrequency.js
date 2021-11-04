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
		const outputType=nodePlot.inputData.outputType==null? 'raw' : nodePlot.inputData.outputType
		if(nodePlot.params.channels==null){ 
			if(outputType=='raw'){
				params={ //Default params
					...nodePlot.params,
					channels:'prev',
					epochs:null,
					minXWindow:nodePlot.params.minTimeWindow,
					maxXWindow:nodePlot.params.maxTimeWindow,
					size:nodePlot.params.size==null ? 'l' : nodePlot.params.size,
				}
			}else{
				params={ //Default params
					...nodePlot.params,
					channels:'prev',
					epochs:'1',
					minXWindow:nodePlot.params.minTimeWindow,
					maxXWindow:nodePlot.params.maxTimeWindow,
					size:nodePlot.params.size==null ? 'l' : nodePlot.params.size
				}
			}
		}else{
			params={
				...nodePlot.params,
				channels:nodePlot.params.channels,
				epochs:nodePlot.params.epochs,
				minXWindow:parseFloat(nodePlot.params.minFreqWindow),
				maxXWindow:parseFloat(nodePlot.params.maxFreqWindow),
				size:nodePlot.params.size==null ? 'm' : nodePlot.params.size

			}
		}

		this.preprocessData=this.preprocessData.bind(this);

		let style={} //Seteando las dimensiones del grafico en base a los parametros
		switch(params.size){
			case 'l':style={height:'75vh',}; break;
			case 'm':style={height:'60vh',}; break;
			default: style={height:'75vh',}; break;
		}

		let data=[];
		let dataReady=false;

		let channels;
		let oldSignalId=null;
		let fetchSignal=false;

		let limit;
		let minIndex=0;
		let maxIndex=0;
		const dataType='TIME_FREQUENCY';
		if(nodePlot.inputData.fetchInput){
			const nodeInput=this.props.elements.find((elem) => elem.id==nodePlot.inputData.inputNodeId)

			if(nodeInput.params.channels==undefined){channels=params.channels;}
			else{channels=nodeInput.params.channels;}

			let signalData=nodeInput.signalsData.find(s => {
				if(s.processId==nodePlot.processParams.processId && s.dataType==dataType)return true;
				return false
			})
			
			if(signalData==undefined){fetchSignal=true;}
			else{
				if(!signalData.dataReady){
					this.props.deleteItemInputsReady(signalData.id)
					oldSignalId=signalData.id
					fetchSignal=true;
				}
				else{
					if(Object.keys(this.props.prevParams).includes(nodePlot.id)){
						if(JSON.stringify(this.props.prevParams[nodePlot.id])!==JSON.stringify(nodePlot.params)){
							this.props.deleteItemInputsReady(signalData.id)
							oldSignalId=signalData.id
							fetchSignal=true;
						}
					}
				}
			}
			if(fetchSignal){
				this.props.fetchSignal(nodeInput.params.id,channels,params,nodeInput.id,dataType,nodePlot.processParams.processId)
				this.props.updatePlotParams(nodePlot.id,{...params})
			}

			let prepareData=false
			if(signalData!=undefined){
				if(this.props.inputsReady.includes(signalData.id)){
					if(params.channels=='prev'){
						// if 'prev' (when the user didn't set channels) use signalData as default
						params.channels=signalData.chNames
						prepareData=true
					}
					else{
						if(signalData.chNames.some(ch => params.channels.includes(ch))){
							prepareData=true
							params.channels=signalData.chNames.filter(ch => params.channels.includes(ch))
						}
							
					}
					if(prepareData){ //Check if at least one channels is in plot params
					
						data=this.preprocessData(signalData,params.channels,params,false)
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
			outputType:outputType,

		}

    }

	preprocessData(signalData,plotChannels,plotParams,updating){

		let data={
			power:signalData.data,
			times:signalData.utils.times,
			freqs:signalData.utils.freqs,
			vMin:signalData.utils.vmin,
			vMax:signalData.utils.vmax,
			sFreq:signalData.sFreq
		}
		
		if(updating)
			this.setState({
				data:data,
				dataReady:true,
				params:{
					...plotParams,
					channels:plotChannels
				} 
			})
		else return data

	}
	
	componentDidUpdate(prevProps,prevState){
		if(prevProps.inputsReady!==this.props.inputsReady){
			let prepareData=false;
			let plotChannels=null;
			let dataReady=false;
			const nodeInput=this.props.elements.find((elem) => elem.id==this.state.inputNodeId)
			if(nodeInput!=undefined){
				let signalData=nodeInput.signalsData.find(s => {
					if(s.processId==this.state.processId && s.dataType==this.state.dataType)return true;
					return false
				})
				if(signalData!=undefined){
					if(this.props.inputsReady.includes(signalData.id) && this.state.oldSignalId!=signalData.id){
						if(this.state.dataReady==false){
							if(this.state.params.channels=='prev'){
								plotChannels=signalData.chNames
								prepareData=true
							}
							else{
								//Check if at least one channels is in plot params
								if(signalData.chNames.some(ch => this.state.params.channels.includes(ch))){
									prepareData=true
									plotChannels=signalData.chNames.filter(ch => this.state.params.channels.includes(ch))
								}
							}
							if(prepareData){
								this.preprocessData(signalData,plotChannels,this.state.params,true)
								dataReady=true
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
								epoch={this.state.params.epochs}
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