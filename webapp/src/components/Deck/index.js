import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { connect } from 'react-redux'
import { Grid, Typography, TextField, InputAdornment } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import InfiniteScroll from 'react-infinite-scroller'
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

/**
 * @param {Array} cards
 * @param {string} searchTerms
 */
function filterCards(cards, searchTerms) {
  const terms = searchTerms.trim().toLowerCase().split(/\s+/)
  return cards.filter(([, card]) => {
    const findText = (msg) => terms.some((term) => (msg.c || '').toLowerCase().includes(term))
    return card.Front.some(findText) || card.Back.some(findText)
  })
}

function useDebounce(fn, delay) {
  let timer = null
  return function() {
    const context = this, args = arguments
    clearTimeout(timer)
    timer = setTimeout(function() {
      fn.apply(context, args)
    }, delay)
  }
}

function useDebounceState(initialValue, delay=300) {
  const [value, setValue] = useState(initialValue)
  return [value, useDebounce(setValue, delay)]
}

function Deck({ deck, getCards, saveCardInDeck, deleteCardInDeck, resetCardInDeck }) {
  useEffect(() => { deck.ID && getCards(deck.ID) }, [getCards, deck.ID])

  const [searchTerms, setSearchTerms] = useDebounceState('')
  const handleChangeFilter = (event) => {
    setSearchTerms(event.target.value)
  }

  const cards = useMemo(() => filterCards(Object.entries(deck.cards || {}), searchTerms), [deck, searchTerms])

  const cardsPerBatch = 8
  const [cardsLimit, setCardsLimit] = useState(cardsPerBatch)
  useEffect(() => { setCardsLimit(cardsPerBatch) }, [cards])
  const renderMore = useCallback(
    () => {
      cards && window.requestAnimationFrame(() => {
        setCardsLimit(limit => limit + cardsPerBatch)
      })
    },
    [cards],
  )

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
      </Grid>
      <InfiniteScroll
        loadMore={renderMore}
        hasMore={!deck.cards || cardsLimit < cards.length}
        threshold={500}
        loader={<Grid item xs={12} className={classes.more} key='cardsLoader' onClick={renderMore}>&hellip;</Grid>}
      >
        <Grid container spacing={3}>
          {cards.map(([id, item], i) =>
            i < cardsLimit &&
              <Grid key={id} item xs={12} md={6}>
                <DeckItem card={item} deckID={deck.ID} {...{ saveCard, deleteCard, resetCard }} />
              </Grid>,
          )}
        </Grid>
      </InfiniteScroll>
    </>
  )
}

const mapStateToProps = ({ decks }, { deckID }) => ({ // deckId comes from routing
  deck: decks[deckID] || {},
})

export default connect(mapStateToProps, { getCards, saveCardInDeck, deleteCardInDeck, resetCardInDeck })(Deck)
