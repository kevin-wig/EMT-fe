import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const Root = styled(Button)(() => ({
  minHeight: '40px',
  display: 'inline-block',
  textTransform: 'capitalize',
  fontWeight: '400',
  lineHeight: '1.5',
  padding: '0.5rem 1rem',
  fontSize: '0.9rem',
  boxShadow: 'none',
}));

const CommonButton = ({
  className,
  onClick,
  children,
  variant,
  color,
  type,
  disabled,
}) => {
  return (
    <Root
      className={className}
      onClick={onClick}
      variant={variant ? variant : 'contained'}
      color={color ? color : 'primary'}
      type={type ? type : 'button'}
      disabled={disabled}
    >
      {children}
    </Root>
  );
};

export default CommonButton;
