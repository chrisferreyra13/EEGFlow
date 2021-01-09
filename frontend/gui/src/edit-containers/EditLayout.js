import React from 'react'
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader,
  Form
} from './index'


const EditLayout = () => {

  return (
    <div className="c-app c-default-layout">
      <TheSidebar/>
      <div className="c-wrapper">
        <TheHeader/>
        <div className="c-body">
          <TheContent/>
          <Form/>
        </div>
        <TheFooter/>
      </div>
    </div>
  )
}

export default EditLayout
