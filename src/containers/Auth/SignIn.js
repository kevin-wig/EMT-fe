import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { useFormik } from 'formik';
import { styled } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/auth.context';
import { useSnackbar } from '../../context/snack.context';
import { loginSchema } from '../../validations/auth.schema';
import RedditTextField from '../../components/Forms/RedditTextField';

const PREFIX = 'AuthCard';
const classes = {
  root: `${PREFIX}-root`,
  card: `${PREFIX}-card`,
  header: `${PREFIX}-card-header`,
  body: `${PREFIX}-card-body`,
  input: `${PREFIX}-input`,
  checkbox: `${PREFIX}-checkbox`,
  button: `${PREFIX}-button`,
  forgot: `${PREFIX}-forgot`,
  unverified: `${PREFIX}-unverified`,
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
  [`& .${classes.checkbox}`]: {
    marginBottom: '1rem !important',
    minHeight: '1.35rem',
    paddingLeft: '1.5rem',

    '& input': {
      borderRadius: '0.25em',
      float: 'left',
      marginLeft: '-1.5rem',
      width: '1em',
      height: '1em',
      verticalAlign: 'top',
      fontSize: 'inherit',
      '&:focus': {
        borderColor: '#92bdff',
        outline: '0',
        boxShadow: '0 0 0 0.25rem rgba(36, 122, 255, 0.25)',
      },
    },
  },
  [`& .${classes.button}`]: {
    background: '#fff !important',
    color: '#000',
    width: '100%',
    boxShadow: 'none',
    textTransform: 'capitalize',
    marginBottom: '1rem',
    '& .MuiLoadingButton-loadingIndicator': {
      color: '#000',
    },
    '&:hover': {
      background: '#fff',
    },
  },
  [`& .${classes.forgot}`]: {
    width: '100%',
    textAlign: 'center',
    fontSize: '0.875rem',
    '& a': {
      color: '#fff',
      textDecoration: 'none',
    },
  },
  [`& .${classes.unverified}`]: {
    width: '100%',
    marginTop: '0',
    marginBottom: '1rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    '& a': {
      cursor: 'pointer',
      color: theme.palette.primary.main,
      textDecoration: 'none',
    },
  },
}));

const SignIn = () => {
  const [otp, setOtp] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const { login, setIsAuthorized, tfa, setTfa, fetchCurrentUser, validateOTP, resendEmailVerification } = useAuth();
  const history = useHistory();
  const { notify } = useSnackbar();

  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      if (!tfa) {
        setLoading(true);
        login(values.email, values.password)
          .then(() => {
            if (unverifiedEmail) {
              setUnverifiedEmail('');
            }
            setTfa(true);
            setLoading(false);
          })
          .catch((err) => {
            if (err?.response?.data) {
              if (err?.response?.data?.isNotActive) {
                setUnverifiedEmail(values.email);
              }
              notify(err?.response?.data?.message, 'error');
            } else {
              notify('Network connection is refused', 'error');
            }

            setLoading(false);
          });
      }
    },
  });

  const handleClickLogin = async () => {
    if (tfa) {
      // validate OTP
      validateOTP(otp).then((res) => {
        if (res.isValid) {
          setIsAuthorized(true);
          fetchCurrentUser();
          localStorage.setItem('2fa', 'passed');
          notify('Login successfully');
          history.push('/');
        } else {
          notify(res.message, 'error');
        }
      }).catch((error) => {
        notify(error.message, 'error');
      });
    }
  };

  const handleClickEmailVerify = async (e) => {
    e.preventDefault();
    if (unverifiedEmail) {
      resendEmailVerification(unverifiedEmail).then((res) => {
        if (res.status === 'SUCCESS') {
          notify('Email Verify notification has sent successfully. Please check notification.');
          setUnverifiedEmail('');
        }
      }).catch(error => {
        notify(error.message);
      });
    }
  };

  return (
    <Root className={classes.root}>
      <div className={classes.card}>
        <div className={classes.header}>
          <img alt="EMT" src="/logo-white.png" className="w-75" />
        </div>
        <div className={classes.body}>
          <form onSubmit={formik.handleSubmit}>
            {!tfa ? (
              <>
                <RedditTextField
                  className={classes.input}
                  label="Email address"
                  {...formik.getFieldProps('email')}
                  error={formik.touched.email && formik.errors.email}
                />
                <RedditTextField
                  className={classes.input}
                  label="Password"
                  type="password"
                  {...formik.getFieldProps('password')}
                  error={formik.touched.password && formik.errors.password}
                />
                <div className={classes.checkbox}>
                  <input type="checkbox" id="inputRememberPassword" />
                  <label htmlFor="inputRememberPassword">Remember Password</label>
                </div>
              </>
            ) : (
              <RedditTextField
                className={classes.input}
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            )}
            <LoadingButton
              className={classes.button}
              variant="contained"
              onClick={tfa ? handleClickLogin : () => null}
              type={!tfa ? 'submit' : 'button'}
              loading={loading}
            >
              Login
            </LoadingButton>
            {unverifiedEmail && (
              <p className={classes.unverified}>
                You didn’t verify your email address. If you want to send verification email
                , please click <a href="/#" onClick={(e) => handleClickEmailVerify(e)}>here</a>.
              </p>
            )}
            {!tfa && (
              <div className={classes.forgot}>
                <Link to="/auth/forgot-password">Forgot Password?</Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </Root>
  );
};

export default SignIn;
