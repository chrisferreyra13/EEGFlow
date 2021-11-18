import {
    UPDATE_PLOT_PARAMS
} from '../actions/Plot'

const initialStatePlot={
    plots:{}
}

export const plotParams = (state = initialStatePlot, { type, ...rest }) => {
    switch (type) {
        case UPDATE_PLOT_PARAMS:
            const id=rest.id
            const params=rest.params
          return Object.assign({}, state, {
            plots:{
              ...state.plots,
              [id]:params
            }
          })

        default:
          return state
    }
}