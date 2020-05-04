import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { connect } from 'react-redux'
import { Grid, Typography, TextField, InputAdornment } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
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
  const restart = useCallback(() => setCurrent(1), [setCurrent])
  return [current, restart]
}

/**
 * @param {Array} cards
 * @param {string} searchString
 */
function filterCards(cards, searchString) {
  const terms = searchString.trim().toLowerCase().split(/\s+/)
  return cards.filter(([, card]) => {
    const findText = msg => terms.some(term => (msg.c || '').toLowerCase().includes(term))
    return card.Front.some(findText) || card.Back.some(findText)
  })
}

function Deck({ deck, getCards, saveCardInDeck, deleteCardInDeck, resetCardInDeck }) {
  useEffect(() => { deck.ID && getCards(deck.ID) }, [getCards, deck.ID])

  const [filter, setFilter] = useState('')
  const handleChangeFilter = (event) => {
    setFilter(event.target.value)
  }

  const cards = useMemo(() => filterCards(Object.entries(deck.cards || {}), filter.trim()), [deck, filter])

  const cardsPerFrame = 4
  const [frame, restartFrames] = useFrameCounter(Math.ceil(cards.length / cardsPerFrame))
  const cardsLimit = frame*cardsPerFrame
  useEffect(() => { restartFrames() }, [filter, restartFrames])

  const saveCard = useCallback(card => saveCardInDeck(deck.ID, card), [saveCardInDeck, deck])
  const deleteCard = useCallback(cardID => deleteCardInDeck(deck.ID, cardID), [deleteCardInDeck, deck])
  const resetCard = useCallback(cardID => resetCardInDeck(deck.ID, cardID), [resetCardInDeck, deck])

  const classes = useStyles()
  if (!deck.ID) {
    return null
  }

  return (
    <>
      <Typography variant='h3' component='h2' className={classes.title}>
        {deck.Name}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TextField
            value={filter}
            onChange={handleChangeFilter}
            type='search'
            label='Filter'
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
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
