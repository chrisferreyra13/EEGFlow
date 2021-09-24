import React, {Component} from 'react'
import {connect} from 'react-redux'
import Select from 'react-select'
import {
  CCol,
  CForm,
  CFormGroup,
  CLabel,
  CButton,
  CPagination,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { fetchMethodResult } from '../../redux/actions/Diagram'

import {SamplesToTimes} from '../../tools/Utils';

class EventsForm extends Component{
  constructor(props){
    super(props);

    const dataType='EVENTS'
    const nodeEvents=this.props.elements.find(e => e.id==this.props.nodeId)
    const signalData=nodeEvents.signalsData.find(s => {
      if(s.dataType==dataType)return true
      return false
    })

    let eventTypesOptions=[];
    let eventIds=null;
    let eventSamples=null;
    let samplingFreq=null;
    let dataReady=false;
    if(signalData==undefined){ 
      this.props.fetchMethodResult(this.props.fileId,[],{},this.props.nodeId,dataType)
    }
    else{
      signalData.data["event_ids"].forEach(id => {
        if(eventTypesOptions.includes(id)==false){
          eventTypesOptions.push(id)
        }
      })

      eventSamples=signalData.data["event_samples"]
      eventIds=signalData.data["event_ids"]
      samplingFreq=signalData.data["sampling_freq"]
      dataReady=true
      eventTypesOptions=eventTypesOptions.map(id => {
        return {value:id.toString(),label:id.toString()}
      })
    }
    
    this.state={
      default:{
        selectedEvents:null,
      },
      currentPage: 1,
      eventSamples:eventSamples,
      eventIds:eventIds,
      samplingFreq:samplingFreq,
      dataReady:dataReady,
      view:'list',
      eventTypesOptions:eventTypesOptions
    }
    this.setCurrentPage=this.setCurrentPage.bind(this);
    this.changeView=this.changeView.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
  }
  changeView(viewSelected){
    this.setState({
      view:viewSelected
    })
  }
  setCurrentPage(page){
    this.setState({
      currentPage: page
    })
  }
  handleMultiSelect(options,id){
    this.props.onChange(id, options.map((option) => option.value));
  }

  componentDidUpdate(prevProps,prevState){
		if(prevProps.inputsReady!==this.props.inputsReady){
      const dataType='EVENTS'
      const nodeEvents=this.props.elements.find(e => e.id==this.props.nodeId)
      const signalData=nodeEvents.signalsData.find(s => {
        if(s.dataType==dataType)return true
        return false
      })
      if(signalData!=undefined){
        let eventTypesOptions=[]
        signalData.data["event_ids"].forEach(id => {
          if(eventTypesOptions.includes(id)==false){
            eventTypesOptions.push(id)
          }
        })
        this.setState({
          eventSamples:signalData.data["event_samples"],
          eventIds:signalData.data["event_ids"],
          samplingFreq:signalData.data["sampling_freq"],
          dataReady:true,
          eventTypesOptions:eventTypesOptions.map(id => {
            return {value:id.toString(),label:id.toString()}
          })
        })
      }
    }
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
        {this.state.dataReady ?
          <div>
            {this.state.view=='list' ?
              <div>
                <CFormGroup row>
                  <CCol xs="12" md="12">
                    <CLabel>Cantidad de eventos: {this.state.eventSamples.length}</CLabel>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol xs="8" md="6">
                    <CLabel>Tipo:</CLabel>
                  </CCol>
                  <CCol xs="4" md="6">
                    <p className="form-control-static">{this.state.eventIds[this.state.currentPage-1]}</p>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol xs="10" md="8">
                    <CLabel>Latencia (seg):</CLabel>
                  </CCol>
                  <CCol xs="2" md="4">
                    <p className="form-control-static">{SamplesToTimes(this.state.eventSamples[this.state.currentPage-1],this.state.samplingFreq,3)}</p>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol xs="12" md="6">
                    <CButton type="submit" size="sm" color="primary">Agregar</CButton>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol xs="12" md="6">
                    <CButton type="submit" size="sm" color="primary" onClick={() => this.changeView('visualize')}>Visualizar</CButton>
                  </CCol>
                </CFormGroup>
                <h6 align="center">Numero de Evento</h6>
                <CPagination
                  align="center"
                  activePage={this.state.currentPage}
                  pages={this.state.eventSamples.length}
                  onActivePageChange={this.setCurrentPage}
                  size='sm'
                  dots={false}
                />
              </div>:
              <div>
                <CFormGroup row>
                  <CCol xs="12" md="12">
                    <CLabel htmlFor="event-types">Visualizar eventos de tipo:</CLabel>
                    <Select options={this.state.eventTypesOptions} placeholder={"default: Todos"} isMulti value={this.getValue("selectedEvents")==null ? null : this.getValue("selectedEvents").map(id => {return {value:id, label:id}})} onChange={(options) => this.handleMultiSelect(options,'selectedEvents')}/>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol xs="12" md="16">
                    <CButton type="submit" size="sm" color="primary" onClick={() => this.changeView('list')}>Listar</CButton>
                  </CCol>
                </CFormGroup>
              </div>
            }
          </div>:
          <div>
            <CRow>
              <CCol xs="12" md="12">
                <h4>Cargando...</h4>
              </CCol>
            </CRow>
            <CRow>
              <CCol xs="12" md="12">
                <CIcon size= "xl" name="cil-cloud-download" />
              </CCol>
            </CRow>
        </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return{
    fileId: state.file.fileId,
    elements: state.diagram.elements,
    inputsReady: state.diagram.inputsReady
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    fetchMethodResult: (id,channels,plotParams,nodeId,type) => dispatch(fetchMethodResult(id,channels,plotParams,nodeId,type)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsForm)