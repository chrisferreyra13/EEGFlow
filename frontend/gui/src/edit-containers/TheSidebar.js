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
            placement="right-start"
            modifiers={[{name: 'flip', enabled: false }]}
          >
            <CDropdownItem onClick={()=>enableChartTemporal()}>Temporal</CDropdownItem>
            <CDropdownItem>Fourier</CDropdownItem>
            <CDropdownItem>Tiempo - Frecuencia</CDropdownItem>
            <CDropdownItem disable>Topografico</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

        <CDropdown className="m-1 d-inline-block">
        <CDropdownToggle color="secondary">
          Herramientas
        </CDropdownToggle>
          <CDropdownMenu
            placement="right-start"
            modifiers={[{name: 'flip', enabled: false }]}
          >
            <CDropdownItem>Seleccionar</CDropdownItem>
            <CDropdownItem>Eventos</CDropdownItem>
            <CDropdownItem>Epocas</CDropdownItem>
            <CDropdownItem>Ventana Temporal</CDropdownItem>
            <CDropdownItem>Eliminar</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

        <CDropdown className="m-1 d-inline-block">
        <CDropdownToggle color="secondary">
          Filtros
        </CDropdownToggle>
          <CDropdownMenu
            placement="right-start"
            modifiers={[{name: 'flip', enabled: false }]}
          >
            <CDropdownItem>Seleccionar frecuencias</CDropdownItem>
            <CDropdownDivider/>
            {/*<CDropdownHeader>Frecuentes</CDropdownHeader>*/}
            <CDropdownItem>Beta</CDropdownItem>
            <CDropdownItem>Alpha</CDropdownItem>
            <CDropdownItem>Theta</CDropdownItem>
            <CDropdownItem>Delta</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

        <CDropdown className="m-1 d-inline-block">
        <CDropdownToggle color="secondary">
          Metodos
        </CDropdownToggle>
          <CDropdownMenu
            placement="right-start"
            modifiers={[{name: 'flip', enabled: false }]}
          >
            <CDropdownItem>Buscar</CDropdownItem>
            <CDropdownDivider/>
            {/*<CDropdownHeader>Frecuentes</CDropdownHeader>*/}
            <CDropdownItem>ICA</CDropdownItem>
            <CDropdownItem>Pico maximo</CDropdownItem>
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
