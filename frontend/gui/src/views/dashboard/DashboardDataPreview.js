import React, { Component } from 'react'
import {connect} from 'react-redux'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
  CLink,
} from '@coreui/react'

import { FilePond, File, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'

import {getFileInfo,postFileInfo} from '../../redux/actions/File'
import {runProcess, setNodeFileId} from '../../redux/actions/Diagram'
import {enableListGroupFileInfo, disableListGroupFileInfo} from '../../redux/actions/Dashboard'

class DashboardDataPreview extends Component{
  constructor(props){
    super(props);
    
    this.state={
      files: [],
    }
    

    this.setFiles=this.setFiles.bind(this);
    this.vizButton=this.vizButton.bind(this);
    this.cancelUpload=this.cancelUpload.bind(this);
    
    //this.revertFile=this.revertFile.bind(this);
    this.setInfo=this.setInfo.bind(this);
    this.setServerId=this.setServerId.bind(this);
  }
  cancelUpload(){
    this.setState({
      files:[]
    })
    this.props.disableListGroupFileInfo()
  }

  setFiles(fileItems){
    this.setState({
      files: fileItems.map(fileItem => fileItem.file)
    });
  }
  setInfo(info){
    this.setState({
      info: info
    });
  }
  setServerId(ids){ // TODO: MEJORAR ESTO, MUY CABEZA
    if (this.state.files.length==1){
      //this.state.files[0].serverId=ids;
      console.log(ids)
      /*this.setState({
        files: Object.assign({},this.state.files,{
          '0': Object.assign({},this.state.files[0],{
            serverId:ids
          }),
        }) 
      })*/
      this.state.files[0].serverId=ids;
      console.log(this.state.files)
    }
    
  }
  revertFile(error,file){
    console.log('holaaaa') //ESTO NO SE SI AL FINAL SE VA A USAR
  }

  fetchFileInfo(response){
    this.setServerId(response);
    this.props.postFileInfo(this.state.files[0].serverId)
    //espero...
  }

  componentDidUpdate(prevProps) {
    // Uso tipico (no olvides de comparar las props):
    if (this.props.fileId !== prevProps.fileId) {
      this.props.getFileInfo(this.props.fileId)
      this.props.setNodeFileId(this.props.fileId) // Seteo el file id de la señal
      this.props.enableListGroupFileInfo() //Esto ya tiene una falla, si no busca bien el archivo
                                        // no hay info, pero se activa el list group --> MODIFICAR
    }
  }

  vizButton(){
    this.props.runProcess(this.props.elements) 
  }

  
  render(){
    const serverConf= {
      url: 'http://127.0.0.1:8000/fm',
      process: {
          url: '/process/',
          method: 'POST',
          withCredentials: false,
          onload: (response) => this.fetchFileInfo(response),
          onerror: (response) => response.data,
      },
      load: {
        url: '/load/',
        method: 'GET'
      },
      /*
      revert:{
        url: '/revert/',
        methos: 'DELETE'
      }*/
    }

    let listGroup;
    if (!this.props.enableListGroup){
      listGroup=null;
    }
    else {
      listGroup= <CListGroup>
                  <CListGroupItem>ID de proyecto: {this.props.fileInfo.projectId}</CListGroupItem>
                  <CListGroupItem>Nombre de proyecto: {this.props.fileInfo.projectName}</CListGroupItem>
                  <CListGroupItem>Experimentador: {this.props.fileInfo.projectExperimenter}</CListGroupItem>
                  <CListGroupItem>Fecha de medicion: {this.props.fileInfo.measurementDate}</CListGroupItem>
                  <CListGroupItem>Numero de canales: {this.props.fileInfo.numberOfChannels}</CListGroupItem>
                  <CListGroupItem>Referencia aplicada: {this.props.fileInfo.customRefApplied ? 'Si' : 'No'}</CListGroupItem>
                </CListGroup>;
    }

    return (
      <div>
        <CRow>
          <CCol sm="12" className="d-none d-md-block">
            <div className="Filepond-Button">
              <FilePond
                ref={ref => this.pond=ref}
                files={this.state.files}
                onupdatefiles={this.setFiles} 
                processFile={this.state.files}
                removeFile={this.state.files[0]}
                onremovefile={() => this.cancelUpload()}
                allowMultiple={true}
                maxFiles={3}
                server={serverConf}
                name="filemanager"
                labelIdle='Arrastra & Suelta tu archivo o <span class="filepond--label-action">Buscar</span>'
              />
            </div>
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="12" xl="6">

            <CCard>
              <CCardHeader>
                Estudio
                { this.props.enableListGroup ?
                <div className="card-header-actions">
                  <CLink 
                    aria-current="page" 
                    to="/app/edit/plot"
                  >
                  {/*<a href="https://coreui.github.io/components/listgroup/" rel="noreferrer noopener" target="_blank" className="card-header-action">*/}
                    <CButton block color="info" onClick={this.vizButton}>Visualizar</CButton>
                  {/*</a>}*/}
                  </CLink>
                </div> :
                null
                }
              </CCardHeader>
              <CCardBody>
                {this.props.enableListGroup ? 
                listGroup :
                <CListGroup>
                <CListGroupItem>No tiene ningun estudio cargado</CListGroupItem>
              </CListGroup>
                }
              </CCardBody>
            </CCard>

          </CCol>
        </CRow>
      </div>
    )
  }
}
  
const mapStateToProps = (state) => {
  return{
    fileInfo: state.file.fileInfo,
    fileId:state.file.fileId,
    enableListGroup: state.dashboardDataPreview.enableListGroupFileInfo,
    elements: state.diagram.elements,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    postFileInfo: (fileIdServer) => dispatch(postFileInfo(fileIdServer)),
    getFileInfo: (fileId) => dispatch(getFileInfo(fileId)),
    enableListGroupFileInfo: () => dispatch(enableListGroupFileInfo()),
    disableListGroupFileInfo: () => dispatch(disableListGroupFileInfo()),
    runProcess: (elements) => dispatch(runProcess(elements)),
    setNodeFileId: (fileId) => dispatch(setNodeFileId(fileId))
  
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardDataPreview)