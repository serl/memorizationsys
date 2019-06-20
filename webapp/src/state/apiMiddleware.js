const baseUrl = '/api'

export default store => next => action => {
  const result = next(action)
  if (!action.meta || !action.meta.async) {
    return result
  }

  const { path, method = 'GET', body } = action.meta

  if (!path) {
    throw new Error(`'path' not specified for async action ${action.type}`)
  }

  const headers = {
    'Authorization': `Bearer ${store.getState().users.token}`,
  }

  return fetchWithHTTPErrors(`${baseUrl}${path}`, method, body, headers).then(
    res => handleResponse(res, action, next),
    err => handleErrors(err, action, next),
  )
}

function handleErrors(err, action, next) {
  next({
    type: `${action.type}:FAILED`,
    payload: err,
    meta: action.meta,
  })

  return Promise.reject(err)
}

function handleResponse(res, action, next) {
  next({
    type: `${action.type}:COMPLETED`,
    payload: res,
    meta: action.meta,
  })

  return res
}

const fetchWithHTTPErrors = async (url, method, body, headers = {}) => {
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: method !== 'GET' ? JSON.stringify(body) : null,
  }

  const res = await fetch(url, options)
  if (res.ok) {
    return res.json()
  } else {
    const err = new Error(await res.text())
    err.code = res.status
    throw err
  }
}
