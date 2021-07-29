import {
    UPDATE_PLOT_PARAMS
} from '../actions/Plot'

const initialStatePlot={
    plots:{}
}

export const plotParams = (state = initialStatePlot, { type, ...rest }) => {
    let plots={};
    switch (type) {
        case UPDATE_PLOT_PARAMS:
            plots={}
            plots[rest.id]=rest.params
          return Object.assign({}, state, {
            plots:plots
          })

        default:
          return state
    }
}