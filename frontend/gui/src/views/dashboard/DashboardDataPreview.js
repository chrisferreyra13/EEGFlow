import React, { lazy, useState, Component } from 'react'
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

// Server conf
//import serverConf from './_server'



class DashboardDataPreview extends Component{
  constructor(props){
    super(props);
    this.state={
      files: [],
      info: [],
      listGroupEnable: false
       
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
      this.state.files[0].serverId=ids;
    }
    else{
      for(let i=0;i<this.state.files.length;i++){
        this.state.files[i].serverId=ids[i];
      }
    }
  }
  revertFile(error,file){
    console.log('holaaaa') //ESTO NO SE SI AL FINAL SE VA A USAR
  }

  fetchFileData(response){
    this.setFileId(response);
    var url = 'http://127.0.0.1:8000/data/eeg/info/?' + new URLSearchParams({
      id: this.state.files[0].serverId,
    })
    
    var header= new Headers()
    var initFetch={
      method: 'GET',
      headers: header,
      mode: 'cors',
      cache: 'default'
    };

    fetch(url,initFetch).then(res =>{
        return res.json();
    }).then(info =>{
      this.setState({
        info: info,
        listGroupEnable: true
      })
    })
    
  }

  
  render(){
    const serverConf= {
      url: 'http://127.0.0.1:8000/fm',
      process: {
          url: '/process/',
          method: 'POST',
          withCredentials: false,
          onload: (response) => this.fetchFileData(response),
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
    if (!this.state.listGroupEnable){
      listGroup=null;
    }
    else {
      listGroup= <CListGroup>
                        <CListGroupItem>ID de proyecto: {this.state.info['proj_id']}</CListGroupItem>
                        <CListGroupItem>Nombre de proyecto: {this.state.info['proj_name']}</CListGroupItem>
                        <CListGroupItem>Experimentador: {this.state.info['proj_experimenter']}</CListGroupItem>
                        <CListGroupItem>Fecha de medicion: {this.state.info['meas_date']}</CListGroupItem>
                        <CListGroupItem>Numero de canales: {this.state.info['nchan']}</CListGroupItem>
                        <CListGroupItem>Referencia: {this.state.info['custom_ref_applied'] ? 'Verdadero' : 'Falso'}</CListGroupItem>
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
                onremovefile={() => {this.state.listGroupEnable=false}}
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
                { this.state.listGroupEnable ?
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
                {this.state.listGroupEnable ? 
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
  
export default DashboardDataPreview