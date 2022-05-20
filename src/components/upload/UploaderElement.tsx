import * as React from 'react';
import classnames from 'classnames';
import ArrowCircleUpOutlinedIcon from '@mui/icons-material/ArrowCircleUpOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import bytes from 'bytes';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import copy from 'copy-text-to-clipboard';
import path from 'path-browserify';
import { SkynetClient } from 'skynet-js';
import { useTimeoutFn } from 'react-use';
import ms from 'ms';
import Link from '@mui/material/Link';
import { useFileManager } from '../../contexts';
import { useSkynetManager } from '../../contexts';
import { ChonkyIconName } from '@skynethubio/web3-file-explorer';
import { makeStyles } from '@mui/styles';
import apiConstant from '../../constants/apiConstant';
import {
  Typography,
  CircularProgress,
  ListItemText,
  Button,
  Stack,
  ListItemIcon,
  styled,
  Paper,
  ListItemButton,
  LinearProgress,
  Card,
  CardHeader,
  CardContent
} from '@mui/material';
import { Icon } from '@iconify/react';

const getFilePath = (file) => file.webkitRelativePath || file.path || file.name;
const getRelativeFilePath = (file) => {
  const filePath = getFilePath(file);
  const { root, dir, base } = path.parse(filePath);
  const relative = path.normalize(dir).slice(root.length).split(path.sep).slice(1);
  return path.join(...relative, base);
};
const createUploadErrorMessage = (error) => {
  // The request was made and the server responded with a status code that falls out of the range of 2xx
  if (error.response) {
    if (error.response.data.message) {
      return `Upload failed with error: ${error.response.data.message}`;
    }
    const statusCode = error.response.status;
    const statusText = getReasonPhrase(error.response.status);
    return `Upload failed, our server received your request but failed with status code: ${statusCode} ${statusText}`;
  }
  // The request was made but no response was received. The best we can do is detect whether browser is online.
  // This will be triggered mostly if the server is offline or misconfigured and doesn't respond to valid request.
  if (error.request) {
    if (!navigator.onLine) {
      return 'You are offline, please connect to the internet and try again';
    }
    // TODO: We should add a note "our team has been notified" and have some kind of notification with this error.
    return 'Server failed to respond to your request, please try again later.';
  }
  // Match the error message to a message returned by TUS when upload exceeds max file size
  const matchTusMaxFileSizeError = error.message.match(
    /upload exceeds maximum size: \d+ > (?<limit>\d+)/
  );
  if (matchTusMaxFileSizeError) {
    return `File exceeds size limit of ${bytes(
      parseInt(matchTusMaxFileSizeError.groups.limit, 10)
    )}`;
  }
  // TODO: We should add a note "our team has been notified" and have some kind of notification with this error.
  return `Critical error, please refresh the application and try again. ${error.message}`;
};
//const client = new SkynetClient("https://skynetpro.net");
//const client = new SkynetClient("https://siasky.net");
const apiUrl = apiConstant.apiUrl;
const SKYNET_JWT = apiConstant.SKYNET_JWT;
const client = new SkynetClient(apiUrl, { customCookie: SKYNET_JWT });

//export default function UploaderElement({upload}) {

/*  const StatusIcon = styled(Icon)({
   width: 40,
   height: 40,
 }); */
