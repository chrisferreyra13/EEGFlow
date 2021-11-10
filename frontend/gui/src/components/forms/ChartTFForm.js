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

class ChartTFForm extends Component{
  constructor(props){
    super(props);

    const channelsOptions = this.props.channels
    const baselineMode=[ //agregar si es necesario
        {value:'mean',label:'Media'},
        {value:'ratio',label:'Ratio'},
        {value:'logratio',label:'Logratio'},
        {value:'percent',label:'Percent'},
        {value:'zscore',label:'Zscore'},
        {value:'zlogratio',label:'Zlogratio'},
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
        minFreq:null,
        maxFreq:null,
        stepFreq:null,
        vmin:null,
        vmax:null,
        baseline:null,
        n_cycles:null,
        time_bandwidth:null,
        fmin:null,
        fmax:null,
        baselineMode:null,
        average:null,
        size:'m',
        type:'morlet', //multitaper, stockwell
        epochs:null,
      },
      channelsOptions:channelsOptions.map(ch => {
        return {value:ch,label:ch}
      }),
      baselineMode:baselineMode,
      outputType:outputType,
      epochsExists:epochsExists,
      epochOptions:epochOptions,
      numberOfEpochs:epochs==null? null : epochs.length,
      eventSamples:eventSamples,
      eventIds:eventIds,
      samplingFreq:samplingFreq,
      enableEpochs:true
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeInputRadio = this.handleChangeInputRadio.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.handleSelect=this.handleSelect.bind(this);
    this.checkButtonsById=this.checkButtons.bind(this);
    this.checkButtonsByBool=this.checkButtonsByBool.bind(this);
    this.getValue=this.getValue.bind(this);
    this.handleCheckbox=this.handleCheckbox.bind(this);

  }
  handleCheckbox(e,checkboxId){
    const checked = e.target.checked;
    
    if (checkboxId=='average'){ // for generic use, convert this 'if' in switch case
      this.setState({
        enableEpochs:!checked //the use don't need to select epoch for average option
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
    if(id=='mode'){
      if(option.value=='logratio' || option.value=='zlogratio'){
        if(document.getElementById('dB').checked==false){
          this.props.onChange('dB', 'true');
          document.getElementById('dB').checked=true
          document.getElementById('dB').disabled=true
        }
      }
      else{
        document.getElementById('dB').disabled=false
      }
    }
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
    this.checkButtons('type',['morlet','multitaper','stockwell'])
    this.checkButtons('size',['m','l'])
    this.checkButtonsByBool(['average','dB','use_fft','zero_mean'])
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
        <CFormGroup row>
          <CCol md="12">
            <CLabel>Cantidad de epocas:{this.state.numberOfEpochs}</CLabel>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="freq-inf">Epocas</CLabel>
            <Select  
            options={this.state.enableEpochs ? this.state.epochOptions : null} 
            value={
              this.getValue("epochs")==null ? 
              null : 
              epochsToOptions(this.getValue("epochs"),this.state.eventIds,this.state.eventSamples,this.state.samplingFreq)
            } 
            onChange={(option) => this.handleSelect(optionsToEpochs(option),'epochs')}
            />
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="channels">Canales</CLabel>
            <Select options={this.state.channelsOptions} isMulti value={this.getValue("channels")==null ? null : this.getValue("channels").map(ch => {return {value:ch, label:ch}})} onChange={(options) => this.handleMultiSelect(options,'channels')}/>
            {/*<CInput id="channels" placeholder="Ch1,Ch2,Ch3" required value={value('channels')} onChange={(event) => this.handleChange(event,'channels')}/>*/}
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="vrange">Rango de valores de escala:</CLabel>
              <CFormGroup row>
                <CCol md="4">
                    <CInput
                    id="vmin"
                    placeholder={"valor minimo"}
                    type="number"
                    step="0.01"
                    value={this.getValue("vmin")==null ? '' : this.getValue("vmin")}
                    onChange={(event) => this.handleChange(event,'vmin')}/>
                </CCol>
                <CCol md="4">
                  <CInput
                  id="vmax"
                  placeholder={"valor maximo"}
                  type="number"
                  step="0.01"
                  value={this.getValue("vmax")==null ? '' : this.getValue("vmax")}
                  onChange={(event) => this.handleChange(event,'vmax')}/>
                </CCol>
              </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="7">
              <CLabel htmlFor="baseline">Corrección de linea de base:</CLabel>
          </CCol>
          <CCol md="5">
              <CInput id="baseline" placeholder={"ejemplos: 0,0.1 o ,"} value={this.getValue('baseline')} onChange={(event) => this.handleChange(event,'baseline')}/>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
            <CCol md="7">
                <CLabel htmlFor="mode">Modo de corrección:</CLabel>
            </CCol>
            <CCol md="5">
                <Select options={this.state.baselineMode} onChange={(options) => this.handleSelect(options,'mode')}/>
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
          <CCol md="6">
            <CFormGroup variant="custom-checkbox" inline>
              <CInputCheckbox
              custom id="dB" 
              name="inline-checkbox2" 
              value="true"
              onClick={(e) => this.handleCheckbox(e,'dB')}
              />
              <CLabel variant="custom-checkbox" htmlFor="dB">dB</CLabel>
            </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
            <CCol md="2">
                <CLabel md="6" htmlFor="type">Tipo:</CLabel>
            </CCol>
            <CCol md="10">
                <CFormGroup variant="custom-radio" inline> {/* la prop 'name' tiene que ser la misma para todos para que esten en el mismo grupo*/}
                    <CInputRadio custom id="morlet" name="tf-type" value="morlet" onChange={(event) => this.handleChangeInputRadio(event,'morlet','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="morlet">Morlet</CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" inline>
                    <CInputRadio custom id="multitaper" name="tf-type" value="multitaper" onChange={(event) => this.handleChangeInputRadio(event,'multitaper','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="multitaper">Multitaper</CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" inline> {/* la prop 'name' tiene que ser la misma para todos para que esten en el mismo grupo*/}
                    <CInputRadio custom id="stockwell" name="tf-type" value="stockwell" onChange={(event) => this.handleChangeInputRadio(event,'stockwell','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="stockwell">Stockwell</CLabel>
                </CFormGroup>
            </CCol>
        </CFormGroup>
          {
            this.getValue('type')=='morlet' || this.getValue('type')=='multitaper' ?
            <div>
              <CFormGroup row>
                <CCol md="12">
                  <CLabel htmlFor="freqs">Rango de frecuencias (freqs):</CLabel>
                    <CFormGroup row>
                      <CCol md="5">
                          <CInput id="minFreq" placeholder={"frec. mínima (Hz)"} type="number" min="0" step="0.01" required value={this.getValue('minFreq')} onChange={(event) => this.handleChange(event,'minFreq')}/>
                      </CCol>
                      <CCol md="5">
                        <CInput id="maxFreq" placeholder={"frec. máxima (Hz)"} type="number" min="0" step="0.01" required value={this.getValue('maxFreq')} onChange={(event) => this.handleChange(event,'maxFreq')}/>
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol md="4">
                        <CInput id="stepFreq" placeholder={"paso (Hz)"} type="number" min="0" step="0.01" required value={this.getValue('stepFreq')} onChange={(event) => this.handleChange(event,'stepFreq')}/>
                      </CCol>
                    </CFormGroup>
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="7">
                  <CLabel htmlFor="n_cycles">Numero de ciclos:</CLabel>
                </CCol>
                <CCol md="5">
                  <CInput id="n_cycles" placeholder={"ejemplos: 7 o freqs,5"} required value={this.getValue('n_cycles')} onChange={(event) => this.handleChange(event,'n_cycles')}/>
                </CCol>
              </CFormGroup>
              {this.getValue('type')=='morlet' ?
              <div>
                <CFormGroup row>
                  <CCol md="6">
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox 
                      custom id="use_fft" 
                      name="inline-checkbox1" 
                      value="true"
                      onClick={(e) => this.handleCheckbox(e,'use_fft')}
                      />
                      <CLabel variant="custom-checkbox" htmlFor="use_fft">Convolución FFT</CLabel>
                    </CFormGroup>
                  </CCol>
                  <CCol md="6">
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox 
                      custom id="zero_mean" 
                      name="inline-checkbox2" 
                      value="true"
                      onClick={(e) => this.handleCheckbox(e,'zero_mean')}
                      />
                      <CLabel variant="custom-checkbox" htmlFor="zero_mean">Media Cero</CLabel>
                    </CFormGroup>
                  </CCol>
                </CFormGroup>
              </div>:
              <div>
                <CFormGroup row>
                  <CCol md="12">
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox 
                      custom id="use_fft" 
                      name="inline-checkbox1" 
                      value="true"
                      onClick={(e) => this.handleCheckbox(e,'use_fft')}
                      />
                      <CLabel variant="custom-checkbox" htmlFor="use_fft">Convolución FFT</CLabel>
                    </CFormGroup>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="time_bandwidth">Ancho de banda de tiempo:</CLabel>
                    </CCol>
                    <CCol md="5">
                        <CInput id="time_bandwidth" placeholder={"4.0"} type="number" min="0" step="1" value={this.getValue('time_bandwidth')} onChange={(event) => this.handleChange(event,'time_bandwidth')}/>
                    </CCol>
                </CFormGroup>
              </div>
              }
            </div>:
            <div>
                <CFormGroup row>
                  <CCol md="12">
                    <CLabel htmlFor="freqs">Rango de frecuencias:</CLabel>
                      <CFormGroup row>
                        <CCol md="4">
                            <CInput id="fmin" placeholder={"frec. mínima (Hz)"} type="number" min="0" step="0.01" value={this.getValue('fmin')} onChange={(event) => this.handleChange(event,'fmin')}/>
                        </CCol>
                        <CCol md="4">
                          <CInput id="fmax" placeholder={"frec. máxima (Hz)"} type="number" min="0" step="0.01" value={this.getValue('fmax')} onChange={(event) => this.handleChange(event,'fmax')}/>
                        </CCol>
                      </CFormGroup>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="width">Ancho de ventana Gaussiana:</CLabel>
                    </CCol>
                    <CCol md="5">
                        <CInput id="width" placeholder={"ejemplo: 1.0"} type="number" min="0" step="0.01" value={this.getValue('width')} onChange={(event) => this.handleChange(event,'width')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="n_fft">Longitud de ventanas</CLabel>
                    </CCol>
                    <CCol md="5">
                        <CInput id="n_fft" placeholder={"ejemplo: 16"} type="number" min="0" step="1" value={this.getValue('n_fft')} onChange={(event) => this.handleChange(event,'n_fft')}/>
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
export default connect(mapStateToProps, mapDispatchToProps)(ChartTFForm)
