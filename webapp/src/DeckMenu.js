import React from 'react'
import { connect } from 'react-redux'
import { Link as RouterLink } from 'react-router-dom'
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

function DeckMenuItem({ deck }) {
  const classes = useStyles()

  return (
    <Grid item xs={12} md={6}>
      <ButtonBase
        className={classes.button}
        focusRipple
        component={RouterLink}
        to={`/${deck.ID}`}
      >
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

function DeckMenu({ decks }) {
  return (
    <Grid container spacing={3}>
      {Object.entries(decks || {}).map(([id, deck]) =>
        <DeckMenuItem key={id} deck={deck} />
      )}
    </Grid>
  )
}
const mapStateToProps = state => ({
  decks: state.decks,
})

export default connect(mapStateToProps)(DeckMenu)
