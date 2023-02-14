import React, { useCallback, useState } from 'react';

import * as VesselsService from '../services/vessel.service';
import { useSnackbar } from './snack.context';

const VesselContext = React.createContext({});

/**
 * @return {null}
 */
function VesselProvider(props) {
  const { notify } = useSnackbar();

  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [vessels, setVessels] = useState([]);
  const [ports, setPorts] = useState([]);
  const [vesselLists, setVesselLists] = useState([]);
  const [vesselTypes, setVesselTypes] = useState([]);
  const [fuels, setFuels] = useState([]);
  const [reportOptions, setReportOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleSuccess = (res) => {
    setLoading(false);
    return res;
  };

  const handleError = (error) => {
    setLoading(false);
    throw error;
  };

  const getVessels = useCallback(async (params) => {
    setLoading(true);
    return VesselsService
      .getVessels(params)
      .then(handleSuccess)
      .then((res) => {
        if (params !== -1 && params !== undefined) {
          const filtered = res.data.filter(a => {
            return a.companyId === params;
          });
          setVessels(filtered);
          return res;
        }
        setVessels(res.data);
        return res;
      })
      .catch(handleError);
  }, []);

  const getVesselsList = useCallback(async (params) => {
    setLoading(true);
    return VesselsService
      .getVesselsList(params)
      .then(handleSuccess)
      .then((res) => {
        const data = res.data;
        setVesselLists(data.listData);
        setTotalCount(data.totalCount);
        setPagination(data.pagination);
        return res;
      })
      .catch(handleError);
  }, []);

  const getVessel = useCallback(async (id) => {
    setLoading(true);
    return VesselsService
      .getVesselById(id)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselCII = useCallback(async (id, year, month, mode, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .getVesselCII({ id, year, month, mode, fromDate, toDate })
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselCIIKpiData = useCallback(async (id, year) => {
    setLoading(true);
    return VesselsService
      .getVesselCIIKpi({ id, year })
      .then(handleSuccess)
      .then((res) => (
        res.data
      ))
      .catch(handleError);
  }, []);

  const getVoyageCIIChart = useCallback(async (params, level) => {
    setLoading(true);
    return VesselsService
      .getVoyageCIIChart({ ...params, level })
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVoyageETSChart = useCallback(async (params) => {
    setLoading(true);
    return VesselsService
      .getVoyageETSChart(params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVoyageETSEuaCostChart = useCallback(async (params) => {
    setLoading(true);
    return VesselsService
      .getVoyageETSEuaCostChart(params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVoyageETSEuaPercentChart = useCallback(async (params) => {
    setLoading(true);
    return VesselsService
      .getVoyageETSEuaPercentChart(params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);


  const getVoyageStackChart = useCallback(async (params) => {
    setLoading(true);
    return VesselsService
      .getVoyageStackChart(params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);


  const getVesselCIIChart = useCallback(async (id, year, month, mode, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .getVesselCIIChart({ id, year, month, mode, fromDate, toDate })
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselCIIChartPerTrip = useCallback(async (id, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .getVesselCIIChartPerTrip(id, fromDate, toDate)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselStackChartPerVoyage = useCallback(async (id, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .getVesselStackChartPerVoyage({ id, fromDate, toDate })
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselFuelChartPerVoyage = useCallback(async (id, params) => {
    setLoading(true);
    return VesselsService
      .getVesselFuelChartPerVoyage(id, params)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselEts = useCallback(async (id, mode, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .getEts(id, mode, fromDate, toDate)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselEtsKpi = useCallback(async (id, year) => {
    setLoading(true);
    return VesselsService
      .getEtsKpi(id, year)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselEtsCostChart = useCallback(async (id, year, mode, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .getEtsCostChart(id, year, mode, fromDate, toDate)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselEtsPerVoyageChart = useCallback(async (id, year, mode, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .getVesselEtsPerVoyageChart(id, year, mode, fromDate, toDate)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getVesselEtsEuaPercentChart = useCallback(async (id, year, mode, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .getEtsEuaPercentChart(id, year, mode, fromDate, toDate)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const removeVessel = useCallback(async (id) => {
    setLoading(true);
    return VesselsService
      .removeVesselById(id)
      .then((res) => {
        getVessels();
        return res;
      })
      .then(handleSuccess)
      .catch(handleError);
  }, [getVessels]);

  const updateVessel = useCallback(async (id, vessel) => {
    setLoading(true);
    return VesselsService
      .updateVessel(id, vessel)
      .then(() => getVessels())
      .then(handleSuccess)
      .catch(handleError);
  }, [getVessels]);

  const createVessel = useCallback(async (vessel) => {
    setLoading(true);
    return await VesselsService.createVessel(vessel)
      .then(() => getVessels())
      .then(handleSuccess)
      .catch(handleError);
  }, [getVessels]);

  const createVessels = useCallback(async (vessels) => {
    setLoading(true);
    return await VesselsService.createVessels(vessels)
      .then(() => getVessels())
      .then(handleSuccess)
      .catch(handleError);
  }, [getVessels]);

  const createVesselTrip = useCallback(async (data, aggregate) => {
    setLoading(true);
    return await VesselsService.createVesselTrip(data, aggregate)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const updateVesselTrip = useCallback(async (id, data) => {
    setLoading(true);
    return await VesselsService.updateVesselTrip(id, data)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const removeVesselTrip = useCallback(async (id) => {
    setLoading(true);
    return await VesselsService.removeVesselTripById(id)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const createVesselTrips = useCallback(async (data) => {
    setLoading(true);
    return await VesselsService.createVesselTrips(data)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getFuels = useCallback(async () => {
    setLoading(true);
    return await VesselsService.getFuels()
      .then(handleSuccess)
      .then((res) => setFuels(res.data))
      .catch((err) => {
        setFuels([]);
        throw err;
      })
      .catch(handleError);
  }, []);

  const getVesselTypes = useCallback(async () => {
    setLoading(true);
    return await VesselsService.getVesselTypes()
      .then(handleSuccess)
      .then((res) => {
        setVesselTypes(res.data.filter((a) => a.id !== 4));
      })
      .catch((err) => {
        setVesselTypes([]);
        throw err;
      })
      .catch(handleError);
  }, []);

  const getPorts = useCallback(async (params) => {
    setLoading(true);
    return VesselsService
      .getPorts(params)
      .then(handleSuccess)
      .then((res) => {
        setPorts(res.data);
        return res;
      })
      .catch(handleError);
  }, []);

  const getTrips = useCallback(async (params) => {
    return await VesselsService.getTrips({ ...params, allType: true });
  }, []);

  const getVoyagesByVesselId = useCallback(async (vesselId, journeyType, fromDate, toDate) => {
    setLoading(true);
    return await VesselsService
      .getVoyagesByVesselId(vesselId, { journeyType, fromDate, toDate })
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const getTripsByVesselId = useCallback(async (vesselId, params) => {
    return await VesselsService.getTrips({ ...params, vesselId });
  }, []);

  const getTripById = useCallback(async (id) => {
    return await VesselsService.getTripById(id);
  }, []);

  const getEtsPerVoyage = useCallback(async (id) => {
    return VesselsService
      .getEtsPerVoyage(id)
      .then(handleSuccess);
  }, []);

  const exportVoyageAsExcel = async (searchOptions) => {
    setLoading(true);
    return VesselsService
      .exportVoyageAsExcel(searchOptions)
      .then(handleSuccess)
      .catch(handleError);
  };

  const exportVoyageAsPdf = async (screenshot, searchOptions) => {
    setLoading(true);
    return VesselsService
      .exportVoyageAsPdf(screenshot, searchOptions)
      .then(handleSuccess)
      .catch(handleError);
  };

  const getReport = useCallback(async (params, chartYear, isVoyage) => {
    return await VesselsService.getReport(params, chartYear, isVoyage).catch((err) => {
      notify('Failed to get report. Please make sure that options are correct!', 'error');
      throw err;
    });
  }, [notify]);

  const getReportVessels = useCallback(async (params) => {
    return await VesselsService.getReportVessels(params);
  }, []);

  const getGhg = useCallback(async (id, year) => {
    setLoading(true);
    return await VesselsService.getGhg(id, year)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const exportReportsAsExcel = async () => {
    setLoading(true);
    return VesselsService
      .exportReportsAsExcel(reportOptions)
      .then(handleSuccess)
      .catch(handleError);
  };

  const exportReportsAsPdf = async (screenshots) => {
    setLoading(true);
    return VesselsService
      .exportReportsAsPdf(screenshots)
      .then(handleSuccess)
      .catch(handleError);
  };

  const exportCiiAsExcel = async (id, mode, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .exportCiiAsExcel(id, mode, fromDate, toDate)
      .then(handleSuccess)
      .catch(handleError);
  };

  const exportEtsAsExcel = async (id, mode, fromDate, toDate) => {
    setLoading(true);
    return VesselsService
      .exportEtsAsExcel(id, mode, fromDate, toDate)
      .then(handleSuccess)
      .catch(handleError);
  };

  const exportCiiAsPdf = async (id, screenshot, mode) => {
    setLoading(true);
    return VesselsService
      .exportCiiAsPdf(id, screenshot, mode)
      .then(handleSuccess)
      .catch(handleError);
  };

  const exportEtsAsPdf = async (id, screenshots, mode) => {
    setLoading(true);
    return VesselsService
      .exportEtsAsPdf(id, screenshots, mode)
      .then(handleSuccess)
      .catch(handleError);
  };

  const updateReportedOptions = (id, option) => {
    setReportOptions(
      reportOptions.map((reportOption) => reportOption.id === id ? { id, ...option } : reportOption),
    );
  };

  const addReportedOptions = (id, option) => {
    if (reportOptions.find((reportOption) => reportOption.id === id)) {
      updateReportedOptions(id, option);
    } else {
      setReportOptions(
        [...reportOptions, { id, ...option }],
      );
    }
  };

  const removeReportedOptions = (id) => {
    if (reportOptions.find((reportOption) => reportOption.id === id)) {
      setReportOptions(
        reportOptions.filter((reportOption) => reportOption.id !== id),
      );
    }
  };

  return (
    <VesselContext.Provider
      value={{
        totalCount,
        pagination,
        vessels,
        ports,
        vesselLists,
        fuels,
        reportOptions,
        loading,
        getVessels,
        getVessel,
        getVesselsList,
        vesselTypes,
        getVesselTypes,
        updateVessel,
        removeVessel,
        createVessel,
        createVessels,
        createVesselTrips,
        createVesselTrip,
        updateVesselTrip,
        getVoyageCIIChart,
        getVoyageStackChart,
        getVoyageETSChart,
        getVoyageETSEuaCostChart,
        getVoyageETSEuaPercentChart,

        getVesselCII,
        getVesselCIIChart,
        getVesselCIIChartPerTrip,
        getVesselCIIKpiData,
        getVesselStackChartPerVoyage,
        getVesselFuelChartPerVoyage,
        getVesselEts,
        getEtsPerVoyage,
        getVesselEtsPerVoyageChart,

        getVesselEtsKpi,
        getVesselEtsCostChart,
        getVesselEtsEuaPercentChart,
        getPorts,
        getTrips,
        getTripsByVesselId,
        getVoyagesByVesselId,
        getGhg,
        getFuels,
        getReport,
        getReportVessels,
        getTripById,
        exportReportsAsExcel,
        exportReportsAsPdf,
        exportCiiAsPdf,
        exportCiiAsExcel,
        exportEtsAsPdf,
        exportEtsAsExcel,
        updateReportedOptions,
        addReportedOptions,
        removeReportedOptions,
        removeVesselTrip,
        exportVoyageAsExcel,
        exportVoyageAsPdf,

        selectedYear,
        setSelectedYear,
      }}
      {...props}
    />
  );
}

function useVessel() {
  const context = React.useContext(VesselContext);
  if (context === undefined) {
    throw new Error('useVessel must be used within a VesselProvider');
  }
  return context;
}

export { VesselProvider, useVessel };
