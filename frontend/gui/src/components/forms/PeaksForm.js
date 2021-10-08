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

class PeaksForm extends Component{
  constructor(props){
    super(props);

    const channelsOptions = this.props.channels
    this.state={
      default:{
        channels:null,
        thresh:null
      },
      channelsOptions:channelsOptions.map(ch => {
        return {value:ch,label:ch}
      }),
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.handleSelect=this.handleSelect.bind(this);
    this.getValue=this.getValue.bind(this);

  }

  handleMultiSelect(options,id){
    this.props.onChange(id, options.map((option) => option.value));
  }
  handleSelect(option,id){
    this.props.onChange(id, option.value);
  }

  handleChange(event,id) {
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
            <CLabel htmlFor="channels">Canales</CLabel>
            <Select options={this.state.channelsOptions} isMulti value={this.getValue("channels")==null ? null : this.getValue("channels").map(ch => {return {value:ch, label:ch}})} onChange={(options) => this.handleMultiSelect(options,'channels')}/>
            {/*<CInput id="channels" placeholder="Ch1,Ch2,Ch3" required value={value('channels')} onChange={(event) => this.handleChange(event,'channels')}/>*/}
          </CCol>
        </CFormGroup>
        <CFormGroup row>
            <CCol md="3">
                <CLabel htmlFor="thresh">Umbral (mV)</CLabel>
            </CCol>
            <CCol md="9">
                <CInput id="thresh" placeholder={"default: (max - min) / 4"} type="number" min="0" step="0.01" value={this.getValue('thresh')} onChange={(event) => this.handleChange(event,'thresh')}/>
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
	return {}
};
export default connect(mapStateToProps, mapDispatchToProps)(PeaksForm)
