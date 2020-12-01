export const GET_DECKS = 'GET_DECKS'

export const GET_CARDS = 'GET_CARDS'

export const SAVE_CARD = 'SAVE_CARD'
export const DELETE_CARD = 'DELETE_CARD'

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
    meta: {
      async: true,
      method: 'POST',
      path: `/decks/${deckID}/cards/${card.ID}`,
      body: card,
      deckID,
      cardID: card.ID,
      errorFormatter: payload => `Error while saving card ${card.Front[0].c}: ${payload.code} ${payload.result}`,
    },
  }
}

export function deleteCardInDeck(deckID, card) {
  return {
    type: DELETE_CARD,
    meta: {
      async: true,
      method: 'DELETE',
      path: `/decks/${deckID}/cards/${card.ID}`,
      deckID,
      cardID: card.ID,
      errorFormatter: payload => `Error while deleting card ${card.Front[0].c}: ${payload.code} ${payload.result}`,
    },
  }
}

export function resetCardInDeck(deckID, card) {
  return saveCardInDeck(
    deckID,
    {
      ...card,
      EasinessFactor: 250,
      PreviousInterval: 0,
      Repetition: 1,
      NextRepetition: new Date(),
    },
  )
}
