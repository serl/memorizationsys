import * as types from './actions'

function arrayToObject(arr = []) {
  const obj = {}
  for (const item of arr) {
    obj[item.ID] = item
  }
  return obj
}

function bakeCard(card) {
  card.Rehearsing = card.NextRepetition < (new Date()).toISOString()
  return card
}

function deckReducer(state = {}, action) {
  switch (action.type) {
    case `${types.GET_CARDS}:COMPLETED`:
      const rawCards = action.payload.data.map(bakeCard)
      return {
        ...state,
        cards: arrayToObject(rawCards),
        TotalCards: rawCards.length,
        CardsLeft: rawCards.filter(c => c.Rehearsing).length,
      }
    case `${types.SAVE_CARD}:COMPLETED`:
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.meta.cardID]: bakeCard(action.payload.data),
        },
      }
    case types.DELETE_CARD:
      const cards = { ...state.cards }
      delete cards[action.id]
      return { ...state, cards }
    default:
      return state
  }
}

export default function (state = {}, action) {
  switch (action.type) {
    case `${types.GET_DECKS}:COMPLETED`:
      return arrayToObject(action.payload.data)
    case `${types.GET_CARDS}:COMPLETED`:
    case `${types.SAVE_CARD}:COMPLETED`:
    case types.DELETE_CARD:
      const deckID = action.meta.deckID
      return { ...state, [deckID]: deckReducer(state[deckID], action) }
    default:
      return state
  }
}
