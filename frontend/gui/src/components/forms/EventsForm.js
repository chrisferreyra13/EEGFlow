import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CForm,
  CFormGroup,
  CInput,
  CLabel,
  CButton,
  CPagination,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { fetchEvents } from '../../redux/actions/Events';

class EventsForm extends Component{
  constructor(props){
    super(props);

    if(this.props.eventLatency){
      this.props.fetchEvents();
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
        {this.props.isFetching ? 
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
                <CCol md="9">
                  <CLabel>Cantidad de eventos: {this.props.eventLatency.length}</CLabel>
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="6">
                  <CLabel htmlFor="text-input">Tipo</CLabel>
                </CCol>
                <CCol xs="12" md="6">
                  <CInput id="text-input" name="text-input" placeholder={this.props.eventType[this.state.currentPage-1]} />
                  {/*<CFormText>This is a help text</CFormText>*/}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="6">
                  <CLabel>Latencia (seg)</CLabel>
                </CCol>
                <CCol xs="12" md="6">
                  <p className="form-control-static">{this.props.eventLatency[this.state.currentPage-1]}</p>
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
              pages={this.props.eventLatency.length}
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
    eventType: state.events.eventType,
    eventLatency: state.events.eventLatency,
    isFetching: state.events.isFetching
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    fetchEvents: () => dispatch(fetchEvents()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsForm)