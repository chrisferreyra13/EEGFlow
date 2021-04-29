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


const TheSidebar = ({show, addNode, enableChartTemporal, enableForm, diagramView, linkDiagram}) => {
  const dispatch = useDispatch()
  //const show = useSelector(state => state.sidebarShow)
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  const onClick = (formType=null, nodeType=null) => {
    if(linkDiagram==true){
      if(diagramView==false){
        if(nodeType!=null){
          addNode(nodeType)
        }
        if(formType!=null){
          enableForm('',formType)
        }
      }
    }else{
      if(diagramView==false){
        if(formType!=null){
          enableForm('',formType)
        }
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
            <CDropdownItem onClick={() => onClick('ENABLE_PLOT_TIME_SERIES_FORM','PLOT_TIME_SERIES')} onDragStart={(event) => onDragStart(event, 'PLOT_TIME_SERIES')} draggable>Temporal</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'PLOT_FOURIER')} onDragStart={(event) => onDragStart(event, 'PLOT_FOURIER')} draggable>Fourier</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'PLOT_TIME_FREQUENCY')} onDragStart={(event) => onDragStart(event, 'PLOT_TIME_FREQUENCY')} draggable>Tiempo - Frecuencia</CDropdownItem>
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
            <CDropdownItem onClick={() => onClick('ENABLE_EVENT_FORM','EVENTS')} onDragStart={(event) => onDragStart(event, 'EVENTS')} draggable>Eventos</CDropdownItem>
            <CDropdownItem >Epocas</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'TIME_WINDOW')} onDragStart={(event) => onDragStart(event, 'TIME_WINDOW')} draggable>Ventana Temporal</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'REMOVE')} onDragStart={(event) => onDragStart(event, 'REMOVE')} draggable>Eliminar</CDropdownItem>
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
            <CDropdownItem onClick={() => onClick('ENABLE_FILTER_SELECTOR_FORM','CUSTOM_FILTER')} onDragStart={(event) => onDragStart(event, 'CUSTOM_FILTER')} draggable>Seleccionar frecuencias</CDropdownItem>
            <CDropdownDivider/>
            {/*<CDropdownHeader>Frecuentes</CDropdownHeader>*/}
            {/* ESTO VA EN CDdropdownItem onClick={() => addNode('default')}*/}
            <CDropdownItem onClick={() => onClick(null,'NOTCH')} onDragStart={(event) => onDragStart(event, 'NOTCH')} draggable>Notch</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'BETA')} onDragStart={(event) => onDragStart(event, 'BETA')} draggable>Beta</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'ALPHA')} onDragStart={(event) => onDragStart(event, 'ALPHA')} draggable>Alpha</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'THETA')} onDragStart={(event) => onDragStart(event, 'THETA')} draggable>Theta</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'DELTA')} onDragStart={(event) => onDragStart(event, 'DELTA')} draggable>Delta</CDropdownItem>
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
            <CDropdownItem onClick={() => onClick(null,'ICA')} onDragStart={(event) => onDragStart(event, 'ICA')} draggable>ICA</CDropdownItem>
            <CDropdownItem onClick={() => onClick(null,'MAX_PEAK')} onDragStart={(event) => onDragStart(event, 'MAX_PEAK')} draggable>Pico maximo</CDropdownItem>
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
    linkDiagram: state.editSession.linkDiagram,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    enableChartTemporal: () => dispatch(enableChartTemporal()),
    enableForm: (id,formType) => dispatch(enableForm(id,formType)),
    addNode: (nodeType) => dispatch(addNode(nodeType)),
  
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(TheSidebar))
