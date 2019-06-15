import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import { CssBaseline, Container } from '@material-ui/core'
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
      <CssBaseline />
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

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
