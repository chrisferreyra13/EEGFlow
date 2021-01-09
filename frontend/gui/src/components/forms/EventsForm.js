import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CForm,
  CFormGroup,
  CLabel,
  CButton,
  CPagination,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { fetchEvents } from '../../redux/actions/Events';
import {SamplesToTimes} from '../../tools/Signal';

class EventsForm extends Component{
  constructor(props){
    super(props);

    if(this.props.eventSamples===null){ // TODO: De esta forma no se busca si hay un cambio en el back
      this.props.fetchEvents(this.props.fileId);
    }
    
    this.state={
      currentPage: 1, 
    }
    this.setCurrentPage=this.setCurrentPage.bind(this)
    
  }

  setCurrentPage(page){
    this.setState({
      currentPage: page
    })
  }

  render(){
    return (
      <div>
        {(this.props.isFetching && this.props.samplingFreq) ? 
          <div>
            <CRow>
                <CCol xs="12" md="12">
                  <h4>Cargando...</h4>
                </CCol>
              </CRow>
              <CRow>
                <CCol xs="12" md="12">
                  <CIcon size= "xl" name="cil-cloud-download" />
                </CCol>
              </CRow>
          </div> :
          <div>
            <CForm action="" method="post" encType="multipart/form-data" className="form-horizontal">
              <CFormGroup row>
                <CCol xs="12" md="12">
                  <CLabel>Cantidad de eventos: {this.props.eventSamples.length}</CLabel>
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol xs="8" md="6">
                  <CLabel>Tipo:</CLabel>
                </CCol>
                <CCol xs="4" md="6">
                  <p className="form-control-static">{this.props.eventId[this.state.currentPage-1]}</p>
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol xs="10" md="8">
                  <CLabel>Latencia (seg):</CLabel>
                </CCol>
                <CCol xs="2" md="4">
                  <p className="form-control-static">{SamplesToTimes(this.props.eventSamples[this.state.currentPage-1],this.props.samplingFreq,3)}</p>
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol xs="12" md="6">
                  <CButton type="reset" size="sm" color="danger">Eliminar</CButton>
                </CCol>
                <CCol xs="12" md="6">
                  <CButton type="submit" size="sm" color="primary">Agregar</CButton>
                </CCol>
              </CFormGroup>
            </CForm>
            <h6 align="center">Numero de Evento</h6>
            <CPagination
              align="center"
              activePage={this.state.currentPage}
              pages={this.props.eventSamples.length}
              onActivePageChange={this.setCurrentPage}
              size='sm'
              dots={false}
            />
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return{
    fileId: state.file.fileId,
    samplingFreq: state.timeSeries.samplingFreq,
    eventId: state.events.eventId,
    eventSamples: state.events.eventSamples,
    isFetching: state.events.isFetching
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    fetchEvents: (fileId) => dispatch(fetchEvents(fileId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsForm)