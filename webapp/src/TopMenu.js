import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, Link } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(5),
  },
}))

function TopMenu() {
  const classes = useStyles()

  return (
    <AppBar position='static' className={classes.root}>
      <Toolbar>
        <Link
          variant='h6'
          color='inherit'
          component={RouterLink}
          to='/'
          underline='none'
        >
          MemorizationSys
          </Link>
      </Toolbar>
    </AppBar>
  )
}

export default TopMenu
