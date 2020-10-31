import React, {lazy, useState} from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import {okForm, cancelForm} from '../redux/actions/Form'

const ENABLE_EVENT_FORM = 'ENABLE_EVENT_FORM'

const EventForm = lazy(()=>import('../components/forms/EventForm.js'))
const PaginationEvent = lazy(()=> import('../components/paginations/PaginationEvent.js'))

const FormContainer = ({formType, okForm, cancelForm}) => {
  
  let form=formSelection(formType);
  if (form===null) return null;

  return(
    <>
      <CCard className="card-form">
        <CCardHeader>
          {form.title}
        </CCardHeader>
        <CCardBody>
          {form.content}
          {form.pagination}
        </CCardBody>
        <CCardFooter>
          <CRow>
            <CCol xs="12" md="6">
              <CButton type="reset" size="sm" color="danger" onClick={()=> cancelForm()}><CIcon name="cil-ban" /> Cancelar</CButton>
            </CCol>
            <CCol xs="12" md="6">
              <CButton type="submit" size="sm" color="info" onClick={()=> okForm()}> Ok</CButton>
            </CCol>
          </CRow>
        </CCardFooter>
      </CCard>
    </>
  )

}

const mapStateToProps = (state) => {
  return{
    formType: state.form.formType
  };
}

const mapDispatchToProps = (dispatch) => {
  return{
    okForm: () => dispatch(okForm()),
    cancelForm: () => dispatch(cancelForm()),
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(FormContainer)

const formSelection = (formType) => {

  switch(formType){
    case ENABLE_EVENT_FORM:
      return {
        title: 'Editar Eventos',
        content: <EventForm/>,
        pagination: <PaginationEvent/>
      }
    default:
      return null
  }
}