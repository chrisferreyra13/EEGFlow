const initialState = {
    sidebarShow: 'responsive'
}

export const changeStateSidebar = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return {...state, ...rest }
    default:
      return state
  }
}
