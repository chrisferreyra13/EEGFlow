import React, { Component, lazy } from 'react'
import {connect, connectAdvanced} from 'react-redux'

//import {fetchSignal} from '../../redux/actions/Diagram'

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

    this.state={
      nodePlots:nodePlots.filter((nodePlot) => nodePlot!=null),
    }

    //this.idSelection=this.idSelection.bind(this);
    this.chartSelection=this.chartSelection.bind(this);

  }

  chartSelection(node){
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

    return <chart.content nodeId={node.id} inputsReady={this.props.inputsReady}/> // Cambiar por props cuando se necesiten mas props
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
    inputsReady:state.diagram.inputsReady,

  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    enableChartTemporal: () => dispatch(enableChartTemporal()),
    //fetchTimeSeries: (fileId) => dispatch(fetchTimeSeries(fileId)),
    diagramView: (activate) => dispatch(diagramView(activate)),
    //fetchSignal: (id) => dispatch(fetchSignal(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPlot)

const filterId = (elem) => {
  return elem.elementType!=undefined && elem.elementType.includes('PLOT')===true;
}
