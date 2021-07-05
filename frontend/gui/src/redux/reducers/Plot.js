import {
    UPDATE_PLOT_PARAMS
} from '../actions/Plot'

const initialStateFile={
    psd:null
}

export const plotParams = (state = initialStateFile, { type, ...rest }) => {
    switch (type) {
        case UPDATE_PLOT_PARAMS:
          return Object.assign({}, state, {
              psd:rest.params
          })

        default:
          return state
    }
}