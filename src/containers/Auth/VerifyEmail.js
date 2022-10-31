import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useFormik } from 'formik';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import { useAuth } from '../../context/auth.context';
import { useSnackbar } from '../../context/snack.context';
import { passwordSchema } from '../../validations/auth.schema';
import RedditTextField from '../../components/Forms/RedditTextField';

const PREFIX = 'AuthCard';
const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  header: `${PREFIX}-card-header`,
  body: `${PREFIX}-card-body`,
  input: `${PREFIX}-input`,
  button: `${PREFIX}-button`,
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
    fontSize: '2.5rem',
    textAlign: 'center',
    color: '#fff !important',
    '& p': {
      margin: '1rem 0',
    },
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
}));

const VerifyEmail = ({ match }) => {
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(null);
  const { createPassword, validateEmailVerify } = useAuth();
  const history = useHistory();
  const { notify } = useSnackbar();

  useEffect(() => {
    if (!validated && match.params.token && validateEmailVerify) {
      setLoading(true);
      setValidated(undefined);
      validateEmailVerify(match.params.token)
        .then((res) => {
          setLoading(false);

          if (res.status === 'SUCCESS') {
            setValidated(true);
            notify('Your email has been verified successfully');
          } else {
            setValidated(false);
            notify('Email Verification is failed', 'error');
          }
        })
        .catch(() => {
          setValidated(false);
          setLoading(false);
          notify('Your email has been verified successfully');
        });
    }
  }, [match.params.token, validateEmailVerify, validated, notify]);

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      createPassword(match.params.token, values.password)
        .then((data) => {
          if (data.status === 'SUCCESS') {
            notify('Password is created successfully');
            history.push('/auth/login');
          }
        });
    },
  });

  return (
    <Root className={classes.root}>
      <div className={classes.card}>
        <div className={classes.header}>
          <img alt="EMT" src="/logo-white.png" className="w-75" />
        </div>
        <div className={classes.body}>
          {validated ? (
            <form onSubmit={formik.handleSubmit}>
              <RedditTextField
                className={classes.input}
                label="Password"
                type="password"
                {...formik.getFieldProps('password')}
                error={formik.touched.password && formik.errors.password}
              />
              <RedditTextField
                className={classes.input}
                label="Confirm Password"
                type="password"
                {...formik.getFieldProps('confirmPassword')}
                error={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
              <Button
                className={classes.button}
                variant="contained"
                type={'submit'}
              >
                Create Password
              </Button>
            </form>
          ) : (
            <>
              Welcome to Email Verification
              <p>
                {
                  loading
                    ? 'We are validating your email'
                    : validated
                    ? 'Email validation has succeeded'
                    : validated !== undefined && 'Email validation has failed'
                }
              </p>
            </>
          )}
        </div>
      </div>
    </Root>
  );
};

export default VerifyEmail;
