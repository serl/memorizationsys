import React, { useState, useCallback } from 'react'
import { Card } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  // comes from https://davidwalsh.name/css-flip with some JS adjustments to work without knowing the height
  root: {
    perspective: '1000px',
  },

  card: {
    transition: [
      theme.transitions.create('transform', {
        duration: theme.transitions.duration.complex,
      }),
      theme.transitions.create('height', {
        duration: theme.transitions.duration.shorter,
      }),
    ],
    transformStyle: 'preserve-3d',
    position: 'relative',
    overflow: 'unset',
    transform: props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    height: props => props.flipped ? props.backHeight : props.frontHeight,
    backgroundColor: props => props.highlight ? 'rgb(253, 247, 229)' : 'transparent',
  },

  side: {
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  front: {
    zIndex: 2,
    transform: 'rotateY(0deg)',
  },
  back: {
    transform: 'rotateY(180deg)',
    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(0, 0, 0, 0.07) 15px, rgba(0, 0, 0, 0.07) 20px)',
  },
}))

function useClientRect(contents) {
  const [rect, setRect] = useState({})
  const ref = useCallback(node => {
    if (node !== null) {
      setRect(node.getBoundingClientRect())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contents]) // recalculate on content change
  return [rect, ref]
}

function FlippingCard({ flipped, highlight, front, back }) {
  const [frontRect, frontRef] = useClientRect(front)
  const [backRect, backRef] = useClientRect(back)
  const classes = useStyles({ flipped, highlight, frontHeight: frontRect.height, backHeight: backRect.height })
  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <div className={`${classes.side} ${classes.front}`} ref={frontRef}>
          {front}
        </div>
        <div className={`${classes.side} ${classes.back}`} ref={backRef}>
          {back}
        </div>
      </Card>
    </div>
  )
}

export default FlippingCard
