import React from 'react'
import { Typography } from '@material-ui/core'

function Deck({ deck }) {
  return (
    <Typography>
      {deck.Name}
    </Typography>
  )
}

export default Deck
