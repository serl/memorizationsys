import React, { useState } from 'react'
import { Container } from '@material-ui/core'
import TopMenu from './TopMenu'
import Deck from './Deck'
import DeckMenu from './DeckMenu'
import decks from './data'

function useSelectedDeck(decks) {
  const [selectedDeckId, setSelectedDeck] = useState()
  const selectedDeck = (decks || []).filter(d => d.ID === selectedDeckId)[0]
  return [selectedDeck, setSelectedDeck]
}

function App() {
  const [selectedDeck, setSelectedDeck] = useSelectedDeck(decks)

  return (
    <>
      <TopMenu setSelectedDeck={setSelectedDeck} />
      <Container maxWidth='md'>
        {selectedDeck ?
          <Deck deck={selectedDeck} />
          :
          <DeckMenu {...{ decks, setSelectedDeck }} />
        }
      </Container>
    </>
  )
}

export default App
