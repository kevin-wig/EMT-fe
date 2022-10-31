import React from 'react';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

const PREFIX = 'Modal';
const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  filter: `${PREFIX}-filter`,
  actions: `${PREFIX}-actions`,
  title: `${PREFIX}-title`,
};

const Root = styled(Dialog)(({ theme }) => ({
  [`&.${classes.root}`]: {
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(2),
      justifyContent: 'space-between',
    },
    '& .MuiDialogTitle-root': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1rem',
      fontWeight: 'bold',
      padding: theme.spacing(2),
    },
  },
  [`& .${classes.content}`]: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    display: 'flex',
    flexDirection: 'column',
    borderTop: 'none',
    borderBottom: 'none',
  },
  [`& .${classes.actions}`]: {
    display: 'flex',
    justifyContent: 'flex-end !important'
  },
  [`& .${classes.title}`]: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
}));

const Modal = ({
  open,
  handleCloseModal,
  title,
  children,
}) => {
  return (
    <Root
      className={classes.root}
      open={open}
      onClose={() => handleCloseModal(false)}
      maxWidth="xs"
      fullWidth
    >
      {title && (
        <DialogTitle>
          <Typography className={classes.title}>
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => handleCloseModal(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent dividers className={classes.content}>
        {children}
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => handleCloseModal(false)}
        >
          Cancel
        </Button>
        <Button variant="contained" onClick={() => handleCloseModal(true)}>Ok</Button>
      </DialogActions>
    </Root>
  );
};

export default Modal;
