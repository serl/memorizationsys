import React from 'react'
import { Grid, Typography } from '@material-ui/core'
import DeckItem from './Item'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(3),
  },
}))

function Deck({ deck }) {
  const classes = useStyles()

  return (
    <>
      <Typography variant='h2' component='h2' className={classes.title}>
        {deck.Name}
      </Typography>
      <Grid container spacing={3}>
        {(deck.cards || []).map(item =>
          <Grid key={item.ID} item xs={12} md={6}>
            <DeckItem card={item} />
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default Deck
