import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

import CommonTextField from './CommonTextField';

const PortAutoComplete = styled(Autocomplete)(() => ({
  width: '100% !important',
  '& .MuiFilledInput-root': {
    padding: '0.5rem 0.75rem !important',
    '&:before': {
      display: 'none',
    },
    '&:after': {
      display: 'none',
    },
    '& .MuiFilledInput-input': {
      padding: '0 !important',
    },
  },
}));

const PLACEHOLDER = 'Please select port';

const PortSelect = ({
  name,
  options,
  value,
  onChange,
  error,
}) => {
  return (
    <PortAutoComplete
      id="port-select-demo"
      options={options}
      getOptionLabel={(option) => option || PLACEHOLDER}
      value={value || ''}
      onChange={(e, value) => {
        onChange(value);
      }}
      popupIcon={<KeyboardArrowDownIcon />}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={`${option}_${props['data-option-index']}`}
        >
          {option || PLACEHOLDER}
        </Box>
      )}
      renderInput={(params) => (
        <CommonTextField
          {...params}
          variant="filled"
          name={name}
          error={!!error}
          helperText={error}
          inputProps={{
            ...params.inputProps,
          }}
        />
      )}
    />
  );
};

export default PortSelect;
