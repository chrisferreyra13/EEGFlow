import React, { Component } from 'react'
import {
	CCardBody,
	CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {fetchSignal,deleteItemInputsReady} from '../../../redux/actions/Diagram'
import {connect} from 'react-redux'
import ChartTF from '../ChartTF'

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
					size:nodePlot.params.size==null ? 'l' : nodePlot.params.size,
					dB:nodePlot.params.dB==null ? 'false' : nodePlot.params.dB,
					average:nodePlot.params.average==null ? 'false' : nodePlot.params.average,
					itc:nodePlot.params.return_itc==null ? 'false' : nodePlot.params.return_itc,

				}
			}else{
				params={ //Default params
					...nodePlot.params,
					channels:'prev',
					epochs:'1',
					size:nodePlot.params.size==null ? 'l' : nodePlot.params.size,
					dB:nodePlot.params.dB==null ? 'false' : nodePlot.params.dB,
					average:nodePlot.params.average==null ? 'false' : nodePlot.params.average,
					itc:nodePlot.params.return_itc==null ? 'false' : nodePlot.params.return_itc,
				}
			}
		}else{
			params={
				...nodePlot.params,
				size:nodePlot.params.size==null ? 'm' : nodePlot.params.size,
				dB:nodePlot.params.dB==null ? 'false' : nodePlot.params.dB,
				average:nodePlot.params.average==null ? 'false' : nodePlot.params.average,
				itc:nodePlot.params.return_itc==null ? 'false' : nodePlot.params.return_itc,

			}
		}
		console.log(nodePlot.params)
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

		let message='';	
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
			minIndex:minIndex,
			maxIndex:maxIndex,
			outputType:outputType,
			message:message

		}

    }

	preprocessData(signalData,plotChannels,plotParams,updating){
		let data={
			power:signalData.data.power,
			times:signalData.utils.times,
			freqs:signalData.utils.freqs,
			vMin:signalData.utils.vmin,
			vMax:signalData.utils.vmax,
			sFreq:signalData.sFreq
		}
		if(plotParams.itc=="true"){
			data["itc"]=signalData.data.itc
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
				<CCol xl={this.props.plotSize}>
					<CCardBody >
						{ this.state.dataReady ?
							<div style={this.state.style}>
								<ChartTF
								nodeId={this.props.nodeId}
								data={this.state.data}
								chartStyle={{height: '100%', width:'100%'}}
								channels={this.state.params.channels}
								epoch={this.state.params.epochs}
								dB={this.state.params.dB=='false' ? false : true}
								average={this.state.params.average=='false' ? false : true}
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
		updatePlotParams: (id,params) => dispatch(updatePlotParams(id,params)),
		deleteItemInputsReady: (id) => dispatch(deleteItemInputsReady(id)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartTimeFrequency)