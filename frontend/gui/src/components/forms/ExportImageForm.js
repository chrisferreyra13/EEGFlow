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

class ExportImageForm extends Component{
  constructor(props){
    super(props);

    const channelsOptions = this.props.channels
    this.state={
      default:{
        ref_channel:null,
        anode:null,
        cathode:null,
        average:null,
        type:'monopolar', //monopolar, bipolar
      },
      channelsOptions:channelsOptions.map(ch => {
        return {value:ch,label:ch}
      }),
      enableChannels:true,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.handleSelect=this.handleSelect.bind(this);
    this.getValue=this.getValue.bind(this);
    this.checkButtonsById=this.checkButtons.bind(this);
    this.checkButtonsByBool=this.checkButtonsByBool.bind(this);
    this.handleCheckbox=this.handleCheckbox.bind(this);
    this.handleChangeInputRadio = this.handleChangeInputRadio.bind(this);
    this.getOption=this.getOption.bind(this);

  }

  getOption(id){
    const value=this.getValue(id);
    if(value==null){
      return null
    }else{
      return {value:value,label:value}
    }
  }

  handleCheckbox(e,checkboxId){
    const checked = e.target.checked;
    
    if (checkboxId=='average'){ // for generic use, convert this 'if' in switch case
      this.setState({
        enableChannels:!checked //the use don't need to select epoch for average option
       })
    }
    this.props.onChange(checkboxId, checked==true ? 'true' : 'false');
  }

  checkButtons(inputId,buttonsIds){
    buttonsIds.forEach(id => {
      if(this.getValue(inputId)==id) // el id tiene que ser igual al valor del button
        document.getElementById(id).checked=true
      else
        document.getElementById(id).checked=false
    }) 
  }
  checkButtonsByBool(inputIds){
    inputIds.forEach(id =>{
      if(document.getElementById(id)!=null){
        if(this.getValue(id)=='true') // el id tiene que ser igual al valor del button
          document.getElementById(id).checked=true
        else
          document.getElementById(id).checked=false
      }
    })
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
  handleChangeInputRadio(event,buttonValue,id) {
    this.props.onChange(id, buttonValue);
  }

  componentDidMount(){
    this.props.onMountForm();
    this.checkButtons('type',['monopolar','bipolar'])
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
            <CCol md="2">
                <CLabel md="6" htmlFor="type">Tipo:</CLabel> 
            </CCol>
            <CCol md="10">
                <CFormGroup variant="custom-radio" inline> {/* la prop 'name' tiene que ser la misma para todos para que esten en el mismo grupo*/}
                    <CInputRadio custom id="monopolar" name="reference-type" value="monopolar" onChange={(event) => this.handleChangeInputRadio(event,'monopolar','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="monopolar">Monopolar</CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" inline>
                    <CInputRadio custom id="bipolar" name="reference-type" value="bipolar" onChange={(event) => this.handleChangeInputRadio(event,'bipolar','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="bipolar">Bipolar</CLabel>
                </CFormGroup>
            </CCol>
        </CFormGroup>
        {
          this.getValue('type')=='monopolar' ?
          <div>
            <CFormGroup row>
                <CCol md="5">
                    <CLabel htmlFor="ref_channel">Canal:</CLabel>
                </CCol>
                <CCol md="7">
                  <Select 
                  options={this.state.enableChannels ? this.state.channelsOptions : null}
                  value={this.getOption('ref_channel')} 
                  onChange={(option) => this.handleSelect(option,'ref_channel')}
                  />
                </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol md="6">
                <CFormGroup variant="custom-checkbox" inline>
                  <CInputCheckbox 
                  custom id="average" 
                  name="inline-checkbox1" 
                  value={"true"}
                  onClick={(e) => this.handleCheckbox(e,'average')}
                  />
                  <CLabel variant="custom-checkbox" htmlFor="average">Promediar</CLabel>
                </CFormGroup>
              </CCol>
            </CFormGroup>
          </div>:
          <div>
            <CFormGroup row>
              <CCol md="5">
                  <CLabel htmlFor="mode">Anodo:</CLabel>
              </CCol>
              <CCol md="7">
                  <Select 
                  options={this.state.channelsOptions}
                  value={this.getOption('anode')} 
                  onChange={(option) => this.handleSelect(option,'anode')}
                  />
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol md="5">
                  <CLabel htmlFor="mode">Catodo:</CLabel>
              </CCol>
              <CCol md="7">
                  <Select 
                  options={this.state.channelsOptions}
                  value={this.getOption('cathode')} 
                  onChange={(option) => this.handleSelect(option,'cathode')}
                  />
              </CCol>
            </CFormGroup>
          </div>
        }
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
export default connect(mapStateToProps, mapDispatchToProps)(ExportImageForm)
