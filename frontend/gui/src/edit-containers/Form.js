import React, {lazy, Component} from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CRow,
  CForm,
} from '@coreui/react'


import CIcon from '@coreui/icons-react'

import {okForm, cancelForm, updateForm} from '../redux/actions/Form'
import { runSingleProcess, updateNodePropierties } from '../redux/actions/Diagram'


const EventsForm = lazy(()=>import('../components/forms/EventsForm.js'))
const FilterSelectorForm = lazy(()=>import('../components/forms/FilterSelectorForm.js'))

class Form extends Component{ //({formType, elements, nodeId, okForm, cancelForm, diagramView, updateForm, runSingleProcess, updateNodePropierties}) => {
  constructor(props){
    super(props)
    this.state={
      values:{}
    }

    this.onClickOkForm=this.onClickOkForm.bind(this);
    this.handleFieldChange=this.handleFieldChange.bind(this);
    this.handleMountForm=this.handleMountForm.bind(this);

  }
  
  handleFieldChange = (fieldId, value) => {
    this.setState({
      values:{
        ...this.state.values,
        [fieldId]: value
      }
    });
  };
  handleMountForm = () =>{

    const elem=this.props.elements.find(element => element.id==this.props.nodeId); // Devuelve el valor del primer elemento que cumple
    let params={};
    if(elem!=undefined){
      if(elem.params!=null) params=elem.params;
    }
    this.setState({ values: params});

  }
  

  onClickOkForm = (formData)  => {
    this.props.updateForm(formData)
    this.props.updateNodePropierties(this.props.nodeId,{'params':formData})
    const element=this.props.elements.find(element => element.formType==this.props.formType)
    if(this.props.diagramView==false){
      runSingleProcess({'elementType': element.elementType, 'params':formData})
    }
    this.props.okForm()
  }

  render(){
    let form=formSelection(this.props.formType);
    if (form===null) return null;
    return(
      <>
        <CCard className="card-form">
          <CForm id="form" onSubmit={(formData)=>this.onClickOkForm(this.state.values)} className="form-horizontal">
            <CCardHeader>
              {form.title}
            </CCardHeader>       
            <CCardBody>
              <form.content onChange={this.handleFieldChange} values={this.state.values} onMountForm={this.handleMountForm}/>
            </CCardBody>
            <CCardFooter>
              <CRow>
                <CCol xs="12" md="12">
                  <CButton type="submit" size="sm" color="primary"><CIcon name="cil-scrubber" /> Aplicar</CButton>
                  <CButton type="reset" size="sm" color="danger" onClick={() => this.props.cancelForm()}><CIcon name="cil-ban" /> Cancelar</CButton>
                </CCol>
              </CRow>
            </CCardFooter>
          </CForm>
        </CCard>
      </>
    )
  }

}

const mapStateToProps = (state) => {
  return{
    formType: state.form.formType,
    elements: state.diagram.elements,
    diagramView: state.editSession.diagramView,
    nodeId:state.form.nodeId
  };
}

const mapDispatchToProps = (dispatch) => {
  return{
    okForm: () => dispatch(okForm()),
    cancelForm: () => dispatch(cancelForm()),
    runSingleProcess: (params) => dispatch(runSingleProcess(params)),
    updateNodePropierties: (id,params) => dispatch(updateNodePropierties(id,params)),
    updateForm:(data) => dispatch(updateForm(data)),
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Form)

const formSelection = (formType) => {

  if(formType===null) return null;

  const forms = {
    ENABLE_EVENT_FORM: {title:'Editar Eventos',content:EventsForm},
    ENABLE_FILTER_SELECTOR_FORM: {title:'Seleccionar Frecuencias',content:FilterSelectorForm},
  };

  return forms[formType];

}