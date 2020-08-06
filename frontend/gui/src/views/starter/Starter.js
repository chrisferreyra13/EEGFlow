import React, { lazy, useState } from 'react'
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


function Starter() {
  
  const [upload, setUpload]=useState();

  const newEEG = () => {
    const uploadData= new FormData();
    uploadData.append('upload',upload, upload.name);
    
    fetch('http://127.0.0.1:8000/data/eeg/',{
      method:'POST',
      body:uploadData
    })
    .then(res => console.log(res))
    .catch(error => console.log(error))
  }

  return (
    <>
      <div className="Starter">
        <h3>Upload EEG</h3>
        <label>
          File
          <input type="file" onChange={(evt)=>setUpload(evt.target.files[0])}/>
        </label>
        <br/>
        <button onClick={()=>newEEG()}>Upload</button>
      </div>
    </>
  )
}
  
export default Starter