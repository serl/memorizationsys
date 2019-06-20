import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import apiMiddleware from './apiMiddleware'
import decks from './decks'
import users from './users'

const middlewares = [
  apiMiddleware,
  thunkMiddleware,
]

if (process.env.NODE_ENV === 'development') {
  const { createLogger } = require('redux-logger')
  middlewares.push(createLogger({
    collapsed: true,
  }))
}

const store = createStore(
  combineReducers({ decks, users }),
  applyMiddleware(...middlewares)
)

export { store }
