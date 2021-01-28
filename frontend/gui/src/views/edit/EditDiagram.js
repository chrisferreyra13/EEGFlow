import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  updateEdge,
  Controls,
  Background,
} from 'react-flow-renderer';

import './dnd.css';
import { updateAfterDeleteElements, updateNodePropierties, addNode, addNewEdge, changeEdge} from '../../redux/actions/Diagram'
import { diagramView } from '../../redux/actions/EditSession';




class EditDiagram extends Component{ //= ({stateElements, updateNodePropierties, deleteNodes}) => {
  constructor(props){
    super(props)
    this.props.diagramView(true);
    this.state={
      elements: this.props.stateElements,
      reactFlowInstance: null,
      reactFlowWrapper: React.createRef(null) //useRef(null)
    }
    this.setReactFlowInstance=this.setReactFlowInstance.bind(this)
    this.setElements=this.setElements.bind(this)
    this.onConnect=this.onConnect.bind(this)
    this.onElementsRemove=this.onElementsRemove.bind(this)
    this.onDrop=this.onDrop.bind(this)
    this.onDragOver=this.onDragOver.bind(this)
    this.onLoad=this.onLoad.bind(this)
    this.onEdgeUpdate=this.onEdgeUpdate.bind(this);

    //const reactFlowWrapper = useRef(null);
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
    const newElements=removeElements(elementsToRemove, this.props.stateElements)
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
    this.props.updateNodePropierties(propierties);
    this.setElements([...this.props.stateElements]);
  };

  render(){
    return (
      <div className="dndflow" style={{height:600}}>
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
            >
              <Controls />
              <Background color="#81818a" gap={16} />
            </ReactFlow>
          </div>
          {/*<Sidebar />*/}
        </ReactFlowProvider>
      </div>
    );
  };
}
const mapStateToProps = (state) => {
  return {
    stateElements:state.diagram.elements,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    addNode: (nodeType) => dispatch(addNode(nodeType)),
    addNewEdge: (newElements) => dispatch(addNewEdge(newElements)),
    updateNodePropierties: (propierties)=> dispatch(updateNodePropierties(propierties)),
    updateAfterDeleteElements: (newElements,numOfNodesRemoved) => dispatch(updateAfterDeleteElements(newElements,numOfNodesRemoved)),
    changeEdge: (newElements) => dispatch(changeEdge(newElements)),
    diagramView: (activate) => dispatch(diagramView(activate)),
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(EditDiagram))
