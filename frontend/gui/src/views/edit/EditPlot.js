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

    this.state={
      nodePlots:nodePlots.filter((nodePlot) => nodePlot!=null),
    }

    //this.idSelection=this.idSelection.bind(this);
    this.chartSelection=this.chartSelection.bind(this);
    this.buildGrid=this.buildGrid.bind(this);

  }
  buildGrid(){
    let rowMediums=[]
    let grid=[]
    let content;
    let mediumNode=null
    this.state.nodePlots.forEach((node) =>
      {
        if(node.size=='m'){
          content=this.chartSelection(node)
          mediumNode=node
          rowMediums.push(content)
          if(rowMediums.length==2){
            content=<CRow key={node.id}>
                      {rowMediums.map(c => c)}
                    </CRow>
            
            rowMediums=[]
            grid.push(content)
          }
        
        }else{
          content=<CRow key={node.id}>
                      {this.chartSelection(node)}
                  </CRow>

          grid.push(content)
        }
        

      })
    if(rowMediums.length==1){
      content=<CRow key={mediumNode.id}>
                {rowMediums.pop()}
              </CRow>
      
      rowMediums=[]
      grid.push(content)
    }
    return grid
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
    let plotSize='6'
    if(node.size=='m')plotSize='6'
    else plotSize='12'

    return <chart.content plotSize={plotSize} nodeId={node.id}/> // Cambiar por props cuando se necesiten mas props
  }
  
  render(){
    return (
      <>
        {this.buildGrid().map(r => r)}      
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
