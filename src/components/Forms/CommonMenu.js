import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { styled } from '@mui/material/styles';

const PREFIX = 'Menu';
const classes = {
  root: `${PREFIX}-root`,
  menu: `${PREFIX}-menu`,
};

const MenuButton = styled(Button)(() => ({
  [`&.${classes.root}`]: {
    textTransform: 'none !important',
  },
}));

const MenuWrapper = styled(Menu)(() => ({
  [`&.${classes.menu}`]: {
    '& .MuiPaper-root ': {
      minWidth: 150,
    },
  },
}));

const CommonMenu = ({
  label,
  color,
  items,
  onChange,
  optionLabel,
  className,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (id) => {
    onChange(id);
    setAnchorEl(null);
  };

  return (
    <>
      <MenuButton
        className={`${classes.root} ${className}`}
        onClick={handleClick}
        color={color || 'primary'}
        variant="contained"
        endIcon={<ArrowDropDownIcon />}
      >
        {label}
      </MenuButton>
      <MenuWrapper
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className={classes.menu}
      >
        {items?.length > 0 && items.map((item, key) => (
          <MenuItem key={key} onClick={() => handleChange(item.id)}>
            {optionLabel ? item[optionLabel] : item.label}
          </MenuItem>
        ))}
      </MenuWrapper>
    </>
  );
};

export default CommonMenu;
