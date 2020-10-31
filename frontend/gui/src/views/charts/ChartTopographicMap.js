import React, { Component } from 'react'

import {Line} from 'react-chartjs-2'

class ChartTopographicMap extends Component {
    constructor(props){
        super(props);

        this.state={
            data:{
                labels: [1,2,3,4,5,6,7],
                datasets: [
                    {
                        label: 'C4',
                        strokeColor: 'rgba(220,220,220,1)',
                        pointColor: 'rgba(220,220,220,1)',
                        pointStrokeColor: '#fff',
                        pointHighlightFill: '#fff',
                        pointHighlightStroke: 'rgba(220,220,220,1)',
                        data: this.props.signals['signal'],
                    },
                ]
            }
        }
    }

    render() {
        return (
            <div>
                <Line data={this.state.data}/>
            </div>
        )
    }
}

export default ChartTopographicMap