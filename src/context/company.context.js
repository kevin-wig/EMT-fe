import React, { useCallback, useState } from 'react';

import * as CompanyService from '../services/company.service';
import * as VesselOnboardingLinkService from '../services/vesselOnboardingLink.service';

const CompanyContext = React.createContext({});

/**
 * @return {null}
 */
function CompanyProvider(props) {
  const [company, setCompany] = useState();
  const [companies, setCompanies] = useState();
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [filterParams, setFilterParams] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSuccess = (res) => {
    setLoading(false);
    return res;
  };

  const handleError = (error) => {
    setLoading(false);
    throw error;
  };

  const getCompanies = useCallback(async () => {
    setLoading(true);
    return CompanyService.getCompanies()
      .then(handleSuccess)
      .then((res) => {
        setCompanies(res.data);
        return res;
      })
      .catch(handleError)
      .catch((err) => {
        setCompanies(null);
        throw err;
      });
  }, []);

  const getCompaniesList = useCallback(async (params) => {
    setLoading(true);
    return CompanyService.getCompaniesList(params)
      .then(handleSuccess)
      .then((res) => {
        const data = res.data || {};
        setCompanies(data.listData);
        setTotalCount(data.totalCount);
        setPagination(data.pagination);
        return data;
      })
      .catch(handleError)
      .catch((err) => {
        setCompanies(null);
        throw err;
      });
  }, []);

  const getCompany = useCallback(async (id) => {
    setLoading(true);
    return CompanyService.getCompanyById(id)
      .then(handleSuccess)
      .then((res) => {
        setCompany(res.data);
        return res.data;
      })
      .catch(handleError)
      .catch((err) => {
        setCompany(null);
        throw err;
      });
  }, []);

  const removeCompany = useCallback(
    async (id) => {
      setLoading(true);
      return CompanyService.removeCompanyById(id)
        .then(handleSuccess)
        .then((res) => {
          getCompanies();
          return res;
        })
        .catch(handleError);
    },
    [getCompanies]
  );

  const updateCompany = useCallback(
    async (id, company) => {
      setLoading(true);
      return CompanyService.updateCompany(id, company)
        .then(handleSuccess)
        .then((res) => {
          setCompany(res);
          getCompanies();
          return res;
        })
        .catch(handleError);
    },
    [getCompanies]
  );

  const createCompany = useCallback(
    async (company) => {
      setLoading(true);
      return CompanyService.createCompany(company)
        .then(handleSuccess)
        .then((res) => {
          getCompanies();
          return res;
        })
        .catch(handleError);
    },
    [getCompanies]
  );

  const getTotalEmissions = useCallback(async (id, year) => {
    setLoading(true);
    return CompanyService.getTotalEmissions(id, year)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsCIIByCompany = useCallback(async (id, params) => {
    setLoading(true);
    const { page, limit, sortBy, order, ...filterParams } = params;
    setFilterParams(filterParams);
    return CompanyService.getVesselsCII(id, params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsCIIKpi = useCallback(async (id, year, type) => {
    setLoading(true);
    return CompanyService.getVesselsCIIKpi(id, year, type)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsEts = useCallback(async (id, params) => {
    setLoading(true);
    const { page, limit, sortBy, order, ...filterParams } = params;
    setFilterParams(filterParams);
    return CompanyService.getVesselsEts(id, params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsEtsChart = useCallback(async (id, year) => {
    setLoading(true);
    return CompanyService.getVesselsEtsChart(id, year)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsCostChart = useCallback(async (id, year) => {
    setLoading(true);
    return CompanyService.getVesselsCostChart(id, year)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsEtsKPI = useCallback(async (id, year) => {
    setLoading(true);
    return CompanyService.getVesselsEtsKPI(id, year)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsCIIChart = useCallback(async (id, year, type) => {
    setLoading(true);
    return CompanyService.getVesselsCIICharts(id, year, type)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsEmissionChart = useCallback(async (id, year, type) => {
    setLoading(true);
    return CompanyService.getVesselsEmissionCharts(id, year, type)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsGhg = useCallback(async (id, params) => {
    setLoading(true);
    const { page, limit, sortBy, order, ...filterParams } = params;
    setFilterParams(filterParams);
    return CompanyService.getVesselsGhg(id, params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsGhgChart = useCallback(async (id, year) => {
    setLoading(true);
    return CompanyService.getVesselsGhgChart(id, year)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselsGhgKPIs = useCallback(async (id, year) => {
    setLoading(true);
    return CompanyService.getVesselsGhgKPIs(id, year)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const exportVesselsCIIAsExcel = useCallback(async (id, params) => {
    setLoading(true);
    return CompanyService.exportVesselsCIIAsExcel(id, params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const exportVesselsCIIAsPdf = useCallback(async (id, params, image) => {
    setLoading(true);
    return CompanyService.exportVesselsCIIAsPdf(id, params, image)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const exportVesselsEtsAsExcel = useCallback(async (id, params) => {
    setLoading(true);
    return CompanyService.exportVesselsEtsAsExcel(id, params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const exportVesselsEtsAsPdf = useCallback(async (id, params, image) => {
    setLoading(true);
    return CompanyService.exportVesselsEtsAsPdf(id, params, image)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const exportVesselsGhgAsExcel = useCallback(async (id, params) => {
    setLoading(true);
    return CompanyService.exportVesselsGhgAsExcel(id, params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const exportVesselsGhgAsPdf = useCallback(async (id, params, image) => {
    setLoading(true);
    return CompanyService.exportVesselsGhgAsPdf(id, params, image)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselOnboardingLinksByCompanyId = useCallback(
    async (company_id) => {
      setLoading(true);
      return VesselOnboardingLinkService.getVesselOnboardingLinksByCompanyId(
        company_id
      )
        .then(handleSuccess)
        .catch(handleError)
        .catch((err) => {
          throw err;
        });
    },
    []
  );

  const createVesselOnboardingLink = useCallback(
    async (vesselOnboardingLinkObj) => {
      setLoading(true);
      return VesselOnboardingLinkService.createVesselOnboardingLink(
        vesselOnboardingLinkObj
      )
        .then(handleSuccess)
        .catch(handleError);
    },
    []
  );

  const deleteVesselOnboardingLink = useCallback(async (imo) => {
    setLoading(true);
    return VesselOnboardingLinkService.deleteVesselOnboardingLink(imo)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getImoList = useCallback(async () => {
    setLoading(true);
    return VesselOnboardingLinkService.getImoList()
      .then(handleSuccess)
      .catch(handleError)
      .catch((err) => {
        throw err;
      });
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        totalCount,
        pagination,
        loading,
        getCompanies,
        getCompaniesList,
        getCompany,
        updateCompany,
        removeCompany,
        createCompany,
        getTotalEmissions,
        getVesselsEts,
        getVesselsEtsKPI,
        getVesselsEtsChart,
        getVesselsCostChart,
        getVesselsCIIKpi,
        getVesselsCIIByCompany,
        getVesselsCIIChart,
        getVesselsEmissionChart,
        getVesselsGhg,
        getVesselsGhgChart,
        getVesselsGhgKPIs,
        exportVesselsCIIAsExcel,
        exportVesselsCIIAsPdf,
        exportVesselsEtsAsExcel,
        exportVesselsEtsAsPdf,
        exportVesselsGhgAsExcel,
        exportVesselsGhgAsPdf,
        filterParams,
        company,
        setCompany,
        getVesselOnboardingLinksByCompanyId,
        createVesselOnboardingLink,
        deleteVesselOnboardingLink,
        getImoList,
      }}
      {...props}
    />
  );
}

function useCompany() {
  const context = React.useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

export { CompanyProvider, useCompany };
