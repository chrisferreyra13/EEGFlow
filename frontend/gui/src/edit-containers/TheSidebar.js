import React from 'react'
import { useSelector, useDispatch, connect } from 'react-redux'
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
} from '@coreui/react'

import CIcon from '@coreui/icons-react'

// sidebar nav config
import navigation from './_nav'

const TheSidebar = ({show}) => {
  const dispatch = useDispatch()
  //const show = useSelector(state => state.sidebarShow)
  console.log(show)
  return (
    <CSidebar show={show} onShowChange={(val) => dispatch({type: 'set', sidebarShow: val })}>
      <div className="text-center"> {/* Aca antes habia un <td> pero no le gustaba del todo*/}
          <h6>  </h6>
          <h1> Cconsciente. </h1>
      </div>
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
  )
}

const mapStateToProps = (state) => {
  return {
    show:state.changeStateSidebar.sidebarShow,
  };
}

export default React.memo(connect(mapStateToProps)(TheSidebar))
