export const UPDATE_PLOT_PARAMS='UPDATE_PLOT_PARAMS'
export function updatePlotParams(id,params){
    return {
        type: UPDATE_PLOT_PARAMS,
        id:id,
        params:params
    }
}