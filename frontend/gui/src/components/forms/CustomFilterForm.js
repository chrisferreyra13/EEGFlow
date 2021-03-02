import React, {Component} from 'react'
import {connect} from 'react-redux'
import {
  CCol,
  CFormGroup,
  CLabel,
  CInput,
} from '@coreui/react'


class CustomFilterForm extends Component{
  constructor(props){
    super(props);
    this.state={
      default:{
        infCutoffFreq:0,
        supCutoffFreq:0
      }
    }

    this.handleChange = this.handleChange.bind(this);

  }

  handleChange(event,id) {
    this.props.onChange(id, event.target.value);
  }
  componentDidMount(){
    this.props.onMountForm();
  }

  render(){
    const value = (inputId) => {
      if(Object.keys(this.props.values).length === 0 && this.props.values.constructor === Object)
      {
        //return this.state.default[inputId]
        return ''; 
      }else{
        if(this.props.values[inputId]==undefined){
          //return this.state.default[inputId]
          return '';
        }else{
          return this.props.values[inputId]
        }
        
      }
  
    }
    return (
      <div> 
        <CFormGroup row>
          <CCol xs="12" md="7">
            <CLabel htmlFor="freq-inf">F. corte inferior</CLabel>
          </CCol>
          <CCol xs="12" md="5"> 
            <CInput id="infCutoffFreq" type="number" min="0" max="99.5" step="0.1" required value={value('infCutoffFreq')} onChange={(event,id) => this.handleChange(event,'infCutoffFreq')}/>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol xs="12" md="7">
            <CLabel htmlFor="freq-inf">F. corte superior</CLabel>
          </CCol>
          <CCol xs="12" md="5"> 
            <CInput id="supCutoffFreq" type="number" min="0" max="100" step="0.1" required value={value('supCutoffFreq')} onChange={(event,id) => this.handleChange(event,'supCutoffFreq')}/>
          </CCol>
        </CFormGroup>
    </div>
    )
  }

};

export default CustomFilterForm