const useStyles = makeStyles((theme) => ({
  successIcon: {
    color: theme.palette.success.main,
    width: 40,
    height: 40,
  },
  errorIcon: {
    color: theme.palette.error.main,
    width: 40,
    height: 40,
  },
  errorProgress: {
    backgroundColor: theme.palette.error.main
  },
  statusQueued: {
    color: theme.palette.grey[500],
    width: 40,
    height: 40
  },
  enqueuedProgress: {
    backgroundColor: theme.palette.grey[500]
  },
}));
export default function UploaderElement({ upload, folderPath, open }) {
  const classes = useStyles();
  const [absolutePath, setAbsolutePath] = React.useState(upload.absoluteFolderPath);
  const [screenWidth, setScreenWidth] = React.useState(window.screen.availWidth);
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));
  const [copied, setCopied] = React.useState(false);
  const [, , reset] = useTimeoutFn(() => setCopied(false), ms('3 seconds'));
  const [retryTimeout, setRetryTimeout] = React.useState(ms('3 seconds')); // retry delay after "429: TOO_MANY_REQUESTS"
  const { createFile1 } = useFileManager();
  const { uploads, onUploadStateChange } = useSkynetManager();
  const handleCopy = (url) => {
    copy(url);
    setCopied(true);
    reset();
  };
  React.useEffect(() => {
    if (upload.status === 'uploading' && !upload.startedTime) {
      onUploadStateChange(upload.id, { startedTime: Date.now() });
      (async () => {
        const onUploadProgress = (progress: number) => {
          const status = progress === 1 ? 'processing' : 'uploading';
          onUploadStateChange(upload.id, { status, progress });
        };
        try {
          let response;
          if (upload.mode === 'directory') {
            const files = upload.file.files;
            const directory = files.reduce(
              (acc, file) => ({ ...acc, [getRelativeFilePath(file)]: file }),
              {}
            );
            console.log('Directory -->' + JSON.stringify(directory))
            const name = encodeURIComponent(upload.name);
            //response = await client.uploadDirectory(directory, name,{onUploadProgress});
            //response = await createFile1("/localhost/",upload.file,upload.file.name,onUploadProgress);
            response = await createFile1(folderPath, directory, name, onUploadProgress);
          } else {
            //response = await client.uploadFile(upload.file, { onUploadProgress });
            response = await createFile1(folderPath, upload.file, upload.file.name, onUploadProgress);
          }
          const url = await client.getSkylinkUrl(response.url, {
            subdomain: upload.mode === 'directory'
          });
          // We get result that means file is uploaded successfully.
          // TODO: check result object for success
          onUploadStateChange(upload.id, { status: 'complete', url, fileData: response });
          //onUploadComplete(upload.id);
          console.log("Upload Size " + uploads?.length);
        } catch (error) {
          if (error?.response?.status === StatusCodes.TOO_MANY_REQUESTS) {
            onUploadStateChange(upload.id, { status: 'retrying', progress: 0 });
            setTimeout(() => {
              onUploadStateChange(upload.id, { status: 'enqueued', startedTime: null });
              setRetryTimeout((timeout) => timeout * 2); // increase timeout on next retry
            }, retryTimeout);
          } else {
            onUploadStateChange(upload.id, {
              status: 'error',
              error: createUploadErrorMessage(error)
            });
          }
        }
      })();
    }
    // if (upload.status === 'complete')
    // {
    //   console.log("uploads "+uploads.length);
    //   onUploadComplete(upload.id);
    // }
  }, [onUploadStateChange, upload, retryTimeout]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
        return;
    }
    function autoResize() {
        setScreenWidth(window.screen.availWidth);
    }
    window.addEventListener('resize', autoResize);
    // This is likely unnecessary, as the initial state should capture
    // the size, however if a resize occurs between initial state set by
    // React and before the event listener is attached, this
    // will just make sure it captures that.
    autoResize();
    // Return a function to disconnect the event listener
    return () => window.removeEventListener('resize', autoResize);
}, [])

  const ellipsisAbsolutePath = () => {
    if (screenWidth < 420 && upload.absoluteFolderPath.length > 36) {
      setAbsolutePath(upload.absoluteFolderPath.substr(upload.absoluteFolderPath.length-33, upload.absoluteFolderPath.length));
    } else if (screenWidth > 400 && screenWidth < 767 && upload.absoluteFolderPath.length > 71) {
      setAbsolutePath(upload.absoluteFolderPath.substr(upload.absoluteFolderPath.length-68, upload.absoluteFolderPath.length));
    } else if (screenWidth > 767 && screenWidth < 1024 && upload.absoluteFolderPath.length > 91) {
      setAbsolutePath(upload.absoluteFolderPath.substr(upload.absoluteFolderPath.length-85, upload.absoluteFolderPath.length));
    } else if (screenWidth >  1024 && upload.absoluteFolderPath.length > 75){
      setAbsolutePath(upload.absoluteFolderPath.substr(upload.absoluteFolderPath.length-72, upload.absoluteFolderPath.length));
    } else {
      setAbsolutePath(upload.absoluteFolderPath);
    }
  }

  React.useEffect(() => {
    console.log(screenWidth, absolutePath);
    ellipsisAbsolutePath();
  }, [open, screenWidth]);

  return (
    <Card sx={{ borderRadius: 0 }}>
      <CardContent sx={{ padding: 0 }}>
        <Item>
          <ListItemButton>
            <ListItemIcon>
              {(upload.status === 'retrying' || upload.status === 'uploading' || upload.status === 'processing') && <CircularProgress />}
              {upload.status === 'enqueued' && <Icon icon="clarity:alarm-clock-line" className={classes.statusQueued} />}
              {upload.status === 'complete' && <Icon icon="teenyicons:tick-circle-outline" className={classes.successIcon} />}
              {upload.status === 'error' && <Icon icon="ant-design:exclamation-circle-outlined" className={classes.errorIcon} />}
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" color="text.secondary">
                {upload.status === 'uploading' && (
                  <span>Uploading {bytes(upload.file.size * upload.progress)} of {bytes(upload.file.size)}</span>
                )}
                {upload.status === 'enqueued' && (<span>Upload in queue, please wait</span>)}
                {upload.status === 'processing' && (<span>Processing...</span>)}
                {upload.status === 'complete' &&
                  (<Link
                    href={upload.url}
                    underline="hover"
                    color="inherit"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {upload.url}
                  </Link>)}
                {upload.status === 'error' && (<span>upload.error && {upload.error}</span>)}
                {upload.status === 'retrying' && (<span>Too many parallel requests, retrying in {retryTimeout / 1000} seconds</span>)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {upload.status === 'uploading' && (<span>{Math.floor(upload.progress * 100)}% completed</span>)}
                {upload.status === 'processing' && <span>Wait </span>}
                {upload.status === 'complete' && (
                  <Button onClick={() => handleCopy(upload.url)}>
                    <span className={classnames({ hidden: copied, 'hidden desktop:inline': !copied })}>
                      Copy link
                    </span>
                    <span className={classnames({ hidden: copied, 'inline desktop:hidden': !copied })}>
                      Copy
                    </span>
                    <span className={classnames({ hidden: !copied })}>Copied</span>
                  </Button>)}
              </Typography>
              {(upload.status === 'retrying' || upload.status === 'uploading' || upload.status === 'processing') && <LinearProgress />}
              {upload.status === 'enqueued' && <LinearProgress variant="determinate" value={0} className={classes.enqueuedProgress} />}
              {upload.status === 'complete' && <LinearProgress variant="determinate" value={100} className={classes.successIcon} />}
              {upload.status === 'error' && <LinearProgress variant="determinate" value={0} className={classes.errorProgress} />}
              <Typography variant="body2" color="text.secondary">
                {upload.absoluteFolderPath !== absolutePath ? `...${absolutePath}` : upload.absoluteFolderPath }
              </Typography>
            </ListItemText>
          </ListItemButton>
          <Typography variant="body2" color="text.secondary">
            <div
              className={classnames('flex bg-palette-200 mt-1', {
                'bg-error-dashed opacity-20': upload.status === 'error',
                'bg-primary-dashed move opacity-20': upload.status === 'processing'
              })}
              style={{ height: '5px' }}
            >
              <div
                style={{ width: `${Math.floor(upload.progress * 100)}%` }}
                className={classnames('bg-primary', {
                  hidden: upload.status === 'processing' || upload.status === 'error'
                })}
              />
            </div>
          </Typography>
        </Item>
      </CardContent>
    </Card>
  );
}
