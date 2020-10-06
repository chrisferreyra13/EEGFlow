import { getStyle } from '@coreui/utils/src';
import React from 'react';
import {Scatter} from 'react-chartjs-2';

// import Plot from "react-plotly.js";
import Plotly from "plotly.js-basic-dist";

import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);



class ChartBarSimple extends React.Component { 
  render() {
  return (
    <Plot
      data={[
        {
          x: [1, 2, 3],
          y: [1, 2, 3],
          type: 'scatter',
          mode: 'lines+markers',
          marker: {color: 'red'},
        },
            ]}
  
    />
  );
}
}
export default ChartBarSimple
;