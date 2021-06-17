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
        channels:"",
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

  }

  handleMultiSelect(options,id){
    this.props.onChange(id, options.map((option) => option.value));
  }

  handleChange(event,id) {
    this.props.onChange(id, event.target.value);
  }
  handleChangeInputRadio(event,buttonValue,id) {
    this.props.onChange(id, buttonValue);
  }
  componentDidMount(){
    this.props.onMountForm();
  }

  render(){
    const value = (inputId) => {
      if(Object.keys(this.props.values).length === 0 && this.props.values.constructor === Object)
      {
        return this.state.default[inputId] 
      }else{
        if(this.props.values[inputId]==undefined){
          return this.state.default[inputId]
        }else{
          return this.props.values[inputId]
        }
        
      }
  
    }
    return (
      <div> 
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="freq-inf">Canales</CLabel>
            <Select options={this.state.options} isMulti onChange={(options) => this.handleMultiSelect(options,'channels')}/>
            {/*<CInput id="channels" placeholder="Ch1,Ch2,Ch3" required value={value('channels')} onChange={(event) => this.handleChange(event,'channels')}/>*/}
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="timeWindow">Ventana de tiempo:</CLabel>
              <CFormGroup row>
                <CCol md="6">
                    <CInput id="minTimeWindow" placeholder={"tiempo mínimo (seg)"} type="number" min="0" step="0.5" required value={value('minTimeWindow')} onChange={(event) => this.handleChange(event,'minTimeWindow')}/>
                </CCol>
                <CCol md="6">
                  <CInput id="maxTimeWindow" placeholder={"tiempo máximo (seg)"} type="number" min="0" step="0.5" required value={value('maxTimeWindow')} onChange={(event) => this.handleChange(event,'maxXWindmaxTimeWindowow')}/>
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
                            <CInputRadio custom id="inline-radio1" name="inline-radios" onChange={(event) => this.handleChangeInputRadio(event,'l','size')}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio1">Grande</CLabel>
                        </CFormGroup>
                        <CFormGroup variant="custom-radio" inline>
                            <CInputRadio custom id="inline-radio2" name="inline-radios" onChange={(event) => this.handleChangeInputRadio(event,'m','size')}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio2">Mediano</CLabel>
                        </CFormGroup>
                        <CFormGroup variant="custom-radio" inline>
                            <CInputRadio custom id="inline-radio3" name="inline-radios" onChange={(event) => this.handleChangeInputRadio(event,'s','size')}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio3">Pequeño</CLabel>
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
