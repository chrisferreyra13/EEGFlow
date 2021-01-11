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

import {getFileInfo} from '../../redux/actions/File'
import {enableListGroupFileInfo, disableListGroupFileInfo} from '../../redux/actions/Dashboard'

// Server conf
//import serverConf from './_server'



class DashboardDataPreview extends Component{
  constructor(props){
    super(props);
    this.state={
      files: [],      
    }
    

    this.setFiles=this.setFiles.bind(this);
    
    //this.revertFile=this.revertFile.bind(this);
    this.setInfo=this.setInfo.bind(this);
    this.setFileId=this.setFileId.bind(this);
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
  setFileId(ids){ // TODO: MEJORAR ESTO, MUY CABEZA
    if (this.state.files.length==1){
      //this.state.files[0].serverId=ids;
      console.log(ids)
      /*this.setState({ PROBE ESTO PERO NO FUNCO, PERO POR ACA VAN LOS TIROS
        files: Object.assign({},this.state.files,{
          '0': Object.assign({},this.state.files[0],{
            serverId:ids
          }),
        }) 
      })*/
      this.state.files[0].serverId=ids;
      console.log(this.state.files)
    }
    
    /*else{
      /*for(let i=0;i<this.state.files.length;i++){
        this.state.files[i].serverId=ids[i];
      }*/
      /*
      this.setState({
        files: this.props.files.map((file) =>{ 
          return Object.assign({},file,{
            serverId:ids
          })
        }
      })
    }*/
  }
  revertFile(error,file){
    console.log('holaaaa') //ESTO NO SE SI AL FINAL SE VA A USAR
  }

  fetchFileInfo(response){
    this.setFileId(response);
    this.props.getFileInfo(this.state.files[0].serverId)
    this.props.enableListGroupFileInfo() //Esto ya tiene una falla, si no busca bien el archivo
                                        // no hay info, pero se activa el list group --> MODIFICAR
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
      revert:{
        url: '/revert/',
        methos: 'DELETE'
      }
    }

    let listGroup;
    if (!this.props.enableListGroup){
      listGroup=null;
    }
    else {
      listGroup= <CListGroup>
                        <CListGroupItem>ID de proyecto: {this.props.fileInfo['proj_id']}</CListGroupItem>
                        <CListGroupItem>Nombre de proyecto: {this.props.fileInfo['proj_name']}</CListGroupItem>
                        <CListGroupItem>Experimentador: {this.props.fileInfo['proj_experimenter']}</CListGroupItem>
                        <CListGroupItem>Fecha de medicion: {this.props.fileInfo['meas_date']}</CListGroupItem>
                        <CListGroupItem>Numero de canales: {this.props.fileInfo['nchan']}</CListGroupItem>
                        <CListGroupItem>Referencia: {this.props.fileInfo['custom_ref_applied'] ? 'Verdadero' : 'Falso'}</CListGroupItem>
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
                onremovefile={() => this.props.disableListGroupFileInfo()}
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
                    <CButton block color="info">Visualizar</CButton>
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
    enableListGroup: state.dashboardDataPreview.enableListGroupFileInfo,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    getFileInfo: (fileId) => dispatch(getFileInfo(fileId)),
    enableListGroupFileInfo: () => dispatch(enableListGroupFileInfo()),
    disableListGroupFileInfo: () => dispatch(disableListGroupFileInfo())
  
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardDataPreview)