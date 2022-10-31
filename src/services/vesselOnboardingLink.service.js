import apiClient from './index';

export async function getVesselOnboardingLinksByCompanyId(company_id) {
  return apiClient
    .get(`vessel-onboarding-links/${company_id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createVesselOnboardingLink(vesselOnboardingLinkObj) {
  return apiClient
    .post(`vessel-onboarding-links`, vesselOnboardingLinkObj)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function deleteVesselOnboardingLink(imo) {
  return apiClient
    .delete(`vessel-onboarding-links/${imo}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getImoList() {
  return apiClient
    .get('vessel-onboarding-links/imoList')
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}
