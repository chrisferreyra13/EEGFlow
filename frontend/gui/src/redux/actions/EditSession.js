export const CHANGE_VIEW='CHANGE_VIEW'
export function diagramView(activate){
    return{
        type:CHANGE_VIEW,
        activate
    }
}