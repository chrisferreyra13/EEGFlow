import {
    UPDATE_PLOT_PARAMS,
    UPDATE_SAVE_PLOT,
} from '../actions/Plot'

const initialStatePlot={
    plots:{},
    savePlot:{
      id:null,
      save:false,
      filename:null,
      format:null
    },
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
        
        case UPDATE_SAVE_PLOT:
          return Object.assign({}, state, {
            savePlot:{
              id:rest.nodeId,
              save:!state.savePlot.save,
              filename:rest.filename,
              format:rest.format
            }
          })

        default:
          return state
    }
}