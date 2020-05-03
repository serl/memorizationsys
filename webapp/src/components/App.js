import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Container } from '@material-ui/core'
import TopMenu from './TopMenu'
import Deck from './Deck'
import DeckMenu from './DeckMenu'

function App() {
  return (
    <>
      <TopMenu />
      <Container maxWidth='md'>
        <Switch>
          <Route
            path='/:deckID'
            render={({ match }) => <Deck deckID={match.params.deckID} />}
          />
          <Route
            path='/'
            component={DeckMenu}
          />
        </Switch>
      </Container>
    </>
  )
}

export default App
