import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  Background,
} from 'react-flow-renderer';

import './dnd.css';
import { deleteNodes, updateNodePropierties } from '../../redux/actions/Diagram'



const EditDiagram = ({stateElements, updateNodePropierties}) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState(stateElements);
  const onConnect = (params) => setElements((els) => addEdge(params, els));
  const onElementsRemove = (elementsToRemove) => {
    //const newNodes = (els) => removeElements(elementsToRemove, els)
    deleteNodes(elementsToRemove.map(node => node.id))
    console.log(stateElements)
    setElements(stateElements);
  }
  const onLoad = (_reactFlowInstance) =>
    setReactFlowInstance(_reactFlowInstance);
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const propierties = {
      position,
    };
    
    //setElements((es) => es.concat(newNode));
    updateNodePropierties(propierties);
    setElements((es) => es.concat(stateElements.lastItem));
  };
  return (
    <div className="dndflow" style={{height:600}}>
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            elements={elements}
            onConnect={onConnect}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
        {/*<Sidebar />*/}
      </ReactFlowProvider>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    stateElements:state.diagram.elements,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateNodePropierties: (propierties)=> dispatch(updateNodePropierties(propierties)),
    deleteNodes: (nodesIds) => dispatch(deleteNodes(nodesIds)),
  
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(EditDiagram))
