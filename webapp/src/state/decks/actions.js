export const GET_DECKS = 'GET_DECKS'
export const SAVE_CARD = 'SAVE_CARD'
export const DELETE_CARD = 'DELETE_CARD'
export const RESET_CARD = 'RESET_CARD'

export function getDecks() {
  return { type: GET_DECKS }
}

export function saveCardInDeck(deckID, card) {
  return { type: SAVE_CARD, deckID, card }
}

export function deleteCardInDeck(deckID, id) {
  return { type: DELETE_CARD, deckID, id }
}

export function resetCardInDeck(deckID, id) {
  return { type: RESET_CARD, deckID, id }
}
