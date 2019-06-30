export const GET_DECKS = 'GET_DECKS'

export const GET_CARDS = 'GET_CARDS'

export const SAVE_CARD = 'SAVE_CARD'
export const DELETE_CARD = 'DELETE_CARD'
export const RESET_CARD = 'RESET_CARD'

export function getDecks() {
  return {
    type: GET_DECKS,
    meta: {
      async: true,
      path: '/decks',
      errorFormatter: payload => `Error while getting decks: ${payload.code} ${payload.result}`,
    },
  }
}

export function getCards(deckID) {
  return {
    type: GET_CARDS,
    meta: {
      async: true,
      path: `/decks/${deckID}/cards`,
      deckID,
      errorFormatter: payload => `Error while getting cards: ${payload.code} ${payload.result}`,
    },
  }
}

export function saveCardInDeck(deckID, card) {
  return {
    type: SAVE_CARD,
    card,
    meta: {
      deckID,
    },
  }
}

export function deleteCardInDeck(deckID, id) {
  return {
    type: DELETE_CARD,
    id,
    meta: {
      deckID,
    },
  }
}

export function resetCardInDeck(deckID, id) {
  return {
    type: RESET_CARD,
    id,
    meta: {
      deckID,
    },
  }
}
