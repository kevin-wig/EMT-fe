import apiClient from './index';

export async function getCompanies() {
  return apiClient
    .get('companies')
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getCompaniesList(params) {
  return apiClient
    .get('companies/list', { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createCompany(company) {
  return apiClient
    .post(`companies`, company)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function updateCompany(id, company) {
  return apiClient
    .patch(`companies/${id}`, company)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getCompanyById(id) {
  return apiClient
    .get(`companies/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function removeCompanyById(id) {
  return apiClient
    .delete(`companies/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getTotalEmissions(id, year) {
  return apiClient
    .get(`companies/emissions/${id}?year=${year}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsCII(id, params) {
  return apiClient
    .get(`companies/vessels/cii/${id}`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsCIIKpi(id, year, type) {
  return apiClient
    .get(`companies/vessels/cii/${id}/kpi`, {params: { year, type }})
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsEts(id, params) {
  return apiClient
    .get(`companies/vessels/ets/${id}`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsEtsKPI(id, year) {
  return apiClient
    .get(`companies/vessels/ets/${id}/kpi${year ? `?year=${year}` : ''}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsCIICharts(id, year, month, type, isVoyage) {
  return apiClient
    .get(`companies/vessels/charts/emissions/${id}`, { params: { year, month, type, isVoyage } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsEmissionCharts(id, year, month, type, isVoyage) {
  return apiClient
    .get(`companies/vessels/charts/category/${id}`, { params: { year, month, type, isVoyage } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsEtsChart(id, year) {
  return apiClient
    .get(`companies/vessels/charts/ets/${id}`, { params: { year } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsCostChart(id, year) {
  return apiClient
    .get(`companies/vessels/charts/costs/${id}`, { params: { year } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsGhg(id, params) {
  return apiClient
    .get(`companies/vessels/ghg/${id}`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsGhgChart(id, year) {
  return apiClient
    .get(`companies/vessels/charts/ghg/${id}?year=${year}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsGhgKPIs(id, year) {
  return apiClient
    .get(`companies/vessels/ghg/kpi/${id}?year=${year}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVesselsCIIAsExcel(id, params) {
  return apiClient
    .get(`/companies/vessels/cii/${id}/export/excel`, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVesselsCIIAsPdf(id, params, image) {
  const data = new FormData();
  data.append('screenshot', image);

  return apiClient
    .post(`/companies/vessels/cii/${id}/export/pdf`, data, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVesselsEtsAsExcel(id, params) {
  return apiClient
    .get(`/companies/vessels/ets/${id}/export/excel`, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVesselsEtsAsPdf(id, params, image) {
  const data = new FormData();
  data.append('screenshot', image);

  return apiClient
    .post(`/companies/vessels/ets/${id}/export/pdf`, data, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVesselsGhgAsExcel(id, params) {
  return apiClient
    .get(`/companies/vessels/ghg/${id}/export/excel`, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVesselsGhgAsPdf(id, params, image) {
  const data = new FormData();
  data.append('screenshot', image);

  return apiClient
    .post(`/companies/vessels/ghg/${id}/export/pdf`, data, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}
