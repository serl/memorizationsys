import React from 'react'
import { Typography, Input } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  message: {
    letterSpacing: 0, // otherwise emoji flags are broken
  },
  messageInput: {
    fontSize: '2.125rem',
  },
})

function TelegramMessage({ message, editing, onChange }) {
  const classes = useStyles()
  switch (message.t) {
    case 0:
      const handleChange = value => onChange({ ...message, c: value })
      return (
        editing ?
          <Input
            className={classes.messageInput}
            placeholder='Message'
            inputProps={{
              'aria-label': 'Message',
            }}
            value={message.c}
            onChange={e => handleChange(e.target.value)}
          />
          :
          <Typography
            variant='h4'
            component='h3'
            className={classes.message}
          >
            {message.c}
          </Typography>
      )
    default:
      return (
        <Typography variant='h5' color='textSecondary'>
          [not supported]
        </Typography>
      )
  }
}

export default React.memo(TelegramMessage)
