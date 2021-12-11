import React, {Component} from 'react'
import { connect } from 'react-redux';
import Select from 'react-select'
import {
  CCol,
  CFormGroup,
  CLabel,
  CInput,
  CInputRadio,
  CInputCheckbox,
  CCard,
  CCardBody,
} from '@coreui/react'
import {
  epochsToOptions,
  optionsToEpochs
} from '../../tools/Utils';

class ChartPSDForm extends Component{
  constructor(props){
    super(props);

    const channelsOptions = this.props.channels
    const windowOptions=[ //agregar si es necesario
        {value:'boxcar',label:'boxcar'},
        {value:'triang',label:'triang'},
        {value:'blackman',label:'blackman'},
        {value:'hamming',label:'hamming'},
        {value:'hann',label:'hann'},
        {value:'bartlett',label:'bartlett'},
    ]
    const averageOptions=[ //agregar si es necesario
        {value:'none',label:'Ninguno'},
        {value:'mean',label:'Media'},
        {value:'median',label:'Mediana'},
    ]
    const normalizationOptions=[ //agregar si es necesario
      {value:'length',label:'Largo'},
      {value:'full',label:'Completa'},
    ]

    let nodePlot= null;//this.props.elements.find((elem) => elem.id==this.props.nodeId)
    let epochsExists=false
    this.props.elements.forEach(elem => {
      if(elem.id==this.props.nodeId)
        nodePlot=elem
      
      if(elem.elementType!=undefined)
        if(elem.elementType=='EPOCHS')
          epochsExists=true
    })
    let outputType=nodePlot.inputData.outputType
    let eventSamples=null;
    let eventIds=null;
    let samplingFreq=null;
    let epochOptions=null;
    let epochs=null;
    if(outputType=='epochs'){
      eventSamples=nodePlot.inputData.summary["events_selected"]["event_samples"]
      eventIds=nodePlot.inputData.summary["events_selected"]["event_ids"]
      samplingFreq=nodePlot.inputData.summary["sampling_freq"]
      epochs=Array.from({length: eventIds.length}, (v, k) => (k+1).toString()); 
      epochOptions=epochsToOptions(epochs,eventIds,eventSamples,samplingFreq)
    }


    this.state={
      default:{
        channels:null,
        minTimeWindow:null,
        maxTimeWindow:null,
        minFreqWindow:null,
        maxFreqWindow:null,
        window:null,
        normalization:null,
        average:null,
        size:'m',
        type:'welch',
        epochs:null,
      },
      channelsOptions:channelsOptions.map(ch => {
        return {value:ch,label:ch}
      }),
      windowOptions:windowOptions,
      averageOptions:averageOptions,
      normalizationOptions:normalizationOptions,
      outputType:outputType,
      epochsExists:epochsExists,
      epochOptions:epochOptions,
      numberOfEpochs:epochs==null? null : epochs.length,
      eventSamples:eventSamples,
      eventIds:eventIds,
      samplingFreq:samplingFreq,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeInputRadio = this.handleChangeInputRadio.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.handleSelect=this.handleSelect.bind(this);
    this.checkButtonsById=this.checkButtonsById.bind(this);
    this.checkButtonsByBool=this.checkButtonsByBool.bind(this);
    this.getValue=this.getValue.bind(this);
    this.handleCheckbox=this.handleCheckbox.bind(this);

  }
  handleCheckbox(e,checkboxId){
    const checked = e.target.checked;
    this.props.onChange(checkboxId, checked==true ? 'true' : 'false');
  }
  checkButtonsByBool(inputIds){
    inputIds.forEach(id =>{
      if(this.getValue(id)!=null){
        if(this.getValue(id)=='true') // el id tiene que ser igual al valor del button
          document.getElementById(id).checked=true
        else
          document.getElementById(id).checked=false
      }
    })
  }
  checkButtonsById(inputId,radioButtonIds){
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
    this.checkButtonsById('type',['welch','multitaper'])
    this.checkButtonsById('size',['m','l'])
    this.checkButtonsByBool(['adaptive','bias'])
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
        {
          this.state.epochsExists==true && this.state.outputType==null ?
          <CFormGroup row style={{margin:'0', width:'380px'}}>
            <CCol md="12">
              <CCard color="danger" className="text-white text-center">
                <CCardBody>
                  <header>Advertencia!</header>
                  <p>
                    Bloque epocas detectado en el diagrama: 
                    Tiene que ejecutar el proceso primero.
                  </p>
                </CCardBody>
              </CCard>
            </CCol>
          </CFormGroup>: null
        }
        {
          this.state.outputType=='epochs' ?
          <div>
            <CFormGroup row>
              <CCol xs="12" md="12">
                <CLabel>Cantidad de epocas:{this.state.numberOfEpochs}</CLabel>
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol md="12">
                <CLabel htmlFor="freq-inf">Epocas</CLabel>
                <Select 
                options={this.state.epochOptions} 
                value={
                  this.getValue("epochs")==null ? 
                  null : 
                  epochsToOptions(this.getValue("epochs"),this.state.eventIds,this.state.eventSamples,this.state.samplingFreq)
                } 
                onChange={(option) => this.handleSelect(optionsToEpochs(option),'epochs')}
                />
              </CCol>
            </CFormGroup>
          </div> : null
        }
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="channels">Canales</CLabel>
            <Select options={this.state.channelsOptions} isMulti value={this.getValue("channels")==null ? null : this.getValue("channels").map(ch => {return {value:ch, label:ch}})} onChange={(options) => this.handleMultiSelect(options,'channels')}/>
            {/*<CInput id="channels" placeholder="Ch1,Ch2,Ch3" required value={value('channels')} onChange={(event) => this.handleChange(event,'channels')}/>*/}
          </CCol>
        </CFormGroup>
        {this.state.outputType=='raw' || this.state.outputType==null?
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
          </CFormGroup>: null
        }
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="frequencyWindow">Ventana de frecuencias:</CLabel>
              <CFormGroup row>
                <CCol md="6">
                    <CInput id="minFreqWindow" placeholder={"frecuencia mínima (Hz)"} type="number" min="0" step="0.01" required value={this.getValue('minFreqWindow')} onChange={(event) => this.handleChange(event,'minFreqWindow')}/>
                </CCol>
                <CCol md="6">
                  <CInput id="maxFreqWindow" placeholder={"frecuencia máxima (Hz)"} type="number" min="0" step="0.01" required value={this.getValue('maxFreqWindow')} onChange={(event) => this.handleChange(event,'maxFreqWindow')}/>
                </CCol>
              </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
            <CCol md="2">
                <CLabel md="6" htmlFor="type">Tipo:</CLabel>
            </CCol>
            <CCol md="10">
                <CFormGroup variant="custom-radio" inline> {/* la prop 'name' tiene que ser la misma para todos para que esten en el mismo grupo*/}
                    <CInputRadio custom id="welch" name="psd-type" value="welch" onChange={(event) => this.handleChangeInputRadio(event,'welch','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="welch">Welch</CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" inline>
                    <CInputRadio custom id="multitaper" name="psd-type" value="multitaper" onChange={(event) => this.handleChangeInputRadio(event,'multitaper','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="multitaper">Multitaper</CLabel>
                </CFormGroup>
            </CCol>
        </CFormGroup>
          {
            this.getValue('type')=='welch' ?
            <div>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="n_fft">Largo de la FFT usada:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="n_fft" placeholder={"256"} type="number" min="0" step="1" value={this.getValue('n_fft')} onChange={(event) => this.handleChange(event,'n_fft')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="n_overlap">Superp. entre segmentos (puntos):</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="n_overlap" placeholder={"0"} type="number" min="0" step="1" value={this.getValue('n_overlap')} onChange={(event) => this.handleChange(event,'n_overlap')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="n_per_seg">Segmento de Welch (puntos):</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="n_per_seg" placeholder={"Igual a FFT"} type="number" min="0" step="1" value={this.getValue('n_per_seg')} onChange={(event) => this.handleChange(event,'n_per_seg')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="window">Ventana:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <Select options={this.state.windowOptions} onChange={(options) => this.handleSelect(options,'window')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="average">Promediar segmentos por:</CLabel>
                    </CCol>
                    <CCol md="4">
                    <Select options={this.state.averageOptions} onChange={(options) => this.handleSelect(options,'average')}/>
                    </CCol>
                </CFormGroup>
            </div>:
            <div>
                <CFormGroup row>
                    <CCol md="5">
                        <CLabel htmlFor="bandwidth">Ancho de banda de la función ventana:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="bandwidth" placeholder={"4"} type="number" min="0" step="1" value={this.getValue('bandwidth')} onChange={(event) => this.handleChange(event,'bandwidth')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="6">
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox 
                      custom id="adaptive" 
                      name="inline-checkbox1" 
                      value="true"
                      onClick={(e) => this.handleCheckbox(e,'adaptive')}
                      />
                      <CLabel variant="custom-checkbox" htmlFor="adaptive">Pesos adaptativos</CLabel>
                    </CFormGroup>
                  </CCol>
                  <CCol md="6">
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox 
                      custom id="bias" 
                      name="inline-checkbox2" 
                      value="true"
                      onClick={(e) => this.handleCheckbox(e,'bias')}
                      />
                      <CLabel variant="custom-checkbox" htmlFor="bias">Bias bajo</CLabel>
                    </CFormGroup>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="normalization">Normalización:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <Select options={this.state.normalizationOptions} onChange={(options) => this.handleSelect(options,'normalization')}/>
                    </CCol>
                </CFormGroup>
            </div> 
          }
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
    channels:state.file.fileInfo.channels,
	};
}
  
const mapDispatchToProps = (dispatch) => {
	return {}
};
export default connect(mapStateToProps, mapDispatchToProps)(ChartPSDForm)
