import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import * as AuthService from '../services/auth.service';
import Loading from '../components/Layout/Loading';
import { useSnackbar } from './snack.context';

const AuthContext = React.createContext({});

/**
 * @return {null}
 */
function AuthProvider(props) {
  const [me, setMe] = useState();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tfa, setTfa] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { notify } = useSnackbar();
  const history = useHistory();


  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoaded(false);
      await AuthService.fetchCurrentUser().then((res) => {
        setMe(res);
        setLoaded(true);
      });
    } catch (err) {
      setMe(undefined);
      setLoaded(true);
      setIsAuthorized(false);
      localStorage.setItem('2fa', null);
    }
  }, []);

  const validateOTP = useCallback(async (otp) => {
    return new Promise((resolve, reject) => {
      try {
        AuthService.validateOTP(otp).then((res) => {
          resolve(res);
        });
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('2fa') === 'passed') {
        setIsAuthorized(true);
      }
      await fetchCurrentUser();
    })();
  }, [fetchCurrentUser]);

  const login = useCallback(async (email, password) => {
    await AuthService.login(email, password).then(() => fetchCurrentUser());
  }, [fetchCurrentUser]);

  const logout = useCallback(async () => {
    localStorage.setItem('accessToken', null);
    localStorage.setItem('2fa', null);
    setIsAuthorized(false);
    setTfa(false);
    setMe(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    AuthService.forgotPassword(email)
      .then(() => {
        notify('You will receive a message');
      })
      .catch((err) => {
        if (err.response?.data?.message) {
          notify(err.response.data.message, 'error');
        } else {
          notify('Failed to submit', 'error');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePassword = useCallback(async (password, token) => {
    AuthService.changePassword(password, token)
      .then(() => {
        notify('Your password has changed');
        history.push('/auth/login');
      })
      .catch((err) => {
        if (err.response?.data?.message) {
          notify(err.response.data.message, 'error');
        } else {
          notify('Failed to change password', 'error');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateEmailVerify = useCallback(async (token) => {
    return AuthService.validateEmailVerify(token);
  }, []);

  const createPassword = useCallback(async (token, password) => {
    return AuthService.createPassword(token, password);
  }, []);

  const resendEmailVerification = useCallback(async (email) => {
    return AuthService
      .resendEmailVerification(email)
      .catch((err) => {
        if (err?.response?.data) {
          notify(err?.response?.data?.message, 'error');
        } else {
          notify('Network connection is refused', 'error');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded) {
    return <Loading isAuthorized={isAuthorized} />;
  }

  return (
    <AuthContext.Provider
      value={{
        me,
        setMe,
        login,
        logout,
        isAuthorized,
        setIsAuthorized,
        loaded,
        tfa,
        setTfa,
        fetchCurrentUser,
        validateOTP,
        forgotPassword,
        changePassword,
        validateEmailVerify,
        createPassword,
        resendEmailVerification,
      }}
      {...props}
    />
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
