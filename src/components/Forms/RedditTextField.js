import * as React from 'react';
import TextField from '@mui/material/TextField';
import { alpha, styled } from '@mui/material/styles';

const Reddit = styled((props) => (
  <TextField InputProps={{ disableUnderline: true }} {...props} />
))(({ theme }) => ({
  color: '#fff !important',
  '& .MuiInputLabel-root': {
    color: '#fff !important',
  },
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.surface[2],
    color: '#fff !important',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 4px`,
      borderColor: theme.palette.primary.main,
      color: '#fff !important',
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginRight: 0,
  },
}));

const RedditTextField = ({
  label,
  className,
  value,
  name,
  onChange,
  type,
  error,
}) => {
  return (
    <Reddit
      type={type}
      label={label}
      id={`${name}-reddit-input`}
      variant="filled"
      className={className}
      value={value}
      onChange={onChange}
      name={name}
      error={!!error}
      helperText={error}
      autoComplete=""
    />
  );
};

export default RedditTextField;

