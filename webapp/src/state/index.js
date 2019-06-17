import { createStore, combineReducers } from 'redux'
import decks from './decks'

const store = createStore(
  combineReducers({ decks })
)

export { store }
