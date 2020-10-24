import React from 'react'
import {
  CCol,
  CForm,
  CFormGroup,
  CInput,
  CLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const EventForm = ({okForm}) =>{

    return (
      <CForm action="" method="post" encType="multipart/form-data" className="form-horizontal">
        <CFormGroup row>
          <CCol md="3">
            <CLabel htmlFor="text-input">Tipo</CLabel>
          </CCol>
          <CCol xs="12" md="9">
            <CInput id="text-input" name="text-input" placeholder="rt" />
            {/*<CFormText>This is a help text</CFormText>*/}
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="3">
            <CLabel>Latencia (seg)</CLabel>
          </CCol>
          <CCol xs="12" md="9">
            <p className="form-control-static">1.0007</p>
          </CCol>
        </CFormGroup>
      </CForm>
    )
}


export default EventForm