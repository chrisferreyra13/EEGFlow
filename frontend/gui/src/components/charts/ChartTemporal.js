import React, { Component } from 'react'
import {
	CCard,
	CCardBody,
	CCardGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {fetchSignal} from '../../redux/actions/Diagram'
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
		const nodePlot=this.props.elements.find((elem) => elem.id==this.props.nodeId) //Busco nodoPlot para setear los params
		let params={}
		if(nodePlot.params.channels==null){ 
			params={ //Default params
				channels:['EEG 016','EEG 017'], //Para ChartTemporal, los canales son una lista de strings
				minTimeWindow:null,
				maxTimeWindow:null,
				largeSize:'on',
				mediumSize:'off',
				smallSize:'off',
				
			}
		}else{
			params={
				channels:nodePlot.params.channels.split(','), // En params se guarda como ch separado por comas
				...nodePlot.params
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

		let data=[]
		let dataReady=false;

		if(nodePlot.inputData.fetchInput){
			const nodeInput=this.props.elements.find((elem) => elem.id==nodePlot.inputData.inputNodeId)
			if(!nodeInput.dataParams.dataReady){
				this.props.fetchSignal(nodeInput.dataParams.id)
				
			}

		}

		this.state={
			dataReady:dataReady,
			nodePlot:nodePlot,
			params:params,
			style:style,
			data:data,

		}

    }

	preprocessData(dataParams){
		if(this.state.dataReady==true){
			return
		}

		let data=[];
		let limit = dataParams.data[0].length;
		let dataPoints = [];
		let minTimeIndex=0;
		let maxTimeIndex=limit;
		if(this.state.params.minTimeWindow!=null){
			minTimeIndex=Math.round(this.state.params.minTimeWindow*dataParams.sFreq)
			if(minTimeIndex>=limit) minTimeIndex=0; //Se paso, tira error
		}
		if(this.state.params.maxTimeWindow!=null){
			maxTimeIndex=Math.round(this.state.params.maxTimeWindow*dataParams.sFreq)
			if(maxTimeIndex>limit) maxTimeIndex=limit; //Se paso, tira error
		}

		if(this.state.params.channels.length!=0){
			// Si no coinciden hay error, tenerlo en cuenta para hacer una excepcion
			const idxs=this.state.params.channels.map((ch) => dataParams.chNames.findIndex((chName) => ch===chName))
			for(var j = 0; j < this.state.params.channels.length; j += 1){
				for (var i = minTimeIndex; i < maxTimeIndex; i += 1) {
					dataPoints.push({
					x: SamplesToTimes(i,dataParams.sFreq,3),
					y: Math.pow(10,6)*dataParams.data[idxs[j]][i]
				});
				}
				data.push(dataPoints)
				dataPoints=[]
			}
		}else{
			for (var i = minTimeIndex; i < maxTimeIndex; i += 1) {
				dataPoints.push({
				x: SamplesToTimes(i,dataParams.sFreq,3),
				y: Math.pow(10,6)*dataParams.data[1][i]
				});
			}
			data=dataPoints
		}

		this.setState({
			data:data,
			dataReady:true,
		})

	}


    render() {
		let nodeInput
		if(this.props.inputsReady.includes(this.state.nodePlot.inputData.inputNodeId)){
			nodeInput=this.props.elements.find((elem) => elem.id==this.state.nodePlot.inputData.inputNodeId)
			this.preprocessData(nodeInput.dataParams)
			
		}

		return (
			<>
				<CCard>
					<CCardBody >
						{ this.state.dataReady ?
							<div style={this.state.style}>
								{this.state.params.channels.length==1 ?
								<ChartChannel
								data={this.state.data}
								chartStyle={{height: '100%', width:'100%'}}
								channel={this.state.params.channels[1]==undefined ? nodeInput.dataParams.chNames[1] : this.state.params.channels[1]}
								/> :
								<ChartChannels 
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
	  inputsReady: state.diagram.inputsReady
	  
	};
}
  
const mapDispatchToProps = (dispatch) => {
	return {
		fetchSignal: (id) => dispatch(fetchSignal(id)),
	};
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartTemporal)