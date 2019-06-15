import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, Link } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(5),
  },
}))

function TopMenu({ setSelectedDeck }) {
  const classes = useStyles()

  return (
    <AppBar position='static' className={classes.root}>
      <Toolbar>
        <Link
          variant='h6'
          color='inherit'
          component='button'
          underline='none' onClick={() => setSelectedDeck()}
        >
          MemorizationSys
          </Link>
      </Toolbar>
    </AppBar>
  )
}

export default TopMenu
