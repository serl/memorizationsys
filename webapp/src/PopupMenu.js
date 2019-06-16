import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'

function PopupMenu({ options = [], ...props }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

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
          <MenuItem key={i} onClick={() => { handleClose(); option.action && option.action() }}>
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default PopupMenu
