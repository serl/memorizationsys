import React, { useState } from 'react'
import { Typography, CardContent, CardActions, Button } from '@material-ui/core'
import FlippingCard from '../FlippingCard'

function CardSide({ side }) {
  return (
    side.map((message, i) =>
      <Typography key={i} color={message.t === 0 ? 'textPrimary' : 'textSecondary'} variant='h5'>
        {message.c || 'message type not supported'}
      </Typography>
    )
  )
}

function useToggle(initial) {
  const [flipped, setFlipped] = useState(initial)
  return [flipped, () => setFlipped(!flipped)]
}

function DeckItem({ card }) {
  const [flipped, toggleFlip] = useToggle(false)

  const cardActions = (
    <CardActions>
      <Button variant='outlined' onClick={toggleFlip}>Flip</Button>
      <Button variant='outlined' color='secondary'>Reset</Button>
    </CardActions>
  )

  const front = (
    <>
      <CardContent>
        <CardSide side={card.Front} />
      </CardContent>
      <CardContent>
        <Typography>Next repetition: {card.NextRepetition}</Typography>
        <Typography>Created: {card.CreatedAt}</Typography>
        <Typography>Last updated: {card.UpdatedAt}</Typography>
      </CardContent>
      {cardActions}
    </>
  )

  const back = (
    <>
      <CardContent>
        <CardSide side={card.Back} />
      </CardContent>
      {cardActions}
    </>
  )

  return (
    <FlippingCard {...{ flipped, front, back }} />
  )
}

export default DeckItem
