import React, { Component } from 'react'
import {
	CCard,
	CCardBody,
	CCardGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {fetchSignal} from '../../../redux/actions/Diagram'
import {connect} from 'react-redux'
import ChartPSD from '../ChartPSD'

import {PrepareDataForPlot} from '../../../tools/Signal'



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
				minXWindow:nodePlot.params.minFreqWindow,
				maxXWindow:nodePlot.params.maxFreqWindow,
				size:nodePlot.params.size
			}
		}

		this.preprocessData=this.preprocessData.bind(this);

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

		let data=[];
		let dataReady=false;
		const dataType='PSD';
		if(nodePlot.inputData.fetchInput){
			const nodeInput=this.props.elements.find((elem) => elem.id==nodePlot.inputData.inputNodeId)
			const signalData=nodeInput.signalsData.find(d => d.dataType==dataType)
			if(signalData==undefined){
				this.props.fetchSignal(nodeInput.params.id,nodeInput.params.channels,nodeInput.id,dataType)
			}
			else{
				if(!signalData.dataReady){
					this.props.fetchSignal(nodeInput.params.id,nodeInput.params.channels,nodeInput.id,dataType)
					
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
		if(this.state.params.minXWindow!=null){
			minIndex=this.state.params.minXWindow
			if(minIndex>=limit) minIndex=0; //Se paso, tira error
		}
		if(this.state.params.maxXWindow!=null){
			maxIndex=this.state.params.maxXWindow
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
		})

	}

    render() {

		const nodeInput=this.props.elements.find((elem) => elem.id==this.state.inputNodeId)
		const signalData=nodeInput.signalsData.find(d => d.dataType==this.state.dataType)
		if(signalData!=undefined){
			if(this.props.inputsReady.includes(signalData.id)){
				this.preprocessData(signalData)
			}
		}

		return (
			<>
				<CCard>
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
				</CCard>

			</>
			
		)
		
    }
}


const mapStateToProps = (state) => {
	return{
	  elements:state.diagram.elements,
	  inputsReady: state.diagram.inputsReady
	  
	};
}
  
const mapDispatchToProps = (dispatch) => {
	return {
		fetchSignal: (id,channels,nodeId,type) => dispatch(fetchSignal(id,channels,nodeId,type)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartSpectrum)