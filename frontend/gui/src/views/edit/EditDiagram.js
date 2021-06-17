import React, { Component } from 'react';
import throttle from 'lodash.throttle';
import { connect } from 'react-redux';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  updateEdge,
  Controls,
  Background,
} from 'react-flow-renderer';
import {
  CButton,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import './dnd.css';
import { updateAfterDeleteElements, updateNodePropierties, addNode, addNewEdge, changeEdge, runProcess, cancelProcess} from '../../redux/actions/Diagram'
import { diagramView, linkDiagram } from '../../redux/actions/EditSession';
import { enableForm } from '../../redux/actions/Form'
import {getFileInfo} from '../../redux/actions/File'

class EditDiagram extends Component{
  constructor(props){
    super(props)
    this.props.diagramView(true);

    //Ver si lo dejamos en el futuro, para hacer pruebas es util
    if(this.props.fileInfo.channels.length==0){
      this.props.getFileInfo(this.props.fileId)
    }
    
    this.state={
      contentHeight:Math.floor(window.innerHeight*0.75),
      elements: purge(this.props.elements),
      reactFlowInstance: null,
      reactFlowWrapper: React.createRef(null) //useRef(null)
    }
    this.setReactFlowInstance=this.setReactFlowInstance.bind(this)
    this.setElements=this.setElements.bind(this)
    this.onElementClick=this.onElementClick.bind(this)
    this.onConnect=this.onConnect.bind(this)
    this.onElementsRemove=this.onElementsRemove.bind(this)
    this.onDrop=this.onDrop.bind(this)
    this.onDragOver=this.onDragOver.bind(this)
    this.onLoad=this.onLoad.bind(this)
    this.onEdgeUpdate=this.onEdgeUpdate.bind(this)
    this.throttleHandleWindowResize=this.throttleHandleWindowResize.bind(this)
    this.runButton=this.runButton.bind(this)
    this.cancelButton=this.cancelButton.bind(this)
    this.onNodeMoved=this.onNodeMoved.bind(this)

    //const reactFlowWrapper = useRef(null);
  }
  throttleHandleWindowResize = () => {
    return throttle(() => {
      this.setState({
        contentHeight: Math.floor(window.innerHeight*0.70)
      })
    },200);
  }
  componentDidMount(){
    window.addEventListener('resize',this.throttleHandleWindowResize());
  }
  componentWillUnmount(){
    window.removeEventListener('resize',this.throttleHandleWindowResize());
  }
  runButton(){
    this.props.runProcess(this.props.elements)
    
  }
  cancelButton(){
    this.props.cancelProcess()
  }
  setReactFlowInstance(_reactFlowInstance){
    this.setState({
      reactFlowInstance:_reactFlowInstance
    })
  }
  setElements(newElements){
    this.setState({
      elements:newElements
    })
  }
  onConnect(params){
    params.animated=true;
    params.arrowHeadType='arrowclosed'
    params.style={stroke:'blue'}
    const newElements=addEdge(params, this.state.elements)
    this.props.addNewEdge(newElements)
    this.setElements(newElements)
  }
  onEdgeUpdate(oldEdge, newConnection){
      const newElements=updateEdge(oldEdge, newConnection, this.state.elements)
      this.props.changeEdge(newElements);
      this.setElements(newElements);
  }
  onElementsRemove(elementsToRemove){
    const newElements=removeElements(elementsToRemove, this.state.elements)
    this.props.updateAfterDeleteElements(newElements, elementsToRemove.length)
    this.setElements(newElements)
  }

  onLoad(_reactFlowInstance){
    this.setReactFlowInstance(_reactFlowInstance)
  }
  onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
  };
  onDrop(event){
    event.preventDefault();
    const reactFlowBounds = this.state.reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = this.state.reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const propierties = {
      position,
    };
    this.props.addNode(type)
    this.props.updateNodePropierties('',propierties);
    this.setElements([...purge(this.props.elements)]);
  };
  onElementClick(event,element){
    if (event.detail===2){
      const elem=this.props.elements.find(el => el.id===element.id);
      if(elem.formType!=undefined){
        this.props.enableForm(elem.id,elem.formType)
      }
    }
  };
  onNodeMoved(event, node){
    event.preventDefault();
    this.props.updateNodePropierties(node.id,{'position':node.position});
    //this.setElements([...this.props.elements]);
  }

  render(){
    return (
      <div>
        <CRow className="dndflow" style={{height:this.state.contentHeight}}>
          <ReactFlowProvider>
            <div className="reactflow-wrapper" ref={this.state.reactFlowWrapper}>
              <ReactFlow
                elements={this.state.elements}
                onConnect={(params) => this.onConnect(params)}
                onEdgeUpdate={(oldEdge, newConnection) => this.onEdgeUpdate(oldEdge, newConnection)}
                onElementsRemove={(elementsToRemove) => this.onElementsRemove(elementsToRemove)}
                onLoad={(_reactFlowInstance) => this.onLoad(_reactFlowInstance)}
                onDrop={(event) => this.onDrop(event)}
                onDragOver={(event) => this.onDragOver(event)}
                onElementClick={(event,element) => this.onElementClick(event,element)}
                onNodeDragStop={(event, node) => this.onNodeMoved(event, node)}
              >
                <Controls />
                <Background color="#81818a" gap={16} />
              </ReactFlow>
            </div>
            {/*<Sidebar />*/}
          </ReactFlowProvider>
        </CRow>
        <CRow>
          <CCol xs="4" md="4">
            <CButton size="md" color="primary" onClick={this.props.linkDiagram}><CIcon name="cil-asterisk"/></CButton>
            <CButton size="md" color="info" onClick={this.runButton}><CIcon name="cil-chevron-right"/></CButton>
            <CButton size="md" color="danger" onClick={this.cancelButton}><CIcon name="cil-x-circle"/></CButton>
          </CCol>
        </CRow>
      </div>
    );
  };
}

function purge(elements){
  return elements.map((item) => {
    if (item.signalsData == undefined){return item}
      return {
        ...item,
        signalsData:[]
      }
})
}


const mapStateToProps = (state) => {
  return {
    fileInfo:state.file.fileInfo,
    fileId: state.file.fileId,
    elements:state.diagram.elements,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    addNode: (nodeType) => dispatch(addNode(nodeType)),
    addNewEdge: (newElements) => dispatch(addNewEdge(newElements)),
    updateNodePropierties: (id,propierties)=> dispatch(updateNodePropierties(id,propierties)),
    updateAfterDeleteElements: (newElements,numOfNodesRemoved) => dispatch(updateAfterDeleteElements(newElements,numOfNodesRemoved)),
    changeEdge: (newElements) => dispatch(changeEdge(newElements)),
    diagramView: (activate) => dispatch(diagramView(activate)),
    enableForm: (id,formType) => dispatch(enableForm(id,formType)),
    runProcess: (elements) => dispatch(runProcess(elements)),
    cancelProcess: () => dispatch(cancelProcess()),
    linkDiagram: () => dispatch(linkDiagram()),
    getFileInfo: (fileId) => dispatch(getFileInfo(fileId)),
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(EditDiagram))
