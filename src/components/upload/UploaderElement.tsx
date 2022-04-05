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
import { Typography, CircularProgress, ListItemText, Button, Stack, ListItemIcon, styled, Paper } from '@mui/material';

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
const client = new SkynetClient("https://siasky.net");

  //export default function UploaderElement({upload}) {
  export default function UploaderElement({upload,folderPath}) {
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
  const {uploads, onUploadStateChange} = useSkynetManager();
  const handleCopy = (url) => {
    copy(url);
    setCopied(true);
    reset();
  };
  React.useEffect(() => {
    if (upload.status === 'uploading' && !upload.startedTime) {
      onUploadStateChange(upload.id, {startedTime: Date.now()});
      (async () => {
        const onUploadProgress = (progress : number ) => {
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
            console.log('Directory -->'+JSON.stringify(directory))
            const name = encodeURIComponent(upload.name);
            //response = await client.uploadDirectory(directory, name,{onUploadProgress});
            //response = await createFile1("/localhost/",upload.file,upload.file.name,onUploadProgress);
            response = await createFile1(folderPath,directory,name,onUploadProgress);
          } else {
            //response = await client.uploadFile(upload.file, { onUploadProgress });
            response = await createFile1(folderPath,upload.file,upload.file.name,onUploadProgress);
          }
          const url = await client.getSkylinkUrl(response.url, {
            subdomain: upload.mode === 'directory'
          });
          // We get result that means file is uploaded successfully.
          // TODO: check result object for success
          onUploadStateChange(upload.id, { status: 'complete', url , fileData: response});
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

  return (
      <Stack spacing={2}>
        <Item>
          <ListItemIcon>
            {upload.status === 'enqueued' &&  <CircularProgress />}
            {upload.status === 'retrying' && <CircularProgress />}
            {upload.status === 'uploading' && <CircularProgress />}
            {upload.status === 'processing' && <CircularProgress />}
            {upload.status === 'complete' && <CircularProgress />}
            {upload.status === 'error' && <CircularProgress />}
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
          </ListItemText>
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
      </Stack>
  );
}