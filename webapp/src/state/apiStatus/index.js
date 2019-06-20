function errorReducer(state = [], action) {
  if (action.type.endsWith(':FAILED')) {
    const error = {
      ...action.payload,
      formatted:
        action.meta.errorFormatter ?
          action.meta.errorFormatter.call(action.meta, action.payload) :
          action.payload.result,
    }
    return [...state, error]
  }
  return state
}

export default function (state = { loading: 0, errors: [] }, action) {
  if (!action.meta || !action.meta.async) {
    return state
  }
  if (action.type.endsWith(':COMPLETED') || action.type.endsWith(':FAILED')) {
    return {
      ...state,
      loading: state.loading - 1,
      errors: errorReducer(state.errors, action),
    }
  }
  return {
    ...state,
    loading: state.loading + 1,
  }
}
