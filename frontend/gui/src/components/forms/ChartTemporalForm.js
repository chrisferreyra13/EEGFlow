import React, {Component} from 'react'

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
    this.state={
      default:{
        channels:"",
        minTimeWindow:0,
        maxTimeWindow:0,
        largeSize:'on', //Esto habria que usarlo pero no me funciono con la prop 'checked'
        mediumSize:'off',
        smallSize:'off'
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
          <CCol md="6">
            <CLabel htmlFor="freq-inf">Canales</CLabel>
            <CInput id="channels" placeholder="Ch1,Ch2,Ch3" required value={value('channels')} onChange={(event,id) => this.handleChange(event,'channels')}/>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="timeWindow">Ventana de tiempo:</CLabel>
              <CFormGroup row>
                <CCol md="6">
                    <CLabel htmlFor="minTimeWindow">Tiempo mínimo (seg)</CLabel>
                </CCol>
                <CCol md="6">
                    <CInput id="minTimeWindow" type="number" min="0" step="0.5" required value={value('minTimeWindow')} onChange={(event,id) => this.handleChange(event,'minTimeWindow')}/>
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="6">
                  <CLabel htmlFor="maxTimeWindow">Tiempo máximo (seg)</CLabel>
                </CCol>
                <CCol md="6">
                  <CInput id="maxTimeWindow" type="number" min="0" step="0.5" required value={value('maxTimeWindow')} onChange={(event,id) => this.handleChange(event,'maxTimeWindow')}/>
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
                            <CInputRadio custom id="inline-radio1" name="inline-radios" onChange={(event,id) => this.handleChange(event,'largeSize')}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio1">Grande</CLabel>
                        </CFormGroup>
                        <CFormGroup variant="custom-radio" inline>
                            <CInputRadio custom id="inline-radio2" name="inline-radios" onChange={(event,id) => this.handleChange(event,'mediumSize')}/>
                            <CLabel variant="custom-checkbox" htmlFor="inline-radio2">Mediano</CLabel>
                        </CFormGroup>
                        <CFormGroup variant="custom-radio" inline>
                            <CInputRadio custom id="inline-radio3" name="inline-radios" onChange={(event,id) => this.handleChange(event,'smallSize')}/>
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

export default ChartTemporalForm