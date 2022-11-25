import * as React from 'react';
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { UserRoles } from "../../constants/UserRoles";
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { useMemo, useRef } from 'react';

const Error = styled('p')(({ theme }) => ({
  '&': {
    margin: '3px 0 0 !important',
    fontSize: '0.7rem',
    color: theme.palette.error.main,
  }
}));

const MuiSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-iconStandard': {
    right: theme.spacing(1),
  }
}));

export const BootstrapInput = styled(InputBase)(({ theme, disabled, error }) => ({
  '& .MuiInputBase-input': {
    padding: '0.5rem 0.75rem',
    paddingRight: '34px !important',
    borderRadius: theme.shape.borderRadius,
    position: 'relative',
    backgroundColor: disabled ? theme.palette.disabled : theme.palette.background.paper,
    // border: '1px solid #ced4da',
    border: `1px solid ${error ? theme.palette.error.main : theme.palette.border.main}`,
    fontSize: '0.9rem',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      borderRadius: theme.shape.borderRadius,
    },
    '& .MuiSelect-iconStandard': {
      right: theme.spacing(1)
    },
  },
}));

const CommonSelect = ({
  name,
  className,
  value,
  onChange,
  options,
  multiple= false,
  clearable= false,
  optionValue,
  optionLabel,
  disabled,
  error,
  renderValue,
}) => {
  const inputRef = useRef(null);

  const isClearableNow = useMemo(() => {
    if (clearable && value?.length) {
      return value.some((val) => !!val);
    }
    return false;
  }, [clearable, value]);

  return (
    <FormControl variant="standard" className={className}>
      <MuiSelect
        multiple={multiple}
        id="demo-customized-select-native"
        name={name}
        value={isNaN(value) ? value || '' : value}
        onChange={onChange}
        input={<BootstrapInput inputRef={inputRef} style={{background: disabled ? "#ccc" : "#fff", borderRadius: "10px" }} disabled={disabled} />}
        disabled={disabled}
        IconComponent={KeyboardArrowDownIcon}
        renderValue={renderValue}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        }}
        endAdornment={(
          <IconButton
            size="small"
            sx={{ visibility: isClearableNow ? 'visible' : 'hidden', position: 'absolute', right: 25 }}
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = multiple ? [] : '';
                onChange({ target: { value: multiple ? [] : '', name } });
              }
            }}
          >
            <ClearIcon />
          </IconButton>
        )}
      >
        {options ? options.map((option, key) => option && (
          <MenuItem key={key} value={optionValue ? option[optionValue] : option.value}>
            {optionLabel ? optionLabel === 'role' ? UserRoles[option[optionLabel]] : option[optionLabel] : option.label}
          </MenuItem>
        )) : (
          <MenuItem>No items</MenuItem>
        )}
      </MuiSelect>
      {error && <Error>{error}</Error>}
    </FormControl>
  );
};

export default CommonSelect;
