import * as React from 'react';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha, styled } from '@mui/material/styles';

const NormalText = styled((props) => (
  <TextField InputProps={{ disableUnderline: true }} {...props} />
))(({ theme, error }) => ({
  color: theme.palette.text.primary,
  '& .MuiInputLabel-root': {
    color: theme.palette.text.primary,
  },
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#fff',
    border: `1px solid ${error ? theme.palette.error.main : theme.palette.border.main}`,
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '& input': {
      padding: '0.5rem 0.75rem',
      color: theme.palette.text.primary,
      fontSize: '0.9rem',
    },
    '&:hover': {
      backgroundColor: '#fff',
    },
    '&:before': {
      display: 'none',
    },
    '&:after': {
      display: 'none',
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 4px`,
      color: theme.palette.text.primary,
      borderColor: theme.palette.border.focus,
    },
    '& .MuiCircularProgress-svg': {
      color: theme.palette.border.main,
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: '0 !important',
    fontSize: '0.7rem',
  },
}));

const CommonTextField = ({
  label,
  className,
  value,
  onChange,
  type,
  placeholder,
  name,
  error,
  loading,
  autoFocus,
  ...rest
}) => {
  return (
    <NormalText
      type={type}
      label={label}
      id={`${name}-reddit-input`}
      name={name}
      variant="filled"
      className={className}
      value={loading ? '' : value ?? ''}
      onChange={onChange}
      placeholder={loading ? 'Loading...' : placeholder}
      error={!!error}
      helperText={error}
      autoFocus={autoFocus}
      InputProps={{
        endAdornment:
          loading &&
          <InputAdornment position="end">
            <CircularProgress size={20} />
          </InputAdornment>,
      }}
      {...rest}
    />
  );
};

export default CommonTextField;

