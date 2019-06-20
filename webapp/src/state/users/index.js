export default function (state = {}, action) {
  if (action.payload && action.payload.token) {
    return { ...state, token: action.payload.token }
  }
  return state
}
