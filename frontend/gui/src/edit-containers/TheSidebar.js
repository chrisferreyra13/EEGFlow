import React from 'react'
import { useDispatch, connect } from 'react-redux'
import {
  CSidebar,
  CDropdown,
  CDropdownDivider,
 // CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'

import { enableChartTemporal } from '../redux/actions/SideBar'
import { enableEventForm } from '../redux/actions/Form'
import { addNode } from '../redux/actions/Diagram'

//import CIcon from '@coreui/icons-react'


const TheSidebar = ({show, addNode, enableChartTemporal, enableEventForm}) => {
  const dispatch = useDispatch()
  //const show = useSelector(state => state.sidebarShow)
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    addNode('default')
  };
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
            <CDropdownItem disable="true">Topografico</CDropdownItem>
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
            <CDropdownItem onClick={()=>enableEventForm()}>Eventos</CDropdownItem>
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
            <CDropdownItem onClick={() => addNode('default')} onDragStart={(event) => onDragStart(event, 'default')} draggable>Beta</CDropdownItem>
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
    enableEventForm: () => dispatch(enableEventForm()),
    addNode: (nodeType) => dispatch(addNode(nodeType)),
  
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(TheSidebar))
