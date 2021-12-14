export const UPDATE_PLOT_PARAMS='UPDATE_PLOT_PARAMS'
export function updatePlotParams(id,params){
    return {
        type: UPDATE_PLOT_PARAMS,
        id:id,
        params:params
    }
}

export const UPDATE_SAVE_PLOT='UPDATE_SAVE_PLOT'
export function updateSavePlot(nodeId,filename,format){
    return {
        type: UPDATE_SAVE_PLOT,
        nodeId:nodeId,
        filename:filename,
        format:format
    }
}