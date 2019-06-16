import React, { useState } from 'react'
import { Typography, CardContent, CardHeader, CardActions, Button, Tooltip } from '@material-ui/core'
import FlippingCard from '../FlippingCard'
import PopupMenu from '../PopupMenu'
import { DateOnly, DateTime } from '../DateTimeFormatter'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  message: {
    letterSpacing: 0, // otherwise emoji flags are broken
  },
  bullet: {
    display: 'inline-block',
    margin: '0 .5em',
    transform: 'scale(0.8)',
  },
  saveButton: {
    marginLeft: 'auto',
  },
})

function CardSide({ content }) {
  const classes = useStyles()

  return (
    <CardContent>
      {content.map((message, i) =>
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

function CardHead({ card }) {
  const classes = useStyles()
  const bullet = <span className={classes.bullet}>•</span>

  const menuOptions = [
    {
      name: 'Reset',
      action: () => console.log('reset', card.ID),
    },
    {
      name: 'Delete',
      action: () => console.log('delete', card.ID),
    },
  ]

  return (
    <CardHeader
      action={
        <PopupMenu
          options={menuOptions}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        />
      }
      title={
        <>
          <Tooltip title='Easiness Factor' placement='top'>
            <span>{card.EasinessFactor}</span>
          </Tooltip>
          {bullet}
          <Tooltip title='Interval' placement='top'>
            <span>{card.PreviousInterval}d</span>
          </Tooltip>
        </>
      }
      titleTypographyProps={{ variant: 'body1' }}
      subheader={
        <>
          Next repetition: <DateOnly date={card.NextRepetition} />
        </>
      }
      subheaderTypographyProps={{ variant: 'body2' }}
    />
  )
}


function CardFoot({ card, isBack, setFlipped }) {
  const classes = useStyles()
  const flipLabel = isBack ? 'Show front' : 'Show Back'
  const flipHandler = () => setFlipped(!isBack)

  return (
    <>
      <CardContent>
        <Typography variant='body2'>Created: <DateTime date={card.CreatedAt} /></Typography>
        <Typography variant='body2'>Last updated: <DateTime date={card.UpdatedAt} /></Typography>
      </CardContent>
      <CardActions>
        <Button variant='outlined' onClick={flipHandler}>{flipLabel}</Button>
        <Button variant='outlined' color='primary' className={classes.saveButton}>Save</Button>
      </CardActions>
    </>
  )
}

function DeckItem({ card }) {
  const [flipped, setFlipped] = useState(false)

  const front = (
    <>
      <CardHead card={card} />
      <CardSide content={card.Front} />
      <CardFoot {...{ card, setFlipped }} isBack={false} />
    </>
  )

  const back = (
    <>
      <CardHead card={card} />
      <CardSide content={card.Back} />
      <CardFoot {...{ card, setFlipped }} isBack={true} />
    </>
  )

  return (
    <FlippingCard {...{ flipped, front, back }} />
  )
}

export default DeckItem
