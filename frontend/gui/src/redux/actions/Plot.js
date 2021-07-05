export const UPDATE_PLOT_PARAMS='UPDATE_PLOT_PARAMS'
export function updatePlotParams(params){
    return {
        type: UPDATE_PLOT_PARAMS,
        params:params
    }
}