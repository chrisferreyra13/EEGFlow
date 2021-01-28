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
import { enableForm } from '../redux/actions/Form'
import { addNode } from '../redux/actions/Diagram'

//import CIcon from '@coreui/icons-react'


const TheSidebar = ({show, addNode, enableChartTemporal, enableForm, diagramView}) => {
  const dispatch = useDispatch()
  //const show = useSelector(state => state.sidebarShow)
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  const onClick = (formType=null, nodeType=null) => {
    if(diagramView==false){
      if(nodeType!=null){
        addNode(nodeType)
      }
      if(formType!=null){
        enableForm(formType)
      }
    }
  }

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
            <CDropdownItem onClick={() => onClick(null,'plot fourier')} onDragStart={(event) => onDragStart(event, 'plot fourier')} draggable>Fourier</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'plot time - frequency')} onDragStart={(event) => onDragStart(event, 'plot time - frequency')} draggable>Tiempo - Frecuencia</CDropdownItem>
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
            <CDropdownItem onClick={() => onClick('ENABLE_EVENT_FORM',null)}>Eventos</CDropdownItem>
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
            <CDropdownItem onClick={() => onClick(null,'custom filter')} onDragStart={(event) => onDragStart(event, 'custom filter')} draggable>Seleccionar frecuencias</CDropdownItem>
            <CDropdownDivider/>
            {/*<CDropdownHeader>Frecuentes</CDropdownHeader>*/}
            {/* ESTO VA EN CDdropdownItem onClick={() => addNode('default')}*/}
            <CDropdownItem onClick={() => onClick(null,'beta')} onDragStart={(event) => onDragStart(event, 'beta')} draggable>Beta</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'alpha')} onDragStart={(event) => onDragStart(event, 'alpha')} draggable>Alpha</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'theta')} onDragStart={(event) => onDragStart(event, 'theta')} draggable>Theta</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'delta')} onDragStart={(event) => onDragStart(event, 'delta')} draggable>Delta</CDropdownItem>
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
            <CDropdownItem onClick={() => onClick(null,'ica')} onDragStart={(event) => onDragStart(event, 'ica')} draggable>ICA</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'max peak')} onDragStart={(event) => onDragStart(event, 'max peak')} draggable>Pico maximo</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>

      {/*<CSidebarMinimizer className="c-d-md-down-none"/>*/}
    </CSidebar>
  )
}

const mapStateToProps = (state) => {
  return {
    show:state.changeStateSidebar.sidebarShow,
    diagramView: state.editSession.diagramView,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    enableChartTemporal: () => dispatch(enableChartTemporal()),
    enableForm: (formType) => dispatch(enableForm(formType)),
    addNode: (nodeType) => dispatch(addNode(nodeType)),
  
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(TheSidebar))
