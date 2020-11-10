import React, {useState} from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CForm,
  CFormGroup,
  CInput,
  CLabel,
  CButton,
  CPagination
} from '@coreui/react'


const EventForm = ({eventType,eventLatency}) =>{
  const [currentPage, setCurrentPage] = useState(Math.round(eventLatency.length/2))
    return (
      <div>
        <CForm action="" method="post" encType="multipart/form-data" className="form-horizontal">
          <CFormGroup row>
            <CCol md="9">
              <CLabel>Cantidad de eventos: {eventLatency.length}</CLabel>
            </CCol>
          </CFormGroup>
          <CFormGroup row>
            <CCol md="6">
              <CLabel htmlFor="text-input">Tipo</CLabel>
            </CCol>
            <CCol xs="12" md="6">
              <CInput id="text-input" name="text-input" placeholder={eventType[currentPage-1]} />
              {/*<CFormText>This is a help text</CFormText>*/}
            </CCol>
          </CFormGroup>
          <CFormGroup row>
            <CCol md="6">
              <CLabel>Latencia (seg)</CLabel>
            </CCol>
            <CCol xs="12" md="6">
              <p className="form-control-static">{eventLatency[currentPage-1]}</p>
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
          activePage={currentPage}
          pages={eventLatency.length}
          onActivePageChange={setCurrentPage}
          size='sm'
          dots={false}
        />
      </div>
    )
}

const mapStateToProps = (state) => {
  return{
    eventType: state.events.eventType,
    eventLatency: state.events.eventLatency
  };
}

export default connect(mapStateToProps)(EventForm)