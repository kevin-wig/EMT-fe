import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateRangePicker from '@mui/lab/DateRangePicker';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

import CommonTextField from './CommonTextField';

const InputWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  '& .MuiIconButton-root': {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: theme.spacing(1),
  },

  '& input.MuiFilledInput-input': {
    paddingRight: theme.spacing(4),
  }
}));

const CommonDateRangePicker = ({
  className,
  name,
  value,
  onChange,
  placeholder,
}) => {
  const [opened, setOpened] = useState(false);
  const handleClear = () => {
    setOpened(false);
    onChange([null, null]);
  };

  return (
    <Box className={className}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateRangePicker
          name={name}
          value={value}
          onChange={(newValue) => {
            onChange(newValue);
          }}
          onOpen={() => setOpened(true)}
          onClose={() => setOpened(false)}
          renderInput={(startProps, endProps) => {
            return (
              <React.Fragment>
                <InputWrapper>
                  <CommonTextField
                    id="date_input"
                    inputProps={{
                      ...startProps.inputProps,
                      placeholder: placeholder,
                      value: (startProps.inputProps.value || endProps.inputProps.value)
                        ? startProps.inputProps.value + ' - ' + endProps.inputProps.value
                        : '',
                    }}
                    placeholder={placeholder}
                  />
                  {
                    opened && (
                      <IconButton
                        aria-label="clear"
                        onClick={handleClear}
                        size="small"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                </InputWrapper>
              </React.Fragment>
            );
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CommonDateRangePicker;
