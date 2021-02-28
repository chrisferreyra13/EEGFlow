import React, { Component, lazy } from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CRow,
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
    const nodes=this.props.elements.map((elem) => elem.elementType!=undefined)
    this.state={
      nodeIds:nodes.map((node) => node.elementType.includes('plot')===true)
    }
  }

  componentDidMount(){ //Esto vamos a usar en vez del boton, por ahora mejor usar el boton
    if(this.props.timeSeries.length==0){
      this.props.fetchTimeSeries(this.props.fileId);
      this.props.enableChartTemporal()
      //console.log(this.props.temporalSignal)
    }
    
  }
  
  render(){
  return (
    <>
      {this.props.enableChartTemporal && this.props.timeSeries.length!=0 ?
        <CCol xs="12" md="6">
          <CRow>
            <ChartTemporal nodeId={'2'}/> 
          </CRow>
        </CCol>:
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