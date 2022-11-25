import React, { useCallback, useState } from 'react';

import * as UserService from '../services/user.service';
import { useSnackbar } from './snack.context';

const UserContext = React.createContext({});

/**
 * @return {null}
 */
function UserProvider(props) {
  const [user, setUser] = useState();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalCount: 0,
    totalPages: 0,
  });
  const [roles, setRoles] = useState();
  const [loading, setLoading] = useState(false);
  const { notify } = useSnackbar();

  const handleSuccess = (res) => {
    setLoading(false);
    return res;
  };

  const handleError = (error) => {
    setLoading(false);
    throw error;
  };

  const getUsers = useCallback(async (search, companyId) => {
    setLoading(true);
    return UserService
      .getUsers(search, companyId)
      .then(handleSuccess)
      .then((res) => {
        setUsers(res.data);
        return res;
      })
      .catch(handleError);
  }, []);

  const getUsersList = useCallback(async (params) => {
    setLoading(true);
    return UserService
      .getUsersList(params)
      .then(handleSuccess)
      .then((res) => {
        const data = res.data;
        setUsers(data.listData);
        setTotalCount(data.totalCount);
        setPagination(data.pagination);
        return res;
      })
      .catch(handleError);
  }, []);

  const getUser = useCallback(async (id) => {
    setLoading(true);
    return UserService
      .getUserById(id)
      .then(handleSuccess)
      .then((res) => {
        setUser(res.data);
        return res;
      })
      .catch(handleError);

  }, []);

  const getRoles = useCallback(async () => {
    setLoading(true);
    return UserService
      .getRoles()
      .then(handleSuccess)
      .then((res) => {
        setRoles(res.data);
        return res.data;
      })
      .catch(handleError);
  }, []);

  const removeUser = useCallback(async (id) => {
    setLoading(true);
    return UserService
      .removeUserById(id)
      .then(handleSuccess)
      .then((res) => {
        notify('Removed successfully.', 'success');
        return res;
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
        setLoading(false);
        throw err;
      })
      .catch(handleError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUser = useCallback(async (id, user) => {
    setLoading(true);
    return UserService
      .updateUser(id, user)
      .then((res) => {
        notify('Updated successfully!');
        setUser(res);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
        setLoading(false);
        throw err;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createUser = useCallback(async (user) => {
    setLoading(true);
    return await UserService.createUser(user)
      .then(() => {
        notify('Created successfully!');
        setLoading(false);
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
        setLoading(false);
        throw err;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestChangePassword = useCallback(async (email) => {
    setLoading(true);
    return await UserService.requestChangePassword(email)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        users,
        pagination,
        totalCount,
        loading,
        roles,
        getUsers,
        getUser,
        getRoles,
        getUsersList,
        updateUser,
        removeUser,
        createUser,
        requestChangePassword,
      }}
      {...props}
    />
  );
}

function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { UserProvider, useUser };
