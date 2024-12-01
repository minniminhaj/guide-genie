import React, { useState } from "react";
import { Menu, MenuItem, Button, Fab } from "@material-ui/core";
import { KeyboardArrowDown } from "@material-ui/icons";

const CustomDropdownMenu = ({ buttonLabel, menuItems, onMenuItemClick, disabled }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item) => {
    onMenuItemClick(item); // Pass the `label` property to the parent
    handleClose();
  };

  return (
    <div>
      <Fab disabled={disabled} variant="extended" onClick={handleClick}>
        {buttonLabel}
        <KeyboardArrowDown />
      </Fab>
      <Menu
        id="custom-dropdown-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {menuItems.map((item, index) => (
          <MenuItem key={index} onClick={() => handleItemClick(item)}>
            {item.display}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default CustomDropdownMenu;
