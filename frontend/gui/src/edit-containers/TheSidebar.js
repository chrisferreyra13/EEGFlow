import React from 'react'
import { useSelector, useDispatch, connect } from 'react-redux'
import {
  CSidebar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'

import {enableChartTemporal} from '../redux/actions/SideBar'

import CIcon from '@coreui/icons-react'


// sidebar nav config
import navigation from './_nav'

const TheSidebar = ({show, enableChartTemporal}) => {
  const dispatch = useDispatch()
  //const show = useSelector(state => state.sidebarShow)
  return (
    <CSidebar show={show} onShowChange={(val) => dispatch({type: 'set', sidebarShow: val })}>
      <div className="text-center"> {/* Aca antes habia un <td> pero no le gustaba del todo*/}
          <h6>  </h6>
          <h1> Cconsciente. </h1>
      </div>
      {/*<CSidebarNav>

        <CCreateElement
          items={navigation}
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
            CSidebarNavTitle
          }}
        />
        
        </CSidebarNav>*/}
      <CDropdown className="m-1 d-inline-block">
        <CDropdownToggle color="secondary">
          Graficos
        </CDropdownToggle>
          <CDropdownMenu
            placement="bottom"
            modifiers={[{name: 'flip', enabled: false }]}
          >
            <CDropdownItem onClick={()=>enableChartTemporal()}>Temporal</CDropdownItem>
            <CDropdownItem>Fourier</CDropdownItem>
            <CDropdownItem>Tiempo - Frecuencia</CDropdownItem>
            <CDropdownItem disable>Topografico</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
        {/*<CDropdownDivider />*/}
        <CDropdown className="m-1 d-inline-block">
        <CDropdownToggle color="secondary">
          Herramientas
        </CDropdownToggle>
          <CDropdownMenu
            placement="bottom"
            modifiers={[{name: 'flip', enabled: false }]}
          >
            <CDropdownItem disabled>Epocas</CDropdownItem>
            <CDropdownItem>Ventanan Temporal</CDropdownItem>
            <CDropdownItem>Alpha</CDropdownItem>
            <CDropdownItem>Beta</CDropdownItem>
            <CDropdownItem>Theta</CDropdownItem>
            <CDropdownItem>Delta</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

      {/*<CSidebarMinimizer className="c-d-md-down-none"/>*/}
    </CSidebar>
  )
}

const mapStateToProps = (state) => {
  return {
    show:state.changeStateSidebar.sidebarShow,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    enableChartTemporal: () => dispatch(enableChartTemporal()),
  
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(TheSidebar))
