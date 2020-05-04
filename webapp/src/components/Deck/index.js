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

function Deck({ deck, getCards, saveCardInDeck, deleteCardInDeck, resetCardInDeck }) {
  useEffect(() => { deck.ID && getCards(deck.ID) }, [getCards, deck.ID])

  const [searchTerms, setSearchTerms] = useState('')
  const handleChangeFilter = (event) => {
    setSearchTerms(event.target.value)
  }

  const cards = useMemo(() => filterCards(Object.entries(deck.cards || {}), searchTerms), [deck, searchTerms])

  const cardsPerBatch = 6
  const [cardsLimit, setCardsLimit] = useState(cardsPerBatch)
  useEffect(() => { setCardsLimit(cardsPerBatch) }, [cards])
  const renderMore = () => setCardsLimit(limit => limit + cardsPerBatch)

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
            value={searchTerms}
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
        {(!deck.cards || cardsLimit < cards.length) && <Grid item xs={12} className={classes.more} onClick={renderMore}>&hellip;</Grid>}
      </Grid>
    </>
  )
}

const mapStateToProps = ({ decks }, { deckID }) => ({ // deckId comes from routing
  deck: decks[deckID] || {},
})

export default connect(mapStateToProps, { getCards, saveCardInDeck, deleteCardInDeck, resetCardInDeck })(Deck)
