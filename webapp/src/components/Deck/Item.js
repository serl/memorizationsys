import React, { useState, useEffect } from 'react'
import { Typography, CardContent, CardHeader, CardActions, Button, Tooltip } from '@material-ui/core'
import FlippingCard from '../widgets/FlippingCard'
import PopupMenu from '../widgets/PopupMenu'
import TelegramMessage from '../widgets/TelegramMessage'
import { DateOnly, DateTime } from '../widgets/DateTimeFormatter'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  bullet: {
    display: 'inline-block',
    margin: '0 .5em',
    transform: 'scale(0.8)',
  },
  rightButtons: {
    marginLeft: 'auto',
    padding: 0,
  },
})

function CardSide({ content, editing, onChange }) {
  const handleChange = (i, newMessage) => {
    const newContent = [...content]
    newContent[i] = newMessage
    onChange(newContent)
  }

  return (
    <CardContent>
      {content.map((message, i) =>
        <TelegramMessage
          key={i}
          message={message}
          editing={editing}
          onChange={newMessage => handleChange(i, newMessage)}
        />,
      )}
    </CardContent>
  )
}

function CardHead({ card, handleReset, handleDelete }) {
  const classes = useStyles()
  const bullet = <span className={classes.bullet}>•</span>

  const menuOptions = [
    {
      name: 'Reset',
      action: () => handleReset(card.ID),
    },
    {
      name: 'Delete',
      action: () => handleDelete(card.ID),
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
          <Tooltip title='Easiness factor' placement='top'>
            <span>{card.EasinessFactor}</span>
          </Tooltip>
          {bullet}
          <Tooltip title='Last rehearse interval' placement='top'>
            <span>{card.PreviousInterval}d</span>
          </Tooltip>
        </>
      }
      titleTypographyProps={{ variant: 'body1' }}
      subheader={
        <>
          Next scheduled rehearsal: <DateOnly date={card.NextRepetition} />
        </>
      }
      subheaderTypographyProps={{ variant: 'body2' }}
    />
  )
}


function CardFoot({ card, isBack, setFlipped, editing, handleEditStart, handleEditComplete, handleEditCancel }) {
  const classes = useStyles()
  const flipLabel = isBack ? 'Show front' : 'Show Back'
  const flipHandler = () => setFlipped(!isBack)

  return (
    <>
      <CardContent>
        <Typography variant='body2'>Creation: <DateTime date={card.CreatedAt} /></Typography>
        <Typography variant='body2'>Last rehearsal/update: <DateTime date={card.UpdatedAt} /></Typography>
      </CardContent>
      <CardActions>
        <Button variant='outlined' onClick={flipHandler}>{flipLabel}</Button>
        <CardActions className={classes.rightButtons}>
          {editing ?
            <>
              <Button variant='contained' color='primary' onClick={handleEditComplete}>
                Save
              </Button>
              <Button variant='outlined' onClick={handleEditCancel}>
                Cancel
              </Button>
            </>
            :
            <Button variant='outlined' color='primary' onClick={handleEditStart}>
              Edit
            </Button>
          }
        </CardActions>
      </CardActions>
    </>
  )
}

function useStateWithHasBeen(initialState) {
  const [current, setCurrent] = useState(initialState)
  const [hasBeen, setHasBeen] = useState(initialState)
  function set(state) {
    setHasBeen(hasBeen => hasBeen || state)
    setCurrent(state)
  }
  return [current, hasBeen, set]
}

function DeckItem({ card: inputCard, saveCard, deleteCard, resetCard }) {
  const [card, setCard] = useState(inputCard)
  useEffect(() => {
    setCard(inputCard)
  }, [inputCard])
  const [flipped, hasBeenFlipped, setFlipped] = useStateWithHasBeen(false)
  const [editing, setEditing] = useState(false)

  const handleChange = delta =>
    setCard({ ...card, ...delta })

  const handleEditStart = () => {
    setEditing(true)
  }

  const handleEditCancel = () => {
    setCard(inputCard)
    setEditing(false)
  }

  const handleEditComplete = () => {
    setEditing(false)
    if (card === inputCard) {
      return
    }
    saveCard(card)
  }

  const handleReset = cardID => {
    editing && handleEditCancel()
    resetCard(cardID)
  }

  const handleDelete = cardID => {
    editing && handleEditCancel()
    deleteCard(cardID)
  }

  const cardHead = <CardHead {...{ card, handleReset, handleDelete }} />

  const cardFootProps = {
    card,
    setFlipped,
    editing,
    handleEditStart,
    handleEditComplete,
    handleEditCancel,
  }

  const front = (
    <>
      {cardHead}
      <CardSide content={card.Front} editing={editing} onChange={Front => handleChange({ Front })} />
      <CardFoot {...cardFootProps} isBack={false} />
    </>
  )

  const back = hasBeenFlipped && (
    <>
      {cardHead}
      <CardSide content={card.Back} editing={editing} onChange={Back => handleChange({ Back })} />
      <CardFoot {...cardFootProps} isBack={true} />
    </>
  )

  return (
    <FlippingCard {...{ flipped, front, back }} highlight={card.Rehearsing} />
  )
}

export default React.memo(DeckItem)
