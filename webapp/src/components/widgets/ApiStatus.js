import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { LinearProgress } from '@material-ui/core'
import StyledSnackbar from './StyledSnackbar'

const useStyles = makeStyles({
  progress: {
    position: 'absolute',
    width: '100%',
  },
})

function ApiStatus({ loading, lastError }) {
  const classes = useStyles()
  const [error, setError] = useState(lastError)
  useEffect(() => {
    setError(lastError)
  }, [lastError])

  function handleErrClose(event, reason) {
    if (reason === 'clickaway') {
      return
    }
    setError(null)
  }

  return (
    <>
      {loading && <LinearProgress className={classes.progress} />}
      {lastError &&
        <StyledSnackbar
          open={!!error}
          onClose={handleErrClose}
          message={lastError.formatted}
          variant='error'
        />
      }
    </>
  )
}

const mapStateToProps = ({ apiStatus }) => ({
  loading: apiStatus.loading > 0,
  lastError: apiStatus.errors[apiStatus.errors.length - 1],
})

export default connect(mapStateToProps)(ApiStatus)
