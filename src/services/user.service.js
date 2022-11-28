import apiClient from './index';

export async function getUsers(search, companyId) {
  let query = '';
  if (search) {
    query = `?name=${search}`;
    if (companyId) {
      query += `&company=${companyId}`;
    }
  } else if (companyId) {
    query = `?company=${companyId}`;
  }

  return apiClient
    .get(`users${query}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getUsersList(params) {
  return apiClient
    .get('users/list', { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getRoles() {
  return apiClient
    .get('users/roles')
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createUser(user) {
  return apiClient
    .post(`users`, user)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function updateUser(id, user) {
  return apiClient
    .patch(`users/${id}`, user)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getUserById(id) {
  return apiClient
    .get(`users/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function removeUserById(id) {
  return apiClient
    .delete(`users/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function requestChangePassword(email) {
  return apiClient
    .post(`users/request-change-password`, { email })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}
