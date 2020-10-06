import React, { Component } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader
} from './index'
import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CSidebarMinimizer,
  CSidebarNavDropdown,
  CSidebarNavItem,
  CButton
}from '@coreui/react'


import navigation from './_nav'

class EditLayout extends Component {
  constructor(props){
    super(props);

    this.dispatch=this.dispatch.bind(this);
    this.useSelectorFunction=this.useSelectorFunction.bind(this);
  }
  dispatch(val){
    useDispatch({type: 'set', sidebarShow: val })
  }
  useSelectorFunction(){
    useSelector(state => state.sidebarShow)
  }

  render(){
    
    return (
      <div className="c-app c-default-layout">
        <CSidebar
        show={this.useSelectorFunction()}
        onShowChange={(val) => useDispatch({type: 'set', sidebarShow: val })}
        >
          <td className="text-center">
                          <h6>  </h6>
                          <h1> Cconsciente. </h1>
                        </td>
          <CSidebarNav>

            <CCreateElement
              items={navigation}
              components={{
                CSidebarNavDivider,
                CSidebarNavDropdown,
                CSidebarNavItem,
                CSidebarNavTitle
              }}
            />
            <CButton color="sidebar">Temporal</CButton>
            
          </CSidebarNav>
        {/*<CSidebarMinimizer className="c-d-md-down-none"/>*/}
      </CSidebar>

        <div className="c-wrapper">
          <TheHeader/>
          <div className="c-body">
            <TheContent/>
          </div>
          <TheFooter/>
        </div>
      </div>
    )
  }
}

export default EditLayout
