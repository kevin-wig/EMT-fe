import apiClient from './index';

export async function getFleets() {
  return apiClient
    .get('fleets')
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getFleetsList(params) {
  return apiClient
    .get('fleets/list', { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createFleet(fleet) {
  return apiClient
    .post(`fleets`, fleet)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createFleetVessel(id, vessel) {
  return apiClient
    .post(`fleets/${id}/vessel`, vessel)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function updateFleet(id, fleet) {
  return apiClient
    .patch(`fleets/${id}`, fleet)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getFleetById(id) {
  return apiClient
    .get(`fleets/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function removeFleetById(id) {
  return apiClient
    .delete(`fleets/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}
