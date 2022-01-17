import React, {Component} from 'react'
import {connect} from 'react-redux'
import Select from 'react-select'
import {
  CCol,
  CForm,
  CFormGroup,
  CAlert,
  CLabel,
  CButton,
  CPagination,
  CRow,
  CInput
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { fetchMethodResult } from '../../redux/actions/Diagram'

import {
  SamplesToTimes,
  eventsToOptions,
  optionsToEvents
} from '../../tools/Utils';

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
    let firstSample=null;
    let lastSample=null;
    let eventsPresented=true;

    if(signalData==undefined){ 
      this.props.fetchMethodResult(this.props.fileId,[],{},this.props.nodeId,dataType)
      eventsPresented=false
    }
    else{
      if(nodeEvents.params["new_events"]!=null && nodeEvents.params.id!=undefined){
        eventsPresented=checkNewEvents(
          nodeEvents.params["new_events"], signalData.data["event_samples"],
          signalData.data["event_ids"],signalData.data["sampling_freq"]
          )
        if(!eventsPresented){
          this.props.fetchMethodResult(nodeEvents.params.id,[],{},this.props.nodeId,dataType)
        }
      }
    }
    if(eventsPresented){
      signalData.data["event_ids"].forEach(id => {
        if(eventTypesOptions.includes(id)==false){
          eventTypesOptions.push(id)
        }
      })

      eventSamples=signalData.data["event_samples"]
      eventIds=signalData.data["event_ids"]
      samplingFreq=signalData.data["sampling_freq"]
      firstSample=signalData.data["first_sample"]
      lastSample=signalData.data["last_sample"]
      dataReady=true
      eventTypesOptions=eventTypesOptions.map(id => {
        return {value:id.toString(),label:id.toString()}
      })
    }
      
    
    this.state={
      default:{
        selectedEvents:null,
        new_events:null
      },
      currentPage: 1,
      eventSamples:eventSamples,
      eventIds:eventIds,
      samplingFreq:samplingFreq,
      firstSample:firstSample,
      lastSample:lastSample,
      dataReady:dataReady,
      view:'list',
      eventTypesOptions:eventTypesOptions,
      newEventId:null,
      newEventTime:null,
      newEventIds:[],
      newEventTimes:[],
      newEventOptions:[],
      showError:this.props.methodFetchingError
      
    }

    this.setCurrentPage=this.setCurrentPage.bind(this);
    this.changeView=this.changeView.bind(this);
    this.handleMultiSelect=this.handleMultiSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addEvent=this.addEvent.bind(this);
    this.handleNewValue=this.handleNewValue.bind(this);
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
  handleChange(event,id) {
    this.props.onChange(id, event.target.value);
  }
  addEvent(event,id){
    if(this.state.newEventId==null || this.state.newEventTime==null){
      return
    }
    let newEventIds=this.state.newEventIds.map(i => i)
    let newEventTimes=this.state.newEventTimes.map(i => i)
    newEventIds.push(this.state.newEventId)
    newEventTimes.push(this.state.newEventTime)
    this.setState({
      newEventIds:newEventIds,
      newEventTimes:newEventTimes,
      newEventOptions:newEventIds.map((id,j) => {
        return {
          value:('ID:'+id.toString()+' || LAT:'+newEventTimes[j].toString()), 
          label:('ID:'+id.toString()+' || LAT:'+newEventTimes[j].toString()),
        }
      })
    })
    let currentNewEventOptions=this.getValue("new_events")==null ? [] : eventsToOptions(this.getValue("new_events"))
    currentNewEventOptions.push({
      value:('ID:'+this.state.newEventId.toString()+' || LAT:'+this.state.newEventTime.toString()), 
      label:('ID:'+this.state.newEventId.toString()+' || LAT:'+this.state.newEventTime.toString()),
    })
    this.handleMultiSelect(optionsToEvents(currentNewEventOptions),'new_events')
    
  }
  handleNewValue(event,id){
    this.setState({
      [id]:event.target.value //change the corresponding attribute
    })
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
          firstSample:signalData.data["first_sample"],
          lastSample:signalData.data["last_sample"],
          dataReady:true,
          eventTypesOptions:eventTypesOptions.map(id => {
            return {value:id.toString(),label:id.toString()}
          })
        })
      }
    }
    if(prevProps.methodFetchingError!==this.props.methodFetchingError){
      this.setState({
        showError:this.props.methodFetchingError
      })
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
                    <CLabel>Tipo de evento:</CLabel>
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
                    <CButton type="submit" size="sm" color="primary" onClick={() => this.changeView('add')}>Agregar</CButton>
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol xs="12" md="6">
                    <CButton type="submit" size="sm" color="primary" onClick={() => this.changeView('viz')}>Visualizar</CButton>
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
                {
                  this.state.view=='viz' ? 
                  <div>
                    <CFormGroup row>
                      <CCol xs="12" md="12">
                        <CLabel htmlFor="event-types">Visualizar eventos de tipo:</CLabel>
                        <Select 
                          options={this.state.eventTypesOptions} 
                          placeholder={"default: Todos"} 
                          isMulti 
                          value={this.getValue("selectedEvents")==null ? null : this.getValue("selectedEvents").map(id => {return {value:id, label:id}})} 
                          onChange={(options) => this.handleMultiSelect(options,'selectedEvents')}
                        />
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol xs="12" md="16">
                        <CButton type="submit" size="sm" color="primary" onClick={() => this.changeView('list')}>Listar</CButton>
                      </CCol>
                    </CFormGroup>
                  </div> :
                  <div>
                    <CFormGroup row>
                      <CCol xs="12" md="12">
                        <CLabel>
                          Rango de latencia permitido (seg): 
                          {SamplesToTimes(this.state.firstSample,this.state.samplingFreq,3)}
                          -
                          {SamplesToTimes(this.state.lastSample,this.state.samplingFreq,3)}
                        </CLabel>
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol md="12">
                        <CLabel htmlFor="event_id">Tipo de evento:</CLabel>
                          <CFormGroup row>
                            <CCol md="12">
                                <CInput id="event_id" placeholder={"Ej: 4"} required value={this.state.newEventId} onChange={(event) => this.handleNewValue(event,'newEventId')}/>
                            </CCol>
                          </CFormGroup>
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol md="12">
                        <CLabel htmlFor="event_time">Latencia (seg):</CLabel>
                          <CFormGroup row>
                            <CCol md="12">
                                <CInput id="event_time" placeholder={"Ej: 2.56"} nutype="number" min="0" step="0.01" required value={this.state.newEventTime} onChange={(event) => this.handleNewValue(event,'newEventTime')}/>
                            </CCol>
                          </CFormGroup>
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol xs="12" md="16">
                        <CButton type="button" size="sm" color="primary" onClick={() => this.addEvent()}>Agregar</CButton>
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol xs="12" md="12">
                        <CLabel htmlFor="events">Seleccionar nuevos eventos:</CLabel>
                        <Select 
                          options={this.state.newEventOptions} 
                          isMulti 
                          value={this.getValue("new_events")==null ? null : eventsToOptions(this.getValue("new_events"))} 
                          onChange={(options) => this.handleMultiSelect(optionsToEvents(options),'new_events')}
                        />
                      </CCol>
                    </CFormGroup>
                    <CFormGroup row>
                      <CCol xs="12" md="16">
                        <CButton type="submit" size="sm" color="primary" onClick={() => this.changeView('list')}>Listar</CButton>
                      </CCol>
                    </CFormGroup>
                  </div>
                }
              </div>
            }
          </div>:
          <div>
            {this.state.showError ? 
            <div>
              <CAlert color="danger" style={{marginBottom:'0px',padding:'0.4rem 1.25rem'}}>
                  Error al buscar los eventos!
              </CAlert>
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
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return{
    fileId: state.file.fileId,
    elements: state.diagram.elements,
    inputsReady: state.diagram.inputsReady,
    methodFetchingError:state.diagram.errors.methodFetchingError
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    fetchMethodResult: (id,channels,plotParams,nodeId,type) => dispatch(fetchMethodResult(id,channels,plotParams,nodeId,type)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsForm)


function checkNewEvents(newEvents,eventSamples,eventIds,sf){
  let newEventSample=0;
  return newEvents.every(ev => {
    newEventSample=parseInt(parseFloat(ev.split(',')[1])*sf)
    if(eventIds.includes(parseInt(ev.split(',')[0]))
      && eventSamples.includes(newEventSample))
      return true;
    else
      return false
  })
}