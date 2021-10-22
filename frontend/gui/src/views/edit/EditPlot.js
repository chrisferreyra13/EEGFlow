import React, { Component, lazy } from 'react'
import {connect, connectAdvanced} from 'react-redux'
import {
  CCol,
  CRow
} from  '@coreui/react'

//import {fetchSignal} from '../../redux/actions/Diagram'

import { diagramView } from '../../redux/actions/EditSession'
import { enableChartTemporal } from '../../redux/actions/SideBar'

const ChartTemporal = lazy(() => import('../../components/charts/containers/ChartTemporal.js'))
const ChartSpectrum = lazy(() => import('../../components/charts/containers/ChartSpectrum.js'))
const ChartTimeFrequency = lazy(() => import('../../components/charts/containers/ChartTimeFrequency.js'))
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
          fetchInput:elem.fetchInput,
          size:elem.params.size==null ? 'm' : elem.params.size
        }
      }else return null
    })

    let fullRow=false
    let rowElements=0;
    let grid=[]
    let content;
    grid=nodePlots.map((node) =>
      {
        if(node.params.size=='m'){
          if(fullRow==false){
            content=<div key={node.id}>
                      {this.chartSelection(node)}
                    </div>
            rowElements+=1;
            if(rowElements==2){
              fullRow=true
            }
          }else{
            content=<CRow key={node.id}>
                      {this.chartSelection(node)}
                    </CRow>
            rowElements=1;
            fullRow=false;
          }
        }else{
          content=<CRow key={node.id}>
                      {this.chartSelection(node)}
                  </CRow>
          rowElements=1;
          fullRow=true;
        }
        return content
      }
    )

    this.state={
      nodePlots:nodePlots.filter((nodePlot) => nodePlot!=null),
      grid:grid
    }

    //this.idSelection=this.idSelection.bind(this);
    this.chartSelection=this.chartSelection.bind(this);

  }

  chartSelection(node){
    const charts = {
      PLOT_TIME_SERIES: {content:ChartTemporal},
      PLOT_PSD: {content:ChartSpectrum},
      PLOT_TIME_FREQUENCY: {content:ChartTimeFrequency},
      //COMPLETAR
      //Aca van los otros tipos de charts
      //
    };
    if(charts[node.plotType]==undefined){
      return null
    }
    const chart=charts[node.plotType]

    return <chart.content nodeId={node.id}/> // Cambiar por props cuando se necesiten mas props
  }
  
  render(){
    let fullRow=false;
    return (
      <>
        <div>
          {this.state.grid.map((gridItem,j) =>{
            <div>
              {
                this.state.nodePlots[j].size=='m' ?
                <gridItem plotSize='6'/>
                :
                <gridItem plotSize='12'/>
              }
            </div>         
          })
          }
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
    //fetchSignal: (id) => dispatch(fetchSignal(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPlot)

const filterId = (elem) => {
  return elem.elementType!=undefined && elem.elementType.includes('PLOT')===true;
}
