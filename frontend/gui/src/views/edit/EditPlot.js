import React, { Component, lazy } from 'react'
import {connect, connectAdvanced} from 'react-redux'
import CIcon from '@coreui/icons-react'
import {fetchSignal} from '../../redux/actions/Diagram'
import { diagramView } from '../../redux/actions/EditSession'
import { enableChartTemporal } from '../../redux/actions/SideBar'

const ChartTemporal = lazy(() => import('../../components/charts/ChartTemporal.js'))
//const FormContainer = lazy(() => import('../../components/forms/FormContainer.js'))

class EditPlot extends Component {
  constructor(props){
    super(props);
    this.props.diagramView(false);
    const nodePlots=this.props.elements.map((elem) => { //Busco los nodos tipo 'output'
      if(filterId(elem)==true){
        return {
          plotType:elem.elementType,
          id:elem.id,
          isUse:false,
          fetchInput:elem.fetchInput
        }
      }else return null
    })

    let basicDiagram=false
    if(this.props.elements[0].elementType=='TIME_SERIES' && this.props.elements[1].elementType=='PLOT_TIME_SERIES'){
      basicDiagram=true
    }


    this.state={
      nodePlots:nodePlots.filter((nodePlot) => nodePlot!=null),
      dataReady:false,
      nodeTimeSeries: this.props.elements.find(n=> n.elementType=='TIME_SERIES'),       // nodo de la señal temporal
    }

    //this.idSelection=this.idSelection.bind(this);
    this.chartSelection=this.chartSelection.bind(this);
    this.fetchData=this.fetchData.bind(this);
    this.fetcher=this.fetcher.bind(this);

  }

  fetcher(id){
    return new Promise(resolve => {
      this.props.fetchSignal(id)
      setTimeout(() => {
        resolve(true)
      }, 5000);
      
    })
  }

  async fetchData(id){
    let dataReady= await this.fetcher(id)
    return dataReady
  }

  chartSelection(node){
    const charging=<div style={{alignItems:'center', textAlign:'center', margin:'auto'}}>
                  <h4>Cargando...</h4>
                  <CIcon size= "xl" name="cil-cloud-download" />
                 </div>

    const charts = {
      PLOT_TIME_SERIES: {content:ChartTemporal},
      //COMPLETAR
      //Aca van los otros tipos de charts
      //
    };
    if(charts[node.plotType]==undefined){
      return null
    }
    const chart=charts[node.plotType]

    let content;

    if(this.state.dataReady==false){
      this.fetchData(this.state.nodeTimeSeries.params.id).then(ready =>{
        this.setState({
          dataReady:ready,
          nodeTimeSeries:this.props.elements.find(n=> n.elementType=='TIME_SERIES'),
        })
      })
    }

    if(this.state.dataReady==true){ // si no tengo señal
      content=<chart.content nodeId={node.id} data={this.state.nodeTimeSeries}/>
    }else{
      content=charging
    }

    return content // Cambiar por props cuando se necesiten mas props
  }
  
  render(){

    return (
      <>
        <div>
          {this.state.nodePlots.map((node) =>
            <div key={node.id}>
              {this.chartSelection(node)}
            </div>   
          )}
        </div>         
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return{
    fileId: state.file.fileId,
    enableChart: state.plots.chartTemporal,
    elements: state.diagram.elements,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    enableChartTemporal: () => dispatch(enableChartTemporal()),
    //fetchTimeSeries: (fileId) => dispatch(fetchTimeSeries(fileId)),
    diagramView: (activate) => dispatch(diagramView(activate)),
    fetchSignal: (id) => dispatch(fetchSignal(id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPlot)

const filterId = (elem) => {
  return elem.elementType!=undefined && elem.elementType.includes('PLOT')===true;
}
