import React, { Component } from 'react'

import {Line} from 'react-chartjs-2'

import { getStyle } from '@coreui/utils/src';

import {Scatter} from 'react-chartjs-2';

// import Plot from "react-plotly.js";
import Plotly from "plotly.js-basic-dist";

import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

class ChartTemporal extends Component {
    constructor(props){
        super(props);

        this.state= {
            data:{

                    data:[
                        {
                          x: [1, 2, 3],
                          y: [1, 2, 3],
                          type: 'scatter',
                          mode: 'lines+markers',
                          marker: {color: 'red'},
                        },
                    ]

                 }
                    }
                                        }
               

    render() {
        return (<Plot data={this.state.data.data}/>)
             }
}


export default ChartTemporal