import React from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { BootstrapInput } from './CommonSelect';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MultiSelect = ({
  name,
  value,
  onChange,
  options,
  optionValue,
  optionLabel,
  className,
}) => {

  const handleChange = (event) => {
    const { target: { value } } = event;
    onChange(value);
  };

  return (
    <FormControl sx={{ m: 1, width: 300 }} className={className}>
      <Select
        labelId="demo-multiple-name-label"
        id="demo-multiple-name"
        multiple
        name={name}
        value={value}
        onChange={handleChange}
        input={<BootstrapInput />}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
              width: 250,
            },
          },
        }}
      >
        {options.map((option, key) => (
          <MenuItem
            key={key}
            value={optionValue ? option[optionValue] : option.value}
          >
            {optionLabel ? option[optionLabel] : option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultiSelect;
