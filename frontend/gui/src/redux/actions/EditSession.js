export const CHANGE_VIEW='CHANGE_VIEW'
export function diagramView(activate){
    return{
        type:CHANGE_VIEW,
        activate
    }
}

export const LINK_DIAGRAM='LINK_DIAGRAM'
export function linkDiagram(){
    return{
        type:LINK_DIAGRAM,
    }
}