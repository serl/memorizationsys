import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker'
import { HashRouter } from 'react-router-dom'
import { CssBaseline } from '@material-ui/core'
import { store } from './state'
import App from './components/App'
import { setToken } from './state/users/actions'
import { getDecks } from './state/decks/actions'

// try to get a token from URL, fallback to localStorage
let token
const tokenRegexp = /\[([\w\W.]+)\]/
const matches = tokenRegexp.exec(window.location.hash)
if (matches) {
  // strip out the token
  window.location.hash = window.location.hash.replace(tokenRegexp, '')
  token = matches[1]
} else {
  token = localStorage.getItem('token')
}
if (token) {
  store.dispatch(setToken(token))
}

store.subscribe(() => {
  // keep the localStorage token up-to-date
  const token = store.getState().users.token
  if (token) {
    localStorage.setItem('token', token)
  }
})

store.dispatch(getDecks())

ReactDOM.render(
  <>
    <CssBaseline />
    <HashRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </HashRouter>
  </>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
