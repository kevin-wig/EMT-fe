import * as React from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

import CommonTextField from './CommonTextField';

const CommonDatePicker = ({
  className,
  name,
  value,
  onChange,
  placeholder,
  error,
  loading,
  minDate,
  maxDate,
  disabled
}) => {
  const handleDateChange = (date) => {
    if (new Date(date).toString() !== 'Invalid Date') {
      onChange(date);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        name={name}
        minDate={minDate}
        maxDate={maxDate}
        value={value}
        disabled={disabled}
        onChange={handleDateChange}
        inputFormat="dd/MM/yyyy"
        renderInput={(params) => (
          <CommonTextField
            id={`${name}_input`}
            {...params}
            className={className}
            placeholder={placeholder}
            error={error}
            loading={loading}
          />
        )}
        date={null}
      />
    </LocalizationProvider>
  );
};

export default CommonDatePicker;
