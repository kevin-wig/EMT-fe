import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { excelParse, excelVesselTripParse } from '../../services/vessel.service';
import { useSnackbar } from '../../context/snack.context';

const PREFIX = 'Dropzone';
const classes = {
  root: `${PREFIX}-root`,
  container: `${PREFIX}-container`,
  area: `${PREFIX}-area`,
  file: `${PREFIX}-file`,
  size: `${PREFIX}-size`,
  name: `${PREFIX}-name`,
  image: `${PREFIX}-image`,
  delete: `${PREFIX}-delete`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {},

  [`& .${classes.container}`]: {
    '&:focus': {
      outline: 'none',
    },
  },

  [`& .${classes.area}`]: {
    flex: 1,
    flexWrap: 'wrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '150px',
    padding: '20px',
    borderWidth: 2,
    borderRadius: '0.5rem',
    borderColor: theme.palette.border.main,
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    cursor: 'pointer',
  },

  [`& .${classes.file}`]: {
    position: 'relative',
    display: 'flex',
    margin: '0.5rem',
    width: '120px',
    height: '120px',
    background: 'linear-gradient(to bottom, #eee, #ddd)',
    borderRadius: '20px',
    color: theme.palette.text.primary,
  },

  [`& .${classes.size}`]: {
    position: 'absolute',
    margin: '0.5rem auto',
    background: theme.palette.surface[3],
    padding: '0 5px',
    top: '1rem',
    left: '50%',
    transform: 'translate(-50%)',
    zIndex: '1',
    pointerEvents: 'none',
  },

  [`& .${classes.name}`]: {
    position: 'absolute',
    margin: '0.5rem auto',
    background: theme.palette.surface[3],
    padding: '0 5px',
    maxWidth: '90px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    top: '3rem',
    left: '50%',
    transform: 'translate(-50%)',
    zIndex: '1',
    pointerEvents: 'none',
  },

  [`& .${classes.image}`]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '5',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: '20px',
    '& img': {
      height: '100%',
      width: 'auto',
    },

    '&:hover': {
      zIndex: '0',
      '& img': {
        filter: 'blur(4px)',
      },
    },
  },

  [`& .${classes.delete}`]: {
    position: 'absolute',
    top: '0.5rem',
    left: '50%',
    transform: 'translate(-50%)',
    zIndex: '10',
    '&:hover': {

    }
  },
}));

const Dropzone = ({
  files,
  onChangeFiles,
  onExcelParse,
  parseType = 'vessel',
}) => {
  const [parsedData, setParseData] = useState();

  const { notify } = useSnackbar();
  const {
    getRootProps,
    getInputProps,
  } = useDropzone({
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (onExcelParse) {
        onExcelParse(acceptedFiles[0])
          .then((res) => {
            setParseData(res.data);
            onChangeFiles(acceptedFiles, res.data);
            notify(res.message);
          })
          .catch((err) => {
            setParseData(null);
            if (err?.response?.data) {
              notify(err.response.data.message, 'error');
            }
          });
      } else {
        if (parseType === 'trip') {
          excelVesselTripParse(acceptedFiles[0])
            .then((res) => {
              setParseData(res.data);
              onChangeFiles(acceptedFiles, res.data);
              notify(res.message);
            })
            .catch((err) => {
              setParseData(null);
              if (err?.response?.data) {
                notify(err.response.data.message, 'error');
              }
            });
        } else {
          excelParse(acceptedFiles[0])
            .then((res) => {
              setParseData(res.data);
              onChangeFiles(acceptedFiles, res.data);
              notify(res.message);
            })
            .catch((err) => {
              setParseData(null);
              if (err?.response?.data) {
                notify(err.response.data.message, 'error');
              }
            });
        }
      }
      onChangeFiles([...files, ...acceptedFiles]);
    },
  });

  const handleClickDeleteFile = (e, index) => {
    e.stopPropagation();
    const updatedFiles = files.filter((file, i) => i !== index);
    onChangeFiles(updatedFiles);
  };

  return (
    <Root className={classes.root}>
      <div {...getRootProps()} className={classes.container}>
        <div className={classes.area}>
          <input {...getInputProps()} />
          {files.length > 0 ? files.map((file, index) => (
            <Tooltip
              key={`${file.type}-${index}`}
              arrow
              title={parsedData
                ? Object.entries(Array.isArray(parsedData) ? parsedData[0] : parsedData)
                  .map((field, index) => (
                      <Typography key={`${field[0]}-${index}`}>
                        {`${field[0]}: ${field[1]}`}
                      </Typography>
                    ),
                  )
                : ''
              }
            >
              <div className={classes.file} key={index}>
                <span className={classes.size}>{(file.size / 1024 / 1024).toFixed(3)}MB</span>
                <span className={classes.name}>{file.name}</span>
                <div className={classes.delete} onClick={(e) => handleClickDeleteFile(e, index)}>
                  <img src="/icons/close.svg" alt="close-icon" />
                </div>
                {file.type?.includes('image') && (
                  <div className={classes.image}>
                    <img src={URL.createObjectURL(file)} alt="file_img" />
                  </div>
                )}
              </div>
            </Tooltip>
          )) : (
            <p>Drop files here to upload</p>
          )}
        </div>
      </div>
    </Root>
  );
};

export default Dropzone;
