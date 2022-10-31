import React, { useState, useEffect } from 'react';

const SnackContext = React.createContext({});

/**
 * @return {null}
 */
function NotifyProvider(props) {
  const [status, setStatus] = useState();
  const [snackPack, setSnackPack] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [messageInfo, setMessageInfo] = React.useState(undefined);

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  const handleClose = () => setOpen(false);

  const notify = (notification, variant) => {
    setStatus(variant);
    setSnackPack((prev) => [...prev, { message: notification, key: new Date().getTime() }]);
    setOpen(true);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  return (
    <SnackContext.Provider
      value={{
        notify,
        handleClose,
        handleExited,
        messageInfo,
        status,
        open,
      }}
      {...props}
    />
  );
}

function useSnackbar() {
  const context = React.useContext(SnackContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a NotifyProvider');
  }
  return context;
}

export { NotifyProvider, useSnackbar };
