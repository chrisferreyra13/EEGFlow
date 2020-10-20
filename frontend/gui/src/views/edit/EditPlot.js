import React, { Component, lazy } from 'react'
import {connect} from 'react-redux'
import {
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CCallout
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import {getTemporalSignal} from '../../redux/actions/index'

const ChartTemporal = lazy(() => import('../charts/ChartTemporal.js'))

const idPrueba='EMDxhaCPMCdioH3LBnuF6A'

class EditPlot extends Component {
  constructor(props){
    super(props);
  }

  render(){
  return (
    <>
      <CRow>
        <div>
          <CCol sm="12" className="d-none d-md-block">
            {this.props.enableChartTemporal ?
            <ChartTemporal  signals={this.props.temporalSignal}/> :
            <h6> No hay grafico </h6>
            }
          </CCol>
        </div>
        <div>
          <CCol sm="12" xl="40">
            <CButton block color="info" onClick={() => this.props.getTemporalSignal(idPrueba)}>Buscar señal</CButton>
          </CCol>
          </div>        
      </CRow>


    </>
  )
  }
}

const mapStateToProps = (state) => {
  return{
    temporalSignal: state.temporalSignal.temporalSignal,
    enableChartTemporal: state.plots.chartTemporal,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    getTemporalSignal: (id) => dispatch(getTemporalSignal(id)),
  
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPlot)