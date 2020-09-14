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
} from '@coreui/react'

import { FilePond, File, registerPlugin } from 'react-filepond'

import 'filepond/dist/filepond.min.css'

// sidebar nav config
import serverConf from './_server'

class DashboardDataPreview extends Component{
  constructor(props){
    super(props);
    this.state={
      files: [],
      info: [],
      listGroupDisable: true
       
    }
    

    this.setFiles=this.setFiles.bind(this);
    this.handlePondFile= this.handlePondFile.bind(this);
    this.setInfo=this.setInfo.bind(this);
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


  fetchFileData(file){
    var url = 'http://127.0.0.1:8000/data/info/?' + new URLSearchParams({
      id: file.id,
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
        listGroupDisable: false
      })
    })
    
  }

  handlePondFile(error,file){
    if (error) {
      console.log('Oh no');
      return;
    }
    console.log('File added', file);
    this.fetchFileData(file)

  }

  render(){
    return (
      <div>
        <cRow>
          <div className="Filepond-Button">
            <FilePond
              ref={ref => this.pond=ref}
              files={this.state.files}
              onupdatefiles={this.setFiles}
              processFile={this.state.files}
              onprocessfile={this.handlePondFile}
              allowMultiple={true}
              maxFiles={3}
              server={serverConf}
              name="filemanager"
              labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            />
          </div>
        </cRow>
        <cRow>
          <CCol sm="12" xl="6">

            <CCard>
              <CCardHeader>
                Estudio
                {/*<div className="card-header-actions"> ACA PODRIA IR EL BOTON DE "EDIT"
                  <a href="https://coreui.github.io/components/listgroup/" rel="noreferrer noopener" target="_blank" className="card-header-action">
                    <small className="text-muted">docs</small>
                  </a>
                </div>*/}
              </CCardHeader>
              <CCardBody>
                <CListGroup>
                  <CListGroupItem>ID de proyecto: {this.state.info['proj_id']}</CListGroupItem>
                  <CListGroupItem>Nombre de proyecto: {this.state.info['proj_name']}</CListGroupItem>
                  <CListGroupItem>Experimentador: {this.state.info['proj_experimenter']}</CListGroupItem>
                  <CListGroupItem>Fecha de medicion: {this.state.info['meas_date']}</CListGroupItem>
                  <CListGroupItem>Numero de canales: {this.state.info['nchan']}</CListGroupItem>
                  <CListGroupItem>Referencia: {this.state.info['custom_ref_applied']}</CListGroupItem>
                </CListGroup>
              </CCardBody>
            </CCard>

          </CCol>
        </cRow>
      </div>
    )
  }
}
  
export default DashboardDataPreview