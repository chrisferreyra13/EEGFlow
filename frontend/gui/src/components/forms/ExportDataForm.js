import React, {Component} from 'react'
import { connect } from 'react-redux';
import Select from 'react-select'
import {
  CCol,
  CFormGroup,
  CLabel,
  CInput,
  CInputRadio,
  CInputCheckbox
} from '@coreui/react'
import { object } from 'prop-types';

class ExportDataForm extends Component{
  constructor(props){
    super(props)

    const nodeOptions=[]
    this.props.elements.forEach(element => {
      if(element.elementType!=undefined){
        if(element.type=='output'){
          nodeOptions.push({
            value:element.id,
            label:'Nodo '+element.id
          })
        }
      }
    });

    this.state={
      default:{
        nodeId:null,
        fileName:null
      },
      nodeOptions:nodeOptions,
      option:null
    }
    this.handleSelect=this.handleSelect.bind(this);
    this.handleChange=this.handleChange.bind(this);
    this.getValue=this.getValue.bind(this);
    this.getOption=this.getOption.bind(this);

  }

  handleChange(event,id) {
    this.props.onChange(id, event.target.value);
  }
  handleSelect(option){
    this.props.onChange('nodeId', option.value);
  }
  getOption(id){
    const value=this.getValue(id);
    if(value==null){
      return null
    }else{
      return {value:value,label:value}
    }
  }

  getValue(inputId){
    if(Object.keys(this.props.values).length === 0 && this.props.values.constructor === Object){
      return this.state.default[inputId] 
    }else{
      if(this.props.values[inputId]==undefined){
        return this.state.default[inputId]
      }else{
        return this.props.values[inputId]
      }
        
    }
  }

  render(){
        
    return (
      <div>
        <CFormGroup row>
            <CCol md="5">
                <CLabel htmlFor="ref_channel">Grafico:</CLabel>
            </CCol>
            <CCol md="7">
              <Select 
              options={this.state.nodeOptions}
              value={this.getOption('nodeId')} 
              onChange={(option) => this.handleSelect(option)}
              />
            </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="5">
              <CLabel htmlFor="fileName">Nombre del archivo:</CLabel>
          </CCol>
          <CCol md="7">
              <CInput id="fileName" placeholder={"ejemplo: patient_01"} value={this.getValue('fileName')} onChange={(event) => this.handleChange(event,'fileName')}/>
          </CCol>
        </CFormGroup>
      </div>
    )
  }

};
const mapStateToProps = (state) => {
	return{
	    elements:state.diagram.elements,
      channels:state.file.fileInfo.channels,
	};
}
  
const mapDispatchToProps = (dispatch) => {
	return {
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ExportDataForm)
