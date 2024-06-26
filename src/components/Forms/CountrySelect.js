import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';

import { COUNTRIES_OPTIONS } from '../../constants/Countries';
import CommonTextField from './CommonTextField';

const CountryAutoComplete = styled(Autocomplete)(() => ({
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

const PLACEHOLDER = 'Please select country';

const CountrySelect = ({
  name,
  value,
  onChange,
  error,
  ...rest
}) => {
  return (
    <CountryAutoComplete
      id="country-select-demo"
      options={COUNTRIES_OPTIONS}
      getOptionLabel={(option) => option || PLACEHOLDER}
      value={value || ''}
      onChange={(e, value) => {
        onChange(value);
      }}
      popupIcon={<KeyboardArrowDownIcon />}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
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
      {...rest}
    />
  );
};

export default CountrySelect;
