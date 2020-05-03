import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Grid, Typography } from '@material-ui/core'
import DeckItem from './Item'
import { makeStyles } from '@material-ui/core/styles'
import { getCards, saveCardInDeck, deleteCardInDeck, resetCardInDeck } from '../../state/decks/actions'

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(3),
  },
  more: {
    fontSize: '2rem',
    textAlign: 'center',
    color: theme.palette.grey[600],
  },
}))

function useFrameCounter(limit) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    current < limit &&
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() =>
          setCurrent(cur => cur + 1),
        ),
      )
  }, [current, limit])
  return current
}

function Deck({ deck, getCards, saveCardInDeck, deleteCardInDeck, resetCardInDeck }) {
  useEffect(() => { deck.ID && getCards(deck.ID) }, [getCards, deck.ID])

  const cards = Object.entries(deck.cards || {})

  const cardsPerFrame = 4
  const frame = useFrameCounter(Math.ceil(cards.length / cardsPerFrame))
  const cardsLimit = frame*cardsPerFrame

  const classes = useStyles()
  if (!deck.ID) {
    return null
  }

  const saveCard = card => saveCardInDeck(deck.ID, card)
  const deleteCard = cardID => deleteCardInDeck(deck.ID, cardID)
  const resetCard = cardID => resetCardInDeck(deck.ID, cardID)

  return (
    <>
      <Typography variant='h3' component='h2' className={classes.title}>
        {deck.Name}
      </Typography>
      <Grid container spacing={3}>
        {cards.map(([id, item], i) =>
          i < cardsLimit &&
            <Grid key={id} item xs={12} md={6}>
              <DeckItem card={item} deckID={deck.ID} {...{ saveCard, deleteCard, resetCard }} />
            </Grid>,
        )}
        {(!deck.cards || cardsLimit < cards.length) && <Grid item xs={12} className={classes.more}>&hellip;</Grid>}
      </Grid>
    </>
  )
}

const mapStateToProps = ({ decks }, { deckID }) => ({ // deckId comes from routing
  deck: decks[deckID] || {},
})

export default connect(mapStateToProps, { getCards, saveCardInDeck, deleteCardInDeck, resetCardInDeck })(Deck)
