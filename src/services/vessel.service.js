import apiClient from './index';

export async function getVessels() {
  return apiClient
    .get('vessels')
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselsList(params) {
  return apiClient
    .get('vessels/list', { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createVessel(vessel) {
  return apiClient
    .post(`vessels/create`, vessel)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createVessels(vessel) {
  let vessels = [];

  if (Array.isArray(vessel)) {
    vessels = vessel.filter(v => v.name && v.imo);
  } else {
    vessels = [vessel];
  }

  return apiClient
    .post(`vessels`, vessels)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createVesselTrips(data) {
  return apiClient
    .post(`vessel-trips`, { vesselTrips: data })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function updateVesselTrip(id, data) {
  return apiClient
    .patch(`vessel-trips/${id}`, data)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function createVesselTrip(data,aggregate) {
  return apiClient
    .post(`vessel-trips/create?aggregate=${aggregate}`, data)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function removeVesselTripById(id) {
  return apiClient
    .delete(`vessel-trips/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function updateVessel(id, vessel) {
  return apiClient
    .patch(`vessels/${id}`, vessel)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselById(id) {
  return apiClient
    .get(`vessels/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function removeVesselById(id) {
  return apiClient
    .delete(`vessels/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function excelParse(file) {
  const formData = new FormData();
  formData.append('excel', file);

  return apiClient
    .post(`/excel-parser/vessel`, formData, {
      headers: {
        responseType: 'blob',
      },
      timeout: 20000000,
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function excelVoyageParse(file) {
  const formData = new FormData();
  formData.append('excel', file);

  return apiClient
    .post(`/excel-parser/journey`, formData, {
      headers: {
        responseType: 'blob',
      },
      timeout: 20000000,
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function excelVesselTripParse(file) {
  const formData = new FormData();
  formData.append('excel', file);

  return apiClient
    .post(`/excel-parser/vessel-trip`, formData, {
      headers: {
        responseType: 'blob',
      },
      timeout: 20000000,
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselSample() {
  return apiClient
    .get(`/excel-parser/vessel`, {
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVoyageSample() {
  return apiClient
    .get(`/excel-parser/vessel-trip`, {
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getFuels() {
  return apiClient
    .get(`vessels/fuels`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselTypes() {
  return apiClient
    .get(`vessels/types`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getPorts() {
  return apiClient
    .get(`/vessels/ports`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getTrips(params) {
  return apiClient
    .get(`/vessel-trips/list`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVoyagesByVesselId(vesselId, params) {
  return apiClient
    .get(`/vessel-trips/vessel-voyage/${vesselId}`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getTripById(id) {
  return apiClient
    .get(`/vessel-trips/${id}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getEtsPerVoyage(id) {
  return apiClient
    .get(`/vessel-trips/ets`, { params: { id } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVoyageAsExcel(params) {
  return apiClient
    .get(`/vessel-trips/export/excel`, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVoyageAsPdf(image, params) {
  const data = new FormData();
  data.append('screenshot', image);

  return apiClient
    .post(`/vessel-trips/export/pdf`, data, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVoyageCIIChart(params) {
  return apiClient
    .get(`/vessel-trips/cii/chart`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVoyageStackChart(params) {
  return apiClient
    .get(`/vessel-trips/cii/chart/stack-bar`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVoyageETSChart(params) {
  return apiClient
    .get(`/vessel-trips/ets/chart/ets`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVoyageETSEuaCostChart(params) {
  return apiClient
    .get(`/vessel-trips/ets/chart/eua-cost`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVoyageETSEuaPercentChart(params) {
  return apiClient
    .get(`/vessel-trips/ets/chart/eua-percent`, { params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getGhg(id, year) {
  return apiClient
    .get(`/vessels/ghg/${id}?year=${year}`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselCII({ id, year, month, mode, fromDate, toDate }) {
  return apiClient
    .get(`/vessels/cii/${id}`, { params: { year, month, mode, fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselCIIKpi({ id, year }) {
  return apiClient
    .get(`/vessels/cii/${id}/kpi`, { params: { year } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselCIIChart({id, year, month, mode, fromDate, toDate}) {
  return apiClient
    .get(`/vessels/charts/cii/${id}`, { params: { mode, year, month, fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselCIIChartPerTrip(id, fromDate, toDate) {
  return apiClient
    .get(`/vessels/charts/cii/${id}`, { params: { mode: 'TRIP', fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselStackChartPerVoyage({id, year, month, mode, fromDate, toDate}) {
  return apiClient
    .get(`/vessels/charts/stack-bar/${id}`, { params: { mode, year, month, fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getVesselFuelChartPerVoyage(id, { companyId, year, month, mode, fromDate, toDate}) {
  return apiClient
    .get(`/vessel-trips/vessel-voyage/${id}/chart`, { params: { companyId, mode, year, month, fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getEts(id, mode, fromDate, toDate) {
  return apiClient
    .get(`/vessels/eu-ets/${id}`, { params: { mode, fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getEtsKpi(id, year) {
  return apiClient
    .get(`/vessels/eu-ets/${id}/kpi`, { params: { year } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err))
}

export async function getEtsCostChart(id, year, mode, fromDate, toDate) {
  return apiClient
    .get(`/vessels/eu-ets/${id}/charts/eua-cost`, { params: { year, mode, fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err))
}

export async function getVesselEtsPerVoyageChart(id, fromDate, toDate) {
  return apiClient
    .get(`/vessels/eu-ets/${id}/charts/ets`, { params: { fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err))
}

export async function getVesselCostPerVoyageChart(id) {
  return apiClient
    .get(`/vessels/eu-ets/${id}/charts/eua-cost`, { params: { mode: 'VOYAGE' } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err))
}

export async function getEtsEuaPercentChart(id, year, mode, fromDate, toDate) {
  return apiClient
    .get(`/vessels/eu-ets/${id}/charts/eua-percent`, { params: { year, mode, fromDate, toDate } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err))
}

export async function getReport(params, chartYear, isVoyage) {
  return apiClient
    .post(`/vessels/report`, { ...params }, { params: { year: chartYear, isVoyage } })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function getReportVessels(params) {
  return apiClient
    .post('/vessels/report/list', { ...params })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportReportsAsExcel(params) {
  return apiClient
    .post(`/vessels/report/export/excel`, params, {
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportReportsAsPdf(screenshots) {
  const data = new FormData();
  data.append(`screenshot`, screenshots[0]);

  return apiClient
    .post(`/vessels/report/export/pdf`, data, {
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportCiiAsExcel(id, mode, fromDate, toDate) {
  return apiClient
    .get(`/vessels/cii/${id}/export/excel`, {
      responseType: 'blob',
      params: { mode, fromDate, toDate },
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportCiiAsPdf(id, image, mode) {
  const data = new FormData();
  data.append('screenshot', image);

  return apiClient
    .post(`/vessels/cii/${id}/export/pdf?mode=${mode}`, data, {
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportEtsAsPdf(id, image, mode) {
  const data = new FormData();
  data.append('screenshot', image);

  return apiClient
    .post(`/vessels/eu-ets/${id}/export/pdf?mode=${mode}`, data, {
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportEtsAsExcel(id, mode, fromDate, toDate) {
  return apiClient
    .get(`/vessels/eu-ets/${id}/export/excel`, {
      responseType: 'blob',
      params: { mode, fromDate, toDate },
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export async function exportVoyagePerVesselAsExcel(vesselId, params) {
  return apiClient
    .get(`/vessel-trips/vessel-voyage/${vesselId}/excel`, {
      params,
      responseType: 'blob',
    })
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}
