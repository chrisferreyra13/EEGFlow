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
        {value:'mean',label:'Medio'},
        {value:'median',label:'Mediana'},
    ]

    this.state={
      default:{
        channels:"",
        minTimeWindow:null,
        maxTimeWindow:null,
        minFreqWindow:null,
        maxFreqWindow:null,
        size:'s',
        type:'welch'
      },
      channelsOptions:channelsOptions.map(ch => {
        return {value:ch,label:ch}
      }),
      windowOptions:windowOptions,
      averageOptions:averageOptions
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeInputRadio = this.handleChangeInputRadio.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.handleSelect=this.handleSelect.bind(this);

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
            <Select options={this.state.channelsOptions} isMulti onChange={(options) => this.handleMultiSelect(options,'channels')}/>
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
                  <CInput id="maxTimeWindow" placeholder={"tiempo máximo (seg)"} type="number" min="0" step="0.5" required value={value('maxTimeWindow')} onChange={(event) => this.handleChange(event,'maxTimeWindow')}/>
                </CCol>
              </CFormGroup>
          </CCol>
        </CFormGroup>
        <CFormGroup row>
          <CCol md="12">
            <CLabel htmlFor="frequencyWindow">Ventana de frecuencias:</CLabel>
              <CFormGroup row>
                <CCol md="6">
                    <CInput id="minFreqWindow" placeholder={"frecuencia mínima (Hz)"} type="number" min="0" step="0.5" required value={value('minFreqWindow')} onChange={(event) => this.handleChange(event,'minFreqWindow')}/>
                </CCol>
                <CCol md="6">
                  <CInput id="maxFreqWindow" placeholder={"frecuencia máxima (Hz)"} type="number" min="0" step="0.5" required value={value('maxFreqWindow')} onChange={(event) => this.handleChange(event,'maxFreqWindow')}/>
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
                    <CInputRadio custom id="inline-radio1" name="inline-radios" onChange={(event) => this.handleChangeInputRadio(event,'welch','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="inline-radio1">Welch</CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" inline>
                    <CInputRadio custom id="inline-radio2" name="inline-radios" onChange={(event) => this.handleChangeInputRadio(event,'multitaper','type')}/>
                    <CLabel variant="custom-checkbox" htmlFor="inline-radio2">Multitaper</CLabel>
                </CFormGroup>
            </CCol>
        </CFormGroup>
        {
            value('type')=='welch' ?
            <div>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="nFft">Largo de la FFT usada:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="nFft" placeholder={"256"} type="number" min="0" step="1" value={value('nFft')} onChange={(event) => this.handleChange(event,'nFft')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="nOverlap">Superp. entre segmentos (puntos):</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="nOverlap" placeholder={"0"} type="number" min="0" step="1" value={value('nOverlap')} onChange={(event) => this.handleChange(event,'nOverlap')}/>
                    </CCol>
                </CFormGroup>
                <CFormGroup row>
                    <CCol md="7">
                        <CLabel htmlFor="nPerSeg">Segmento de Welch (puntos):</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="nPerSeg" placeholder={"Ninguno"} type="number" min="0" step="1" value={value('nPerSeg')} onChange={(event) => this.handleChange(event,'nPerSeg')}/>
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
                        <CLabel htmlFor="fftLength">Ancho de banda:</CLabel>
                    </CCol>
                    <CCol md="4">
                        <CInput id="fftLength" placeholder={"256"} type="number" min="0" step="1" required value={value('fftLength')} onChange={(event) => this.handleChange(event,'fftLength')}/>
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
export default connect(mapStateToProps, mapDispatchToProps)(ChartPSDForm)
