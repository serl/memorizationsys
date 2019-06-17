import * as types from './actions'
import decksData from '../../data'

function arrayToObject(arr = []) {
  const obj = {}
  for (const item of arr) {
    obj[item.ID] = item
  }
  return obj
}

function deckReducer(state = {}, action) {
  switch (action.type) {
    case types.SAVE_CARD:
      return { ...state, cards: { ...state.cards, [action.card.ID]: action.card } }
    case types.DELETE_CARD:
      const cards = { ...state.cards }
      delete cards[action.id]
      return { ...state, cards }
    case types.RESET_CARD:
      return state
    default:
      return state
  }
}

export default function (state = {}, action) {
  switch (action.type) {
    case types.GET_DECKS:
      if (Object.keys(state).length) {
        return state
      } else {
        return arrayToObject(decksData.map(deck => ({ ...deck, cards: arrayToObject(deck.cards) })))
      }
    case types.SAVE_CARD:
    case types.DELETE_CARD:
    case types.RESET_CARD:
      return { ...state, [action.deckID]: deckReducer(state[action.deckID], action) }
    default:
      return state
  }
}
