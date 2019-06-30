import React, { useState } from 'react'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import ConfirmDialog from './ConfirmDialog'

function useSelectedOption() {
  const [selOption, setSelOption] = useState()
  const [showOption, setShowOption] = useState(false)
  const setOption = opt => {
    if (opt) {
      setSelOption(opt)
      setShowOption(true)
    } else {
      setShowOption(false)
    }
  }
  return [selOption, showOption, setOption] // setOption(null) will unset showOption, leaving selOption alone
}

function PopupMenu({ options = [], ...props }) {
  const [anchorEl, setAnchorEl] = useState()
  const open = Boolean(anchorEl)
  const [selOption, showOption, setSelOption] = useSelectedOption()

  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }
  if (!options.length) {
    return null
  }

  return (
    <>
      <IconButton
        aria-label='More'
        aria-haspopup='true'
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        {...props}
      >
        {options.map((option, i) => (
          <MenuItem
            key={i}
            onClick={() => {
              handleClose()
              setSelOption(option)
            }}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
      {selOption &&
        <ConfirmDialog
          open={showOption}
          onClose={() => {
            setSelOption(null)
          }}
          handleAction={() => {
            setSelOption(null)
            selOption.action && selOption.action()
          }}
        />
      }
    </>
  )
}

export default PopupMenu
