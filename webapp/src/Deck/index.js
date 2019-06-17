import React from 'react'
import { connect } from 'react-redux'
import { Grid, Typography } from '@material-ui/core'
import DeckItem from './Item'
import { makeStyles } from '@material-ui/core/styles'
import { saveCardInDeck, deleteCardInDeck, resetCardInDeck } from '../state/decks/actions'

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(3),
  },
}))

function Deck({ deck, saveCardInDeck, deleteCardInDeck, resetCardInDeck }) {
  const classes = useStyles()

  const saveCard = card => saveCardInDeck(deck.ID, card)
  const deleteCard = cardID => deleteCardInDeck(deck.ID, cardID)
  const resetCard = cardID => resetCardInDeck(deck.ID, cardID)

  return (
    <>
      <Typography variant='h3' component='h2' className={classes.title}>
        {deck.Name}
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(deck.cards || {}).map(([id, item]) =>
          <Grid key={id} item xs={12} md={6}>
            <DeckItem card={item} deckID={deck.ID} {...{ saveCard, deleteCard, resetCard }} />
          </Grid>
        )}
      </Grid>
    </>
  )
}

const mapStateToProps = (state, { match }) => ({ // match comes from routing
  deck: state.decks[match.params.deckID],
})

export default connect(mapStateToProps, { saveCardInDeck, deleteCardInDeck, resetCardInDeck })(Deck)
