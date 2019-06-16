import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Container } from '@material-ui/core'
import TopMenu from './TopMenu'
import Deck from './Deck'
import DeckMenu from './DeckMenu'
import decks from './data'

function findDeck(decks, deckID) {
  const intDeckID = parseInt(deckID, 10)
  return (decks || []).filter(d => d.ID === intDeckID)[0]
}

function App() {
  return (
    <>
      <TopMenu />
      <Container maxWidth='md'>
        <Switch>
          <Route
            path='/:deckID'
            render={({ match }) =>
              <Deck deck={findDeck(decks, match.params.deckID)} />
            }
          />
          <Route
            path='/'
            render={() =>
              <DeckMenu {...{ decks }} />
            }
          />
        </Switch>
      </Container>
    </>
  )
}

export default App
