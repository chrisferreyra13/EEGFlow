import React, {Component} from 'react'
import { connect } from 'react-redux';
import Select from 'react-select'
import {
  CCol,
  CFormGroup,
  CLabel,
  CInput,
  CInputRadio
} from '@coreui/react'


class ChartTemporalForm extends Component{
  constructor(props){
    super(props);

    const options = this.props.channels

    this.state={
      default:{
        channels:null,
        minTimeWindow:null,
        maxTimeWindow:null,
        size:'s'
      },
      options:options.map(ch => {
        return {value:ch,label:ch}
      })
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeInputRadio = this.handleChangeInputRadio.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.checkRadioButton=this.checkRadioButton.bind(this);
    this.getValue=this.getValue.bind(this);

  }
  checkRadioButton(inputId,radioButtonIds){
    radioButtonIds.forEach(id => {
      if(this.getValue(inputId)==id) // el id tiene que ser igual al valor del button
        document.getElementById(id).checked=true
      else
        document.getElementById(id).checked=false
    }) 
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
  handleChangeInputRadio(event,buttonValue,id) {
    this.props.onChange(id, buttonValue);
  }
  componentDidMount(){
    this.props.onMountForm();
    this.checkRadioButton('size',['m','l'])
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
            {/*<CInput id="channels" placeholder="Ch1,Ch2,Ch3" required value={value('channels')} onChange={(event) => this.handleChange(event,'channels')}/>*/}
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="timeWindow">Ventana de tiempo:</CLabel>
              <CFormGroup row>
                <CCol md="6">
                    <CInput id="minTimeWindow" placeholder={"tiempo mínimo (seg)"} type="number" min="0" step="0.01" value={this.getValue('minTimeWindow')} onChange={(event) => this.handleChange(event,'minTimeWindow')}/>
                </CCol>
                <CCol md="6">
                  <CInput id="maxTimeWindow" placeholder={"tiempo máximo (seg)"} type="number" min="0" step="0.01" value={this.getValue('maxTimeWindow')} onChange={(event) => this.handleChange(event,'maxTimeWindow')}/>
                </CCol>
              </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
            <CCol md="12">
                <CLabel htmlFor="size">Tamaño de gráfico</CLabel>
                <CCol md="12">
                  <CFormGroup row>
                      <CFormGroup variant="custom-radio" inline> {/* la prop 'name' tiene que ser la misma para todos para que esten en el mismo grupo*/}
                          <CInputRadio custom id="l" name="inline-radios" onChange={(event) => this.handleChangeInputRadio(event,'l','size')}/>
                          <CLabel variant="custom-checkbox" htmlFor="l">Grande</CLabel>
                      </CFormGroup>
                      <CFormGroup variant="custom-radio" inline>
                          <CInputRadio custom id="m" name="inline-radios" onChange={(event) => this.handleChangeInputRadio(event,'m','size')}/>
                          <CLabel variant="custom-checkbox" htmlFor="m">Chico</CLabel>
                      </CFormGroup>
                  </CFormGroup>
                </CCol>
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
export default connect(mapStateToProps, mapDispatchToProps)(ChartTemporalForm)
