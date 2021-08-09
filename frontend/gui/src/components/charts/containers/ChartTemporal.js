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

//import  CanvasJSReact from '../../canvasjs/canvasjs.react'
//import {Line} from 'react-chartjs-2'

class ChartTemporal extends Component {
    constructor(props){
        super(props);
		const nodePlot=this.props.elements.find((elem) => elem.id==this.props.nodeId) //Busco nodoPlot para setear los params
		let params={}
		if(nodePlot.params.channels==null){ 
			params={ //Default params
				channels:['EEG 01'], //Para ChartTemporal, los canales son una lista de strings
				minXWindow:null,
     			maxXWindow:null,
				size:'l'
				
			}
		}else{
			params={
				channels:nodePlot.params.channels,
				minXWindow:nodePlot.params.minTimeWindow,
				maxXWindow:nodePlot.params.maxTimeWindow,
				size:nodePlot.params.size
			}
				
		}

		this.preprocessData=this.preprocessData.bind(this);
		this.preprocessMethodResult=this.preprocessMethodResult.bind(this);

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
		let methodResultExists=false;
		let methodResultReady=false;
		let methodResult=[];
		const dataType='TIME_SERIES';
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

				if(METHOD_NODES.includes(nodeInput.elementType)){
					this.props.fetchMethodResult(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,nodeInput.elementType)
					methodResultExists=true
				}
			}
			else{
				if(!signalData.dataReady){
					this.props.deleteItemInputsReady(signalData.id)
					oldSignalId=signalData.id
					this.props.fetchSignal(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,dataType)
					this.props.updatePlotParams(nodePlot.id,{...nodePlot.params})

					if(METHOD_NODES.includes(nodeInput.elementType)){
						this.props.fetchMethodResult(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,nodeInput.elementType)
						methodResultExists=true
					}
				}
				else{
					if(Object.keys(this.props.prevParams).includes(nodePlot.id)){
						if(JSON.stringify(this.props.prevParams[nodePlot.id])!==JSON.stringify(nodePlot.params)){
							this.props.deleteItemInputsReady(signalData.id)
							oldSignalId=signalData.id
							this.props.fetchSignal(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,dataType)
							this.props.updatePlotParams(nodePlot.id,{...nodePlot.params})

							if(METHOD_NODES.includes(nodeInput.elementType)){
								this.props.fetchMethodResult(nodeInput.params.id,channels,nodePlot.params,nodeInput.id,nodeInput.elementType)
								methodResultExists=true
							}
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
			methodResultReady:methodResultReady,
			methodResult:methodResult,
			methodResultExists:methodResultExists,

		}

    }

	preprocessData(signalData){
		if(this.state.dataReady==true){
			return
		}
		let dataX=[]
		let limit = signalData.data[0].length;
		let minIndex=0;
		let maxIndex=limit;
		if(this.state.params.minXWindow!=null){
			minIndex=Math.round(this.state.params.minXWindow*signalData.sFreq)
			if(minIndex>=limit) minIndex=0; //Se paso, tira error
		}
		if(this.state.params.maxXWindow!=null){
			maxIndex=Math.round(this.state.params.maxXWindow*signalData.sFreq)
			if(maxIndex>limit) maxIndex=limit; //Se paso, tira error
    	}

		let data=PrepareDataForPlot(
			dataX, //if empty [] --> make x in time 
			signalData.data,
			signalData.sFreq,
			signalData.chNames,
			this.state.params.channels,
			minIndex,
			maxIndex,
			Math.pow(10,6)
			)

		this.setState({
			data:data,
			dataReady:true,
		})

	}
	preprocessMethodResult(signalData){
		if(this.state.methodResultReady==true){
			return
		}
		let methodResult;
		if(signalData.dataType="MAX_PEAK"){
			methodResult=signalData.chNames.map((chN,i) => {
				return {
					channel:chN,
					locations:signalData.data[i]["locations"]
				}
			})
		}
		this.setState({
			methodResult:methodResult,
			methodResultReady:true,
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
			if(this.state.methodResultExists){
				const signalData=nodeInput.signalsData.find(d => d.dataType==nodeInput.elementType)
				if(signalData!=undefined){
					if(this.props.inputsReady.includes(signalData.id) && this.state.oldSignalId!=signalData.id){
						this.preprocessMethodResult(signalData)
					}
				}
			}
		}

		return (
			<>
				<CCard>
					<CCardBody >
						{ this.state.dataReady ?
							<div style={this.state.style}>
								{this.state.params.channels.length==1 ?
								<ChartChannelTime
								methodResult={this.state.methodResult}
								data={this.state.data[0]}
								chartStyle={{height: '100%', width:'100%'}}
								channel={this.state.params.channels[0]} //Lo dejamos por las dudas --->//==undefined ? nodeInput.dataParams.chNames[0] : this.state.params.channels[0]}
								/> :
								<ChartChannelsTime
								methodResult={this.state.methodResult}
								data={this.state.data}
								chartStyle={{height: '100%', width:'100%'}}
								channels={this.state.params.channels}
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
				</CCard>
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
		fetchMethodResult:(id,channels,plotParams,nodeId,type) => dispatch(fetchMethodResult(id,channels,plotParams,nodeId,type)),
		updatePlotParams: (params) => dispatch(updatePlotParams(params)),
		deleteItemInputsReady: (id) => dispatch(deleteItemInputsReady(id)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartTemporal)