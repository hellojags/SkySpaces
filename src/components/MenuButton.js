import React from 'react';
import { IconButton, ListItem, Grid, Chip, Paper, Toolbar, MenuItem, Button, Menu, Fade, Divider } from "@mui/material";
import { Icon } from '@iconify/react';

export function MenuButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    console.log('dropdown button from action header called', event.currentTarget.innerText);
    props.parentCallBack(event.currentTarget.innerText);
    setAnchorEl(null);
  };
  let startIcon = <Icon icon="charm:upload" />;
  if (props.buttonName === 'Sort') {
    startIcon = <Icon icon="cil:sort-descending" />;
  }
  if (props.buttonName === 'List' || props.buttonName === 'Files') {
    startIcon = <Icon icon="fluent:list-20-filled"/>;
  }
  const open = Boolean(anchorEl);
  const Wrapper = props.iconType;
  const listItems = props.items.map((link, index) => { return (<MenuItem key={index} onClick={handleClose} >{link}</MenuItem>) });
  return (
    <React.Fragment>
      <Button
        id="fade-button"
        aria-controls={open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}>
        {startIcon}
        {props.buttonName}
        <Icon icon="ph:caret-down" />
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {listItems}
        {props.order && <Divider />}
        {props.order && <React.Fragment>
          <MenuItem onClick={handleClose} >{props.order[0]}</MenuItem>
          <MenuItem onClick={handleClose} >{props.order[1]}</MenuItem>
        </React.Fragment>}
      </Menu>
    </React.Fragment>
  );
}

export default MenuButton;