import React, { Component } from 'react'
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader,
  FormContainer
} from './index'


const EditLayout = () => {

  return (
    <div className="c-app c-default-layout">
      <TheSidebar/>
      <div className="c-wrapper">
        <TheHeader/>
        <div className="c-body">
          <TheContent/>
          <FormContainer/>
        </div>
        <TheFooter/>
      </div>
    </div>
  )
}

export default EditLayout
