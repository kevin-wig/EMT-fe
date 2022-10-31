import apiClient from './index';

export async function login(email, password) {
  return apiClient
    .post('/auth/login', {
      email,
      password,
    })
    .then((response) => {
      if (response) {
        if (response?.data?.access_token) {
          localStorage.setItem('accessToken', response.data.access_token);
        }
        return response.data;
      }
      return Promise.reject();
    });
}

export async function fetchCurrentUser() {
  return apiClient
    .get('users/me')
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function validateOTP(otp) {
  return apiClient.post('/two-factor/validate', {
    accessCode: otp,
  })
    .then((response) => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });
}

export async function forgotPassword(email) {
  return apiClient.post('/auth/forgot-password', { email })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export function changePassword(password, token) {
  return apiClient.post('/auth/change-password', { password, token })
    .then((res) => res)
    .catch((err) => Promise.reject(err));
}

export async function validateEmailVerify(token) {
  return apiClient.post('/auth/validate-email-verify', { token })
    .then((response) => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });
}

export async function createPassword(token, password) {
  return apiClient.post('/auth/create-password', { token, password })
    .then((response) => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });
}

export async function resendEmailVerification(email) {
  return apiClient.post('/auth/resend-email-verify', { email })
    .then((response) => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    });
}
