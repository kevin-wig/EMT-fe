import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

import RedditTextField from '../../components/Forms/RedditTextField';
import { useAuth } from '../../context/auth.context';

const PREFIX = 'ForgotPassword';
const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  header: `${PREFIX}-card-header`,
  body: `${PREFIX}-card-body`,
  input: `${PREFIX}-input`,
  button: `${PREFIX}-button`,
  link: `${PREFIX}-link`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  [`& .${classes.card}`]: {
    background: 'rgba(255, 255, 255, 0.2) !important',
    marginTop: '1.5rem !important',
    marginBottom: '1.5rem !important',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 1rem 3rem rgba(0, 0, 0, 0.175) !important',
  },
  [`& .${classes.header}`]: {
    padding: '0.75rem 1.5rem',
    marginBottom: '0',
    backgroundColor: 'transparent',
    borderBottom: '0 solid rgba(0, 0, 0, 0.125)',
    textAlign: 'center !important',
    '& img': {
      width: '75% !important',
    },
  },
  [`& .${classes.body}`]: {
    padding: '3rem',
    paddingTop: '1.5rem',
    color: '#fff !important',
  },
  [`& .${classes.input}`]: {
    width: '100%',
    marginBottom: '1rem !important',
  },
  [`& .${classes.button}`]: {
    background: '#fff',
    color: '#000',
    width: '100%',
    boxShadow: 'none',
    textTransform: 'capitalize',
    marginBottom: '1rem',
    '&:hover': {
      background: '#fff',
    },
  },
  [`& .${classes.link}`]: {
    textAlign: 'center',
    fontSize: '0.875rem',
    width: '100%',
    '& a': {
      color: '#fff',
      textDecoration: 'none',
    },
  },
}));

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email('Check the format of the email you entered')
        .max(80, 'Maximum length is 80 characters')
        .required('Email is required'),
    }),
    onSubmit: async ({ email }) => {
      forgotPassword(email);
    },
  });

  return (
    <Root className={classes.root}>
      <Box className={classes.card}>
        <Box className={classes.header}>
          <img alt="EMT" src="/logo-white.png" className="w-75" />
        </Box>
        <Box className={classes.body}>
          <form onSubmit={formik.handleSubmit}>
            <RedditTextField
              className={classes.input}
              label="Your email"
              name={formik.getFieldProps('email').name}
              value={formik.getFieldProps('email').value}
              onChange={formik.getFieldProps('email').onChange}
              error={formik.touched.email && formik.errors.email}
            />
            <Button
              className={classes.button}
              variant="contained"
              type="submit"
            >
              Forgot password
            </Button>
            <Box className={classes.link}>
              <Link to="/auth/login">Log in</Link>
            </Box>
          </form>
        </Box>
      </Box>
    </Root>
  );
};

export default ForgotPassword;
