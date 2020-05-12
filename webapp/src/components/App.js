import React from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { Container } from '@material-ui/core'
import TopMenu from './TopMenu'
import Deck from './Deck'
import DeckMenu from './DeckMenu'

function App({ hasToken }) {
  if (!hasToken && window.botUserName) {
    window.location = `https://t.me/${window.botUserName}?start=web`
    return null
  }

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

const mapStateToProps = ({ users }) => ({
  hasToken: !!users.token,
})

export default connect(mapStateToProps)(App)
