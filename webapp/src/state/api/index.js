
export default function (state = { loading: 0 }, action) {
  if (!action.meta || !action.meta.async) {
    return state
  }
  if (action.type.endsWith(':COMPLETED') || action.type.endsWith(':FAILED')) {
    return { ...state, loading: state.loading - 1 }
  }
  return { ...state, loading: state.loading + 1 }
}
