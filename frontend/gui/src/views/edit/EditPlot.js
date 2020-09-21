import React, { Component, lazy } from 'react'
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

const ChartTemporal = lazy(() => import('../charts/ChartTemporal.js'))


class EditPlot extends Component {
  constructor(props){
    super(props);
    this.state={
      temporalSignal:[],
      EnablePlot:false 
    }

    this.fetchTemporalSignal=this.fetchTemporalSignal.bind(this);
  }

  fetchTemporalSignal(){
    var url = 'http://127.0.0.1:8000/data/eeg/temporal-signal/?' + new URLSearchParams({
      id: 'EMDxhaCPMCdioH3LBnuF6A',
    })
    
    var header= new Headers()
    var initFetch={
      method: 'GET',
      headers: header,
      mode: 'cors',
      cache: 'default'
    };

    fetch(url,initFetch).then(res =>{
        return res.json();
    }).then(temporalSignal =>{
      this.setState({
        temporalSignal: temporalSignal,
        EnablePlot: true
      })
    })
    
  }

  render(){
  return (
    <>
      <CRow>
          <CCol sm="12" className="d-none d-md-block">
            {this.state.EnablePlot ?
            <ChartTemporal  signals={this.state.temporalSignal}/> :
            <medium> No hay grafico </medium>
            }
          </CCol>
          <CCol sm="12" xl="6">
            <CButton block color="info" onClick={this.fetchTemporalSignal}>Buscar señal</CButton>
          </CCol>
      </CRow>
    </>
  )
              }
}

export default EditPlot