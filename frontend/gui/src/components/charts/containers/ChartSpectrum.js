import React, { Component } from 'react'
import {
	CCard,
	CCardBody,
	CCardGroup,
	CCol
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

		let message='';

		const dataType='PSD';
		if(nodePlot.inputData.fetchInput){
			const nodeInput=this.props.elements.find((elem) => elem.id==nodePlot.inputData.inputNodeId)

			channels=params.channels;
			/*if(nodeInput.params.channels==undefined){channels=params.channels;}
			else{channels=nodeInput.params.channels;}*/

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
						if(JSON.stringify(this.props.prevParams[nodePlot.id])!==JSON.stringify(params)){
							this.props.deleteItemInputsReady(signalData.id)
							oldSignalId=signalData.id
							fetchSignal=true;
						}
					}
				}
			}
			if(fetchSignal){
				message=<div>
						<h4>Cargando...</h4>
						<CIcon size= "xl" name="cil-cloud-download"/>
						</div>
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
						}else{
							message=<div>
										<h4>No hay canales.</h4>
										<CIcon size= "xl" name="cil-x-circle"/>
									</div>
						}
							
					}
					if(prepareData){ //Check if at least one channels is in plot params
					
						data=this.preprocessData(signalData,params.channels,params,false)
						dataReady=true
					}
					
				}
			}
		}else{
			message=<div>
						<h4>No procesado.</h4>
						<CIcon size= "xl" name="cil-x-circle"/>
					</div>
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
			outputType:outputType,
			message:message,

		}
    }

	preprocessData(signalData,plotChannels,plotParams,updating){

		let minIndex=0;
		let limit=signalData.utils.freqs.length;
		let maxIndex=limit;
		let target;
		let goal;
		if(plotParams.minXWindow!=null){
			goal=plotParams.minXWindow
			target=signalData.utils.freqs.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
			minIndex=signalData.utils.freqs.findIndex(f => f==target)
			if(minIndex>=limit) minIndex=0; //Se paso, tira error
		}
		if(plotParams.maxXWindow!=null){
			goal=plotParams.maxXWindow
			target=signalData.utils.freqs.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
			maxIndex=signalData.utils.freqs.findIndex(f => f==target)
			if(maxIndex>limit) maxIndex=limit; //Se paso, tira error
    	}
    	
		let data=PrepareDataForPlot(
			signalData.utils.freqs, //if empty [] --> SampleToTimes 
			signalData.data,
			signalData.sFreq,
			signalData.chNames,
			plotChannels,
			minIndex,
			maxIndex,
			1//Math.pow(10,6)
			)

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
	componentDidUpdate(prevProps){
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
				<CCol xl={this.props.plotSize}>
					<CCardBody >
						{ this.state.dataReady ?
							<div style={this.state.style}>
								<ChartPSD
								nodeId={this.props.nodeId}
								data={this.state.params.channels.length==1 ?this.state.data[0]: this.state.data}
								chartStyle={{height: '100%', width:'100%'}}
								channels={this.state.params.channels} //Lo dejamos por las dudas --->//==undefined ? nodeInput.dataParams.chNames[0] : this.state.params.channels[0]}
								epoch={this.state.params.epochs}
								/> 
							</div>
							:
							<div style={{alignItems:'center', textAlign:'center', margin:'auto',...this.state.style}}>
								{this.state.message}
							</div>
						}
					</CCardBody>
				</CCol>
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
		updatePlotParams: (params) => dispatch(updatePlotParams(params)),
		deleteItemInputsReady: (id) => dispatch(deleteItemInputsReady(id)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartSpectrum)