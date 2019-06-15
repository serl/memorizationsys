import React, { useState } from 'react'
import { Typography, CardContent, CardActions, Button } from '@material-ui/core'
import FlippingCard from '../FlippingCard'
import { DateOnly, DateTime } from '../DateTimeFormatter'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  message: {
    letterSpacing: 0, // otherwise emoji flags are broken
  },
})

function CardSide({ side }) {
  const classes = useStyles()

  return (
    <CardContent>
      {side.map((message, i) =>
        <Typography
          key={i}
          color={message.t === 0 ? 'textPrimary' : 'textSecondary'}
          variant='h4'
          component='h3'
          className={classes.message}
        >
          {message.c || 'message type not supported'}
        </Typography>
      )}
    </CardContent>
  )
}


function CardCommon({ card, flipLabel, flipHandler }) {
  return (
    <>
      <CardContent>
        <Typography>Easiness factor: {card.EasinessFactor}</Typography>
        <Typography>Current interval: {card.PreviousInterval}d</Typography>
        <Typography>Next repetition: <DateOnly date={card.NextRepetition} /></Typography>      <Typography>Created: <DateTime date={card.CreatedAt} /></Typography>
        <Typography>Last updated: <DateTime date={card.UpdatedAt} /></Typography>
      </CardContent>
      <CardActions>
        <Button variant='outlined' onClick={flipHandler}>{flipLabel}</Button>
        <Button variant='outlined' color='secondary'>Reset</Button>
      </CardActions>
    </>
  )
}

function DeckItem({ card }) {
  const [flipped, setFlipped] = useState(false)

  const front = (
    <>
      <CardSide side={card.Front} />
      <CardCommon card={card} flipLabel='Show back' flipHandler={() => setFlipped(true)} />
    </>
  )

  const back = (
    <>
      <CardSide side={card.Back} />
      <CardCommon card={card} flipLabel='Show front' flipHandler={() => setFlipped(false)} />
    </>
  )

  return (
    <FlippingCard {...{ flipped, front, back }} />
  )
}

export default DeckItem
