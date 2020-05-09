import * as types from './actions'

function arrayToObject(arr = []) {
  const obj = {}
  for (const item of arr) {
    obj[item.ID] = item
  }
  return obj
}

function deckReducer(state = {}, action) {
  switch (action.type) {
    case `${types.GET_CARDS}:COMPLETED`:
      const now = (new Date()).toISOString()
      let rehearsing = 0
      const rawCards = action.payload.data.map(card => {
        card.Rehearsing = card.NextRepetition < now
        if (card.Rehearsing) {
          rehearsing++
        }
        return card
      })
      return { ...state, cards: arrayToObject(rawCards), TotalCards: rawCards.length, CardsLeft: rehearsing }
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
    case `${types.GET_DECKS}:COMPLETED`:
      return arrayToObject(action.payload.data)
    case `${types.GET_CARDS}:COMPLETED`:
    case types.SAVE_CARD:
    case types.DELETE_CARD:
    case types.RESET_CARD:
      const deckID = action.meta.deckID
      return { ...state, [deckID]: deckReducer(state[deckID], action) }
    default:
      return state
  }
}
