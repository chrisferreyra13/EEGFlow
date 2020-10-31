import React, { Component, lazy } from 'react'
import {connect} from 'react-redux'
import {
  CButton,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import {getTimeSeries} from '../../redux/actions/Signal'

const ChartTemporal = lazy(() => import('../charts/ChartTemporal.js'))
//const FormContainer = lazy(() => import('../../components/forms/FormContainer.js'))

class EditPlot extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount(){ //Esto vamos a usar en vez del boton, por ahora mejor usar el boton
    if(this.props.timeSeries){
      this.props.getTimeSeries(this.props.fileId);
      //console.log(this.props.temporalSignal)
    }
  }
  
  render(){
  return (
    <>
      <CCol xs="12" md="6">
        <CRow>
          <div>
            {/*<CCol sm="12" className="d-none d-md-block">*/}
              {this.props.enableChartTemporal ?
              <ChartTemporal  signals={this.props.timeSeries}/> :
              <h6> No hay grafico </h6>
              }
            {/*</CCol>*/}
          </div>
          <div>
            {/*<CCol sm="12" xl="40">*/}
              <CButton block color="info" onClick={() => this.props.getTimeSeries(this.props.fileId)}>Buscar señal</CButton>
            {/*</CCol>*/}
            </div>        
        </CRow>
      </CCol>
    </>
  )
  }
}

const mapStateToProps = (state) => {
  return{
    fileId: state.file.fileId,
    timeSeries: state.timeSeries.signal,
    enableChartTemporal: state.plots.chartTemporal,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    getTimeSeries: (fileId) => dispatch(getTimeSeries(fileId)),
  
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPlot)