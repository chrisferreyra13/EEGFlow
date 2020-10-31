import React from 'react'
import {
  CCol,
  CForm,
  CFormGroup,
  CInput,
  CLabel,
  CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'


const EventForm = ({okForm}) =>{

    let enableContent= true

    return (
      <div>
      {enableContent ?
        <CForm action="" method="post" encType="multipart/form-data" className="form-horizontal">
          <CFormGroup row>
            <CCol md="9">
              <CLabel>Cantidad de eventos: 87</CLabel>
            </CCol>
          </CFormGroup>
          <CFormGroup row>
            <CCol md="6">
              <CLabel htmlFor="text-input">Tipo</CLabel>
            </CCol>
            <CCol xs="12" md="6">
              <CInput id="text-input" name="text-input" placeholder="rt" />
              {/*<CFormText>This is a help text</CFormText>*/}
            </CCol>
          </CFormGroup>
          <CFormGroup row>
            <CCol md="6">
              <CLabel>Latencia (seg)</CLabel>
            </CCol>
            <CCol xs="12" md="6">
              <p className="form-control-static">1.0007</p>
            </CCol>
          </CFormGroup>
          <CFormGroup row>
            <CCol xs="12" md="6">
              <CButton type="reset" size="sm" color="danger">Eliminar</CButton>
            </CCol>
            <CCol xs="12" md="6">
              <CButton type="submit" size="sm" color="info">Agregar</CButton>
            </CCol>
          </CFormGroup>
        </CForm> :
      <CIcon name="cil-loop-circular"/>
      }
      </div>
    )
}


export default EventForm