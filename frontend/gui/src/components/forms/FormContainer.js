import React, {lazy} from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import {okForm, cancelForm} from '../../redux/actions/Form'

const ENABLE_EVENT_FORM = 'ENABLE_EVENT_FORM'

const EventForm = lazy(()=>import('./EventForm.js'))

const FormContainer = ({formType, okForm, cancelForm}) =>{
  let title;
  let content;
  switch(formType){
    case ENABLE_EVENT_FORM:
      title='Editar Eventos'
      content=<EventForm/>
      break;
    default:
      return null
  }

  return(
    <CCol xs="12" md="6">
      <CCard>
        <CCardHeader>
          {title}
        </CCardHeader>
        <CCardBody>
          {content}
        </CCardBody>
        <CCardFooter>
          <CButton type="submit" size="sm" color="info" onClick={()=>okForm()}> Ok</CButton>
          <CButton type="reset" size="sm" color="danger" onClick={()=>cancelForm()}><CIcon name="cil-ban" /> Cancel</CButton>
        </CCardFooter>
      </CCard>
    </CCol>
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