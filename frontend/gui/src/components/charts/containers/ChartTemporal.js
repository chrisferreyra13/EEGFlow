import React, { Component } from 'react'
import {
	CCard,
	CCardBody,
	CCardGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {fetchSignal,deleteItemInputsReady,fetchMethodResult} from '../../../redux/actions/Diagram'
import {connect} from 'react-redux'
import ChartChannelTime from '../ChartChannelTime'
import ChartChannelsTime from '../ChartChannelsTime'
import {PrepareDataForPlot} from '../../../tools/Utils'

import {updatePlotParams} from '../../../redux/actions/Plot' 

const METHOD_NODES=["MAX_PEAK","EVENTS"]

class ChartTemporal extends Component {
    constructor(props){
        super(props);
		const nodePlot=this.props.elements.find((elem) => elem.id==this.props.nodeId) //Busco nodoPlot para setear los params
		let params={}
		const outputType=nodePlot.inputData.outputType==null? 'raw' : nodePlot.inputData.outputType
		if(nodePlot.params.channels==null){ 
			if(outputType=='raw'){
				params={ //Default params
					channels:'prev',
					epochs:null,
					minXWindow:nodePlot.params.minTimeWindow,
					maxXWindow:nodePlot.params.maxTimeWindow,
					size:nodePlot.params.size==null ? 'l' : nodePlot.params.size
				}
			}else{
				params={ //Default params
					channels:'prev',
					epochs:'1',
					minXWindow:nodePlot.params.minTimeWindow,
					maxXWindow:nodePlot.params.maxTimeWindow,
					size:nodePlot.params.size==null ? 'l' : nodePlot.params.size
				}
			}
			
		}else{
			params={
				channels:nodePlot.params.channels,
				epochs:nodePlot.params.epochs,
				minXWindow:nodePlot.params.minTimeWindow,
				maxXWindow:nodePlot.params.maxTimeWindow,
				size:nodePlot.params.size==null ? 'm' : nodePlot.params.size
			}
				
		}

		this.preprocessData=this.preprocessData.bind(this);
		this.preprocessMethodResult=this.preprocessMethodResult.bind(this);

		let style={} //Seteando las dimensiones del grafico en base a los parametros
		switch(params.size){
			case 'l':style={height:'75vh',}; break;
			case 'm':style={height:'60vh',width:'600px'}; break;
			default: style={height:'75vh',}; break;
		}

		let data=[];
		let dataReady=false;

		let channels;
		let oldSignalId=null;

		let methodResultExists=false;
		let methodResultReady=false;
		let methodResult=[];
		let fetchSignal=false;
		let fetchMethodResult=false;

		let limit;
		let minIndex=0;
		let maxIndex=0;
		const dataType='TIME_SERIES';
		if(nodePlot.inputData.inputNodeId!=null){
			const nodeInput=this.props.elements.find((elem) => elem.id==nodePlot.inputData.inputNodeId)

			if(nodeInput.params.channels==undefined){channels=params.channels}
			else{channels=nodeInput.params.channels}

			let signalData=nodeInput.signalsData.find(s => {
				if(s.processId==nodePlot.processParams.processId && s.dataType==dataType)return true
				return false
			})

			if(signalData==undefined){
				fetchSignal=true;
				if(METHOD_NODES.includes(nodeInput.elementType)){fetchMethodResult=true;}
			}
			else{
				if(!signalData.dataReady){
					this.props.deleteItemInputsReady(signalData.id)
					oldSignalId=signalData.id
					fetchSignal=true
					if(METHOD_NODES.includes(nodeInput.elementType)){fetchMethodResult=true}
				}
				else{
					if(Object.keys(this.props.prevParams).includes(nodePlot.id)){
						if(JSON.stringify(this.props.prevParams[nodePlot.id])!==JSON.stringify(nodePlot.params)){
							this.props.deleteItemInputsReady(signalData.id)
							oldSignalId=signalData.id
							fetchSignal=true
							if(METHOD_NODES.includes(nodeInput.elementType)){fetchMethodResult=true}
						}
					}
				}
			}
			if(fetchSignal){
				this.props.fetchSignal(nodeInput.params.id,channels,params,nodeInput.id,dataType,nodePlot.processParams.processId)
				this.props.updatePlotParams(nodePlot.id,{...params})
			}
			if(fetchMethodResult){
				this.props.fetchMethodResult(nodeInput.params.id,channels,params,nodeInput.id,nodeInput.elementType)
				methodResultExists=true
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

						limit = signalData.data[0].length;
						minIndex=0;
						maxIndex=limit;
						if(params.minXWindow!=null){
							minIndex=Math.round(params.minXWindow*signalData.sFreq)
							if(minIndex>=limit) minIndex=0; //Se paso, tira error
						}
						if(params.maxXWindow!=null){
							maxIndex=Math.round(params.maxXWindow*signalData.sFreq)
							if(maxIndex>limit) maxIndex=limit; //Se paso, tira error
						}
					}
				}
			}
			signalData=nodeInput.signalsData.find(d => d.dataType==nodeInput.elementType)
			if(signalData!=undefined){
				if(this.props.inputsReady.includes(signalData.id)){
					methodResult=this.preprocessMethodResult(signalData,params.channels,params,minIndex,nodeInput.params,false)
					methodResultReady=true
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
			methodResultReady:methodResultReady,
			methodResult:methodResult,
			methodResultExists:methodResultExists,
			minIndex:minIndex,
			maxIndex:maxIndex,
			outputType:outputType,

		}

    }

	preprocessData(signalData, plotChannels,plotParams,updating){
		let dataX=[]
		if(signalData.times!=undefined)
			dataX=signalData.times

		let limit = signalData.data[0].length;
		let minIndex=0;
		let maxIndex=limit;
		if(plotParams.minXWindow!=null){
			minIndex=Math.round(plotParams.minXWindow*signalData.sFreq)
			if(minIndex>=limit) minIndex=0; //Se paso, tira error
		}
		if(plotParams.maxXWindow!=null){
			maxIndex=Math.round(plotParams.maxXWindow*signalData.sFreq)
			if(maxIndex>limit) maxIndex=limit; //Se paso, tira error
    	}

		let data=PrepareDataForPlot(
			dataX, //if empty [] --> make x in time 
			signalData.data,
			signalData.sFreq,
			signalData.chNames,
			plotChannels,
			minIndex,
			maxIndex,
			Math.pow(10,6)
			)
		
		if(updating)
			this.setState({
				data:data,
				dataReady:true,
				minIndex:minIndex,
				maxIndex:maxIndex,
				params:{
					...this.state.params,
					channels:plotChannels
				}
			})
		else return data

	}
	preprocessMethodResult(signalData,plotChannels,plotParams,minIndex,nodeInputParams,updating){
		let methodResult={data:null, type:null};
		switch(signalData.dataType){
			case "MAX_PEAK":
				methodResult.data=[];
				let newLocations=[];
				signalData.chNames.forEach((chN,i) => {
					if(plotChannels.includes(chN)){
						newLocations=[];
						signalData.data[i]["locations"].forEach(idx => {
							if(idx>=minIndex)
								newLocations.push(idx-minIndex)
						})
						methodResult.data.push({
							channel:chN,
							locations:newLocations,
						})
					}
				})
				methodResult.type=signalData.dataType
				break
			case "EVENTS":
				let eventSamples=[];
				let eventIds=[];
				let selectedEvents=nodeInputParams.selectedEvents==null ? []:nodeInputParams.selectedEvents.map(id => parseInt(id))

				signalData.data["event_samples"].forEach((idx,j) =>{
					if(selectedEvents.includes(signalData.data["event_ids"][j]) || selectedEvents.length==0){
						if(idx>=minIndex){
							eventSamples.push(idx-minIndex)
							eventIds.push(signalData.data["event_ids"][j])
						}
					}
				})
				methodResult.data={
					eventIds:eventIds,
					eventSamples:eventSamples,
				}
				methodResult.type=signalData.dataType
				break
			default:
				return methodResult
		}

		if(updating)
			this.setState({
				methodResult:methodResult,
				methodResultReady:true,
			})
		else return methodResult
	}
	componentDidUpdate(prevProps,prevState){
		if(prevProps.inputsReady!==this.props.inputsReady){
			let minIndex=0;
			let dataReady=false;
			let prepareData=false;
			let plotChannels=null;
			const nodeInput=this.props.elements.find((elem) => elem.id==this.state.inputNodeId)
			if(nodeInput!=undefined){
				let signalData=nodeInput.signalsData.find(s => {
					if(s.processId==this.state.processId && s.dataType==this.state.dataType)return true;
					return false;
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
								let limit = signalData.data[0].length;
								if(this.state.params.minXWindow!=null){
									minIndex=Math.round(this.state.params.minXWindow*signalData.sFreq)
									if(minIndex>=limit) minIndex=0; //Se paso, tira error
								}
							}
						}
					}
				}
				if(this.state.methodResultExists){
					let signalData=nodeInput.signalsData.find(d => d.dataType==nodeInput.elementType)
					if(signalData!=undefined){
						if(this.props.inputsReady.includes(signalData.id) && this.state.oldSignalId!=signalData.id){
							//if(this.state.methodResultReady==false || this.state.dataReady==true){
							if(dataReady==true){
								this.preprocessMethodResult(signalData,plotChannels,this.state.params,minIndex,nodeInput.params,true)
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
				
				<CCardBody style={{alignItems:'center'}}>
					{ this.state.dataReady ?
						<div style={{alignItems:'center', textAlign:'center', margin:'auto',...this.state.style}}>
							{this.state.params.channels.length==1 ?
							<ChartChannelTime
							methodResult={this.state.methodResult}
							data={this.state.data[0]}
							chartStyle={{height: '100%', width:'100%', alignItems:'center'}}
							channel={this.state.params.channels[0]} //Lo dejamos por las dudas --->//==undefined ? nodeInput.dataParams.chNames[0] : this.state.params.channels[0]}
							epoch={this.state.params.epochs}
							/> :
							<ChartChannelsTime
							methodResult={this.state.methodResult}
							data={this.state.data}
							chartStyle={{height: '100%', width:'100%', alignItems:'center'}}
							channels={this.state.params.channels}
							epoch={this.state.params.epochs}
							/>
							}
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
		fetchMethodResult:(id,channels,plotParams,nodeId,type) => dispatch(fetchMethodResult(id,channels,plotParams,nodeId,type)),
		updatePlotParams: (id,params) => dispatch(updatePlotParams(id,params)),
		deleteItemInputsReady: (id) => dispatch(deleteItemInputsReady(id)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartTemporal)
