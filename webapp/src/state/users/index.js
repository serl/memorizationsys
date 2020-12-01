export default function (state = {}, action) {
  if (action.payload && action.payload.token) {
    return { ...state, token: action.payload.token }
  }
  if (action.type.endsWith(':FAILED') && action.payload.code === 401 && action.payload.result.startsWith('jwt: ')) {
    return { ...state, token: null }
  }
  return state
}
