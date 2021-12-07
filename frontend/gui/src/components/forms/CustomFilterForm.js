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

class CustomFilterForm extends Component{
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
        l_freq:null,
        h_freq:null
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
      if(this.getValue(inputId)==id) // el id tiene que ser igual al valor del button
        document.getElementById(id).checked=true
      else
        document.getElementById(id).checked=false
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
    this.checkRadioButton('type',['fir','iir'])
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
            <CLabel htmlFor="frequencyWindow">Ancho de banda:</CLabel>
              <CFormGroup row>
                <CCol md="6">
                    <CInput id="minFreqWindow" placeholder={"f. corte inf. (Hz)"} type="number" min="0" step="0.01" value={this.getValue('l_freq')} onChange={(event) => this.handleChange(event,'l_freq')}/>
                </CCol>
                <CCol md="6">
                  <CInput id="maxFreqWindow" placeholder={"f. corte sup (Hz)"} type="number" min="0" step="0.01" value={this.getValue('h_freq')} onChange={(event) => this.handleChange(event,'h_freq')}/>
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
            </CCol>
        </CFormGroup>
          {
            this.getValue('type')=='fir' ?
            <div>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="l_trans_bandwidth">Ancho de banda de transición inf. (Hz):</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="l_trans_bandwidth" placeholder={"default: 'auto'"} type="number" min="0" step="0.01" value={this.getValue('l_trans_bandwidth')} onChange={(event) => this.handleChange(event,'l_trans_bandwidth')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="h_trans_bandwidth">Ancho de banda de transición sup. (Hz):</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="h_trans_bandwidth" placeholder={"default: 'auto'"} type="number" min="0" step="0.01" value={this.getValue('h_trans_bandwidth')} onChange={(event) => this.handleChange(event,'h_trans_bandwidth')}/>
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
                        <CLabel htmlFor="normalization">Fase:</CLabel>
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
export default connect(mapStateToProps, mapDispatchToProps)(CustomFilterForm)
