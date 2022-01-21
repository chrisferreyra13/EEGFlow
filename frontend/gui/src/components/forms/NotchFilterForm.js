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

class NotchFilterForm extends Component{
  constructor(props){
    super(props);

    //const node=this.props.elements.find(n => n.id==this.props.nodeId)
    const channelsOptions = this.props.channels
    const windowOptions=[ //agregar si es necesario
        {value:'blackman',label:'blackman'},
        {value:'hamming',label:'hamming'},
        {value:'hann',label:'hann'},
    ]
    const phaseOptions=[ //agregar si es necesario
        {value:'zero',label:'Cero'},
        {value:'zero-double',label:'Cero doble'},
        {value:'minimum',label:'Minimo'},
    ]
    const firDesignOptions=[ //agregar si es necesario
        {value:'firwin',label:'Firwin'},
        {value:'firwin2',label:'Firwin2'},
    ]

    this.state={
      default:{
        channels:null,
        type:'fir',
        notch_freqs:null,
        notch_widths:null,
        trans_bandwidth:null,
        mt_bandwidth:null,
        p_value:null
      },
      channelsOptions:channelsOptions.map(ch => {
        return {value:ch,label:ch}
      }),
      windowOptions:windowOptions,
      phaseOptions:phaseOptions,
      firDesignOptions:firDesignOptions,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeInputRadio = this.handleChangeInputRadio.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.handleSelect=this.handleSelect.bind(this);
    this.checkRadioButton=this.checkRadioButton.bind(this);
    this.getValue=this.getValue.bind(this);

  }
  checkRadioButton(inputId,radioButtonIds){
    radioButtonIds.forEach(id => {
      if(document.getElementById(id)!=null){
        if(this.getValue(inputId)==id) // el id tiene que ser igual al valor del button
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
    this.checkRadioButton('type',['fir','iir'])//,'spectrum_fit'])
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
            <Select options={this.state.channelsOptions} isMulti value={this.getValue("channels")==null ? null : this.getValue("channels").map(ch => {return {value:ch, label:ch}})} onChange={(options) => this.handleMultiSelect(options,'channels')}/>
            {/*<CInput id="channels" placeholder="Ch1,Ch2,Ch3" required value={value('channels')} onChange={(event) => this.handleChange(event,'channels')}/>*/}
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="notch_freqs">Frecuencias de interes:</CLabel>
              <CFormGroup row>
                <CCol md="12">
                    <CInput id="notch_freqs" placeholder={"50,63.5"} required value={this.getValue('notch_freqs')} onChange={(event) => this.handleChange(event,'notch_freqs')}/>
                </CCol>
              </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="notch_widths">Ancho de cada banda de parada (Hz):</CLabel>
              <CFormGroup row>
                <CCol md="12">
                    <CInput id="notch_widths" placeholder={"default: 'freqs/200'"} type="number" min="0" step="0.01" value={this.getValue('notch_widths')} onChange={(event) => this.handleChange(event,'notch_widths')}/>
                </CCol>
              </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
            <CCol md="2">
                <CLabel md="6" htmlFor="type">Tipo de filtro:</CLabel>
            </CCol>
            <CCol md="10">
                <CFormGroup variant="custom-radio" inline> {/* la prop 'name' tiene que ser la misma para todos para que esten en el mismo grupo*/}
                    <CInputRadio custom id="fir" name="filter-method" value="fir" onChange={(event) => this.handleChangeInputRadio(event,'fir','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="fir">FIR</CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" inline>
                    <CInputRadio custom id="iir" name="filter-method" value="iir" onChange={(event) => this.handleChangeInputRadio(event,'iir','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="iir">IIR</CLabel>
                </CFormGroup>
                {/*
                <CFormGroup variant="custom-radio" inline>
                    <CInputRadio custom id="spectrum_fit" name="filter-method" value="spectrum_fit" onChange={(event) => this.handleChangeInputRadio(event,'spectrum_fit','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="spectrum_fit">Ajuste del espectro</CLabel>
                </CFormGroup>
                */}
            </CCol>
        </CFormGroup>
          {
            /*this.getValue('type')=='spectrum_fit' ?
            <div>
              <CFormGroup row>
                  <CCol md="7">
                      <CLabel htmlFor="mt_bandwidth">Ancho de banda multitaper (Hz):</CLabel>
                  </CCol>
                  <CCol md="4">
                      <CInput id="mt_bandwidth" placeholder={"default: 'auto"} type="number" min="0" step="0.01" value={this.getValue('mt_bandwidth')} onChange={(event) => this.handleChange(event,'mt_bandwidth')}/>
                  </CCol>
              </CFormGroup>
              <CFormGroup row>
                  <CCol md="7">
                      <CLabel htmlFor="p_value">Valor de P:</CLabel>
                  </CCol>
                  <CCol md="4">
                      <CInput id="p_value" placeholder={"default: 'auto'"} type="number" min="0" step="0.01" value={this.getValue('p_value')} onChange={(event) => this.handleChange(event,'p_value')}/>
                  </CCol>
              </CFormGroup>
            </div>:*/
            this.getValue('type')=='fir' ?
            <div>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="trans_bandwidth">Ancho de banda de transición (Hz):</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="trans_bandwidth" placeholder={"Ninguno"} type="number" min="0" step="0.01" required value={this.getValue('trans_bandwidth')} onChange={(event) => this.handleChange(event,'trans_bandwidth')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="window">Ventana de FIR:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <Select options={this.state.windowOptions} onChange={(options) => this.handleSelect(options,'fir_window')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="fir_design">Diseño del FIR:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <Select options={this.state.firDesignOptions} onChange={(options) => this.handleSelect(options,'fir_design')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="phase">Fase:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <Select options={this.state.phaseOptions} onChange={(options) => this.handleSelect(options,'phase')}/>
                    </CCol>
                </CFormGroup>
            </div>:
            ///////////////////////
            <div>
                <CFormGroup row>
                    <CCol md="12">
                        <CLabel htmlFor="iir_params">Butterworth de 4 orden</CLabel>
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
export default connect(mapStateToProps, mapDispatchToProps)(NotchFilterForm)
