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

import MainChartExample from '../charts/MainChartExample.js'
import {Line} from 'react-chartjs-2'

const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'))
const WidgetsBrand = lazy(() => import('../widgets/WidgetsBrand.js'))

class EditPlot extends Component {
  constructor(props){
    super(props);
    this.state={
      temporalSignal:[],
      disablePlot:true //Enable
    }

    this.fetchTemporalSignal=this.fetchTemporalSignal.bind(this);
    this.chartData=this.chartData.bind(this);
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
        disablePlot: false
      })
    })
    
  }

  chartData() {
    return {
      labels: [],
      datasets: [
        {
          label: 'C4',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: this.state.temporalSignal['signal'],
        },
      ]
    }
  }

  render(){
  return (
    <>
      <CRow>
          <CCol sm="12" className="d-none d-md-block">
            {this.state.disablePlot ?
            <medium> No hay grafico </medium> : 
            <Line data={this.chartData}/>
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