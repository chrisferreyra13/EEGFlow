import React, { Component, lazy } from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CRow,
  CCard,
  CCardBody,
  CCardGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {fetchTimeSeries} from '../../redux/actions/Signal'
import { diagramView } from '../../redux/actions/EditSession'
import { enableChartTemporal } from '../../redux/actions/SideBar'

const ChartTemporal = lazy(() => import('../../components/charts/ChartTemporal.js'))
//const FormContainer = lazy(() => import('../../components/forms/FormContainer.js'))

class EditPlot extends Component {
  constructor(props){
    super(props);
    this.props.diagramView(false);
    const nodePlots=this.props.elements.map((elem) => {
      if(filterId(elem)==true){
        return {
          plotType:elem.elementType,
          id:elem.id,
          isUse:false
        }
      }else return null
    })
    this.state={
      nodePlots:nodePlots.filter((nodePlot) => nodePlot!=null)
    }

    //this.idSelection=this.idSelection.bind(this);
    this.chartSelection=this.chartSelection.bind(this);
  }

  componentDidMount(){ //Esto vamos a usar en vez del boton, por ahora mejor usar el boton
    if(this.props.timeSeries.length==0){
      this.props.fetchTimeSeries(this.props.fileId);
      this.props.enableChartTemporal()
    }
    
  }
  /*idSelection(plotType){
    const nodePlot=this.state.nodePlots.filter((nodePlot) => {
      return (nodePlot.plotType==plotType && !nodePlot.isUse)
    })
    return nodePlot[0].id
  }*/
  chartSelection(node){
    const charts = {
      PLOT_TIME_SERIES: {content:ChartTemporal},
      //Aca van los otros tipos de charts
    };
    if(charts[node.plotType]==undefined){
      return null
    }
    const chart=charts[node.plotType]
    return <chart.content nodeId={node.id}/> // Cambiar por props cuando se necesiten mas props
  }
  
  render(){
  return (
    <>
      {this.props.enableChartTemporal && this.props.timeSeries.length!=0 ?
        <div>
          {this.state.nodePlots.map((node) =>
            <div key={node.id}>
              {this.chartSelection(node)}
            </div>   
          )}
        </div>:
        <div style={{alignItems:'center', textAlign:'center', margin:'auto'}}>
          <h4>Cargando...</h4>
          <CIcon size= "xl" name="cil-cloud-download" />
        </div>
      }
    </>
  )
  }
}

const mapStateToProps = (state) => {
  return{
    fileId: state.file.fileId,
    timeSeries: state.timeSeries.signal,
    enableChartTemporal: state.plots.chartTemporal,
    elements: state.diagram.elements
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    enableChartTemporal: () => dispatch(enableChartTemporal()),
    fetchTimeSeries: (fileId) => dispatch(fetchTimeSeries(fileId)),
    diagramView: (activate) => dispatch(diagramView(activate)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPlot)

const filterId = (elem) => {
  return elem.elementType!=undefined && elem.elementType.includes('PLOT')===true;
}
