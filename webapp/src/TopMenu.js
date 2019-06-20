import React from 'react'
import { connect } from 'react-redux'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, Link, LinearProgress } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(5),
  },
  progress: {
    marginBottom: -theme.spacing(2),
  },
}))

function TopMenu({ loading }) {
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
      {loading && <LinearProgress className={classes.progress} />}
    </div>
  )
}

const mapStateToProps = ({ api }) => ({
  loading: api.loading > 0,
})

export default connect(mapStateToProps)(TopMenu)
