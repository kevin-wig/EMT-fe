import React, { useCallback, useState } from 'react';

import * as FleetService from '../services/fleet.service';

const FleetContext = React.createContext({});

/**
 * @return {null}
 */
function FleetProvider(props) {
  const [fleets, setFleets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSuccess = (res) => {
    setLoading(false);
    return res;
  };

  const handleError = (error) => {
    setLoading(false);
    throw error;
  };

  const getFleets = useCallback(async () => {
    setLoading(true);
    return FleetService
      .getFleets()
      .then(handleSuccess)
      .then((res) => {
        setFleets(res.data);
        return res;
      })
      .catch(handleError);
  }, []);

  const getFleetsList = useCallback(async (params) => {
    setLoading(true);
    return FleetService
      .getFleetsList(params)
      .then(handleSuccess)
      .then((res) => {
        const data = res.data;
        setFleets(data.listData);
        setTotalCount(data.totalCount);
        setPagination(data.pagination);
        return res;
      })
      .catch(handleError);
  }, []);

  const getFleet = useCallback(async (id) => {
    setLoading(true);
    return FleetService
      .getFleetById(id)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  const removeFleet = useCallback(async (id) => {
    setLoading(true);
    return FleetService
      .removeFleetById(id)
      .then(handleSuccess)
      .then((res) => {
        getFleets();
        return res;
      })
      .catch(handleError);
  }, [getFleets]);

  const updateFleet = useCallback(async (id, fleet) => {
    setLoading(true);
    return FleetService
      .updateFleet(id, fleet)
      .then(handleSuccess)
      .then(() => getFleets())
      .catch(handleError);
  }, [getFleets]);

  const createFleet = useCallback(async (fleet) => {
    setLoading(true);
    return await FleetService.createFleet(fleet)
      .then(handleSuccess)
      .then(() => getFleets())
      .catch(handleError);
  }, [getFleets]);

  const createFleetVessel = useCallback(async (id, vessel) => {
    setLoading(true);
    return await FleetService.createFleetVessel(id, vessel)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  return (
    <FleetContext.Provider
      value={{
        fleets,
        pagination,
        totalCount,
        loading,
        getFleets,
        getFleetsList,
        getFleet,
        updateFleet,
        removeFleet,
        createFleet,
        createFleetVessel,
      }}
      {...props}
    />
  );
}

function useFleet() {
  const context = React.useContext(FleetContext);
  if (context === undefined) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
}

export { FleetProvider, useFleet };
