import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ButtonBase, Typography, Grid, Paper } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  button: {
    textAlign: 'left',
    width: '100%',
  },
  card: {
    padding: theme.spacing(2),
    width: '100%',
  },
}))

function DeckMenuItem({ deck, onClick = () => { } }) {
  const classes = useStyles()

  return (
    <Grid item xs={12} md={6}>
      <ButtonBase className={classes.button} focusRipple onClick={onClick}>
        <Paper className={classes.card}>
          <Typography variant='h5' component='h2'>
            {deck.Name}
          </Typography>
          <Typography color={deck.CardsLeft ? 'textPrimary' : 'textSecondary'}>
            Cards left: {deck.CardsLeft}/{deck.TotalCards}.
          </Typography>
          <Typography color='textSecondary'>
            Rehearsal: {deck.Scheduled ? 'enabled' : 'disabled'}.
          </Typography>
        </Paper>
      </ButtonBase>
    </Grid>
  )
}

function DeckMenu({ decks, setSelectedDeck }) {
  return (
    <Grid container spacing={3}>
      {(decks || []).map(deck =>
        <DeckMenuItem key={deck.ID} deck={deck} onClick={() => setSelectedDeck(deck.ID)} />
      )}
    </Grid>
  )
}

export default DeckMenu
