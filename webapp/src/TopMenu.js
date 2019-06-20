import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, Link } from '@material-ui/core'
import ApiStatus from './widgets/ApiStatus'

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(5),
  },
}))

function TopMenu() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar position='static'>
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
      <ApiStatus />
    </div>
  )
}

export default TopMenu
