import React, {Component} from 'react'
import { connect } from 'react-redux';
import Select from 'react-select'
import {
  CCol,
  CFormGroup,
  CLabel,
  CInput,
  CInputRadio,
  CCard,
  CCardBody,
} from '@coreui/react'
import { element, node } from 'prop-types';
import {
  epochsToOptions,
  optionsToEpochs
} from '../../tools/Utils';


class EpochsForm extends Component{
  constructor(props){
    super(props);

    const options = this.props.channels

    this.state={
      default:{
        channels:null,
        epochs:null,
        tmin:null,
        tmax:null,
        baseline:null,
        event_id:null,
      },
      options:options.map(ch => {
        return {value:ch,label:ch}
      }),


    }

    this.handleChange = this.handleChange.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.getValue=this.getValue.bind(this);
    this.handleSelect=this.handleSelect.bind(this);

  }

  handleSelect(option,id){
    this.props.onChange(id, option.value);
  }

  handleMultiSelect(options,id){
    this.props.onChange(id, options.map((option) => option.value));
  }

  handleChange(event,id) {
    if(event.target.value=="")
      this.props.onChange(id, null);
    else
    this.props.onChange(id, event.target.value);
  }

  componentDidMount(){
    this.props.onMountForm();
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
          <CCol md="12">
            <CLabel htmlFor="freq-inf">Canales</CLabel>
            <Select options={this.state.options} isMulti value={this.getValue("channels")==null ? null : this.getValue("channels").map(ch => {return {value:ch, label:ch}})} onChange={(options) => this.handleMultiSelect(options,'channels')}/>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="event_id">IDs de eventos:</CLabel>
              <CFormGroup row>
                <CCol md="12">
                    <CInput id="event_id" placeholder={"1,2,32"} value={this.getValue('event_id')} onChange={(event) => this.handleChange(event,'event_id')}/>
                </CCol>
              </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="timeWindow">Ventana de tiempo relativa al evento:</CLabel>
              <CFormGroup row>
                <CCol md="6">
                  <CInput 
                  id="tmin" 
                  placeholder={"tiempo mínimo (seg)"} 
                  type="number" step="0.01" max="0"
                  required
                  value={this.getValue('tmin')==null ? '': this.getValue('tmin')} 
                  onChange={(event) => this.handleChange(event,'tmin')}
                  />
                </CCol>
                <CCol md="6">
                  <CInput 
                  id="tmax" 
                  placeholder={"tiempo máximo (seg)"} 
                  type="number" min="0" step="0.01"
                  required
                  value={this.getValue('tmax')==null ? '': this.getValue('tmax')} 
                  onChange={(event) => this.handleChange(event,'tmax')}
                  />
                </CCol>
              </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="7">
              <CLabel htmlFor="baseline">Corrección de linea de base (valor medio):</CLabel>
          </CCol>
          <CCol md="5">
              <CInput id="baseline" placeholder={"ejemplos: 0,0.1 o ,"} value={this.getValue('baseline')} onChange={(event) => this.handleChange(event,'baseline')}/>
          </CCol>
        </CFormGroup>
        
      </div>
    )
  }

};
const mapStateToProps = (state) => {
	return{
	  elements:state.diagram.elements,
    channels:state.file.fileInfo.channels
	};
}
  
const mapDispatchToProps = (dispatch) => {
	return {}
};
export default connect(mapStateToProps, mapDispatchToProps)(EpochsForm)
