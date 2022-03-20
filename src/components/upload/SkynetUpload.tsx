import React, {
  useCallback,
  useState,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import HttpStatus from "http-status-codes";
import bytes from "bytes";
import Grid from "@mui/material/Grid";
import path from "path-browserify";
import Snackbar from "@mui/material/Snackbar";
import { useDropzone } from "react-dropzone";
import MuiAlert from "@mui/material/Alert";
import { SkynetClient, parseSkylink } from "skynet-js";
import SkynetUploadStatus from "./SkynetUploadStatus";
import imageCompression from "browser-image-compression";
//import "./upload.css";
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
export const getCompressedImageFile = async (originalFile) =>
  await imageCompression(originalFile, {
    maxSizeMB: 1,
    maxWidthOrHeight: 256,
    useWebWorker: true,
  });

/**
 * Generates thumbnail image file out of the first frame of the video file.
 *
 * @param {Object} Object
 * @param {string?} Object.url - The video source Url.
 * @param {string?} Object.file - Optional video file object reference. If the Url s not provided,
 * then this property must have a value. If the url does have a valu then this property will be ignored.
 */

export const generateThumbnailFromVideo = async ({ file, url }) => {
  let videoResolve = null;
  const videoPromise = new Promise((resolve) => {
    videoResolve = resolve;
  });
  let video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.src = url ? url : URL.createObjectURL(file);
  console.log("video.src", video.src);
  video.onloadeddata = videoResolve;
  video.load();
  await videoPromise;
  const videoThumbnail = await videoToImg(video);
  return videoThumbnail;
};

/**
 * Takes a video element and that has image already loaded and returns an image file which is a thumbnail
 * generated out of the first frame of the video
 *
 * @param {Element} video Video Element.
 */

export const videoToImg = async (video) => {
  let canvas = document.createElement("canvas");
  let w = video.videoWidth;
  let h = video.videoHeight;
  canvas.width = w;
  canvas.height = h;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);
  let file = await imageCompression.canvasToFile(
    canvas,
    "image/jpeg",
    "thumbnail.jpeg",
    new Date().getTime()
  );
  return file;
};
const SkynetUpload = React.forwardRef((props: any, ref) => {
  const [files, setFiles] = useState([]);
  const [uploadErr, setUploadErr] = useState(false);
  const [isDir, setIsDir] = useState(false);
  //const apiUrl = props.portal != null ? props.portal : "https://skynetpro.net";
  const gridRef = useRef();
  const apiUrl = props.portal != null ? props.portal : "https://siasky.net";
  const client = new SkynetClient(apiUrl);

  useEffect(() => {
    handleDrop(props.droppedFiles);
  }, [props.droppedFiles]);

  useEffect(() => {
    props.onUploadProgress && props.onUploadProgress(files);
  }, [files]);

  useEffect(() => {
    if (props.directoryMode || isDir) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    } else {
      inputRef.current.removeAttribute("webkitdirectory");
    }
  }, [props.directoryMode, isDir]);

  const getFilePath = (file) =>
    file.webkitRelativePath || file.path || file.name;

  const getRelativeFilePath = (file) => {
    const filePath = getFilePath(file);
    const { root, dir, base } = path.parse(filePath);
    const relative = path
      .normalize(dir)
      .slice(root.length)
      .split(path.sep)
      .slice(1);

    return path.join(...relative, base);
  };

  const getRootDirectory = (file) => {
    const filePath = getFilePath(file);
    const { root, dir } = path.parse(filePath);

    return path.normalize(dir).slice(root.length).split(path.sep)[0];
  };

  const createUploadErrorMessage = (error) => {
    // The request was made and the server responded with a status code that falls out of the range of 2xx
    if (error.response) {
      if (error.response.data.message) {
        return `Upload failed with error: ${error.response.data.message}`;
      }

      const statusCode = error.response.status;
      const statusText = HttpStatus.getStatusText(error.response.status);

      return `Upload failed, our server received your request but failed with status code: ${statusCode} ${statusText}`;
    }

    // The request was made but no response was received. The best we can do is detect whether browser is online.
    // This will be triggered mostly if the server is offline or misconfigured and doesn't respond to valid request.
    if (error.request) {
      if (!navigator.onLine) {
        return "You are offline, please connect to the internet and try again";
      }

      // TODO: We should add a note "our team has been notified" and have some kind of notification with this error.
      return "Server failed to respond to your request, please try again later.";
    }

    // TODO: We should add a note "our team has been notified" and have some kind of notification with this error.
    return `Critical error, please refresh the application and try again. ${error.message}`;
  };

  const handleDrop = async (acceptedFiles) => {
    if ((props.directoryMode || isDir) && acceptedFiles.length) {
      const rootDir = getRootDirectory(acceptedFiles[0]); // get the file path from the first file

      acceptedFiles = [
        { name: rootDir, directory: true, files: acceptedFiles },
      ];
    }

    setFiles((previousFiles) => [
      ...acceptedFiles.map((file) => ({ file, status: "uploading" })),
      ...previousFiles,
    ]);

    const onFileStateChange = (file, state) => {
      setFiles((previousFiles) => {
        const index = previousFiles.findIndex((f) => f.file === file);
        return [
          ...previousFiles.slice(0, index),
          {
            ...previousFiles[index],
            ...state,
          },
          ...previousFiles.slice(index + 1),
        ];
      });
    };

    await acceptedFiles.reduce(async (memo, file) => {
      await memo;
      // Reject files larger than our hard limit of 1 GB with proper message
      if (file.size > bytes("1 GB")) {
        onFileStateChange(file, {
          status: "error",
          error: "This file size exceeds the maximum allowed size of 1 GB.",
        });

        return;
      }
      props.onUploadStart && props.onUploadStart();
      const fileType = file.type;
      let resForCompressed = null;
      // if (fileType && fileType.startsWith("image")) {
      //   const compressedFile = await getCompressedImageFile(file);
      //   resForCompressed = await client.uploadFile(compressedFile);
      // }
      // if (fileType && fileType.startsWith("video")) {
      //   const videoThumbnail = await generateThumbnailFromVideo({file, url:null});
      //   resForCompressed = await client.uploadFile(videoThumbnail);
      // }
      const onUploadProgress = (progress) => {
        const status = progress === 1 ? "processing" : "uploading";
        onFileStateChange(file, { status, progress });
      };

      const upload = async () => {
        try {
          let response;
          if (file.directory) {
            const directory = file.files.reduce(
              (acc, file) => ({ ...acc, [getRelativeFilePath(file)]: file }),
              {}
            );

            response = await client.uploadDirectory(
              directory,
              encodeURIComponent(file.name),
              { onUploadProgress }
            );
          } else {
            response = await client.uploadFile(file, { onUploadProgress });
          }
          await props.onUpload({
            skylink: parseSkylink(response.skylink),
            name: file.name,
            contentType: fileType,
            thumbnail:
              resForCompressed != null ? parseSkylink(resForCompressed) : null,
            contentLength: file.size,
          });
          onFileStateChange(file, {
            status: "complete",
            url: await client.getSkylinkUrl(response.skylink),
          });
          props.onUploadEnd && props.onUploadEnd();
          //send event to parent
        } catch (error) {
          if (
            error.response &&
            error.response.status === HttpStatus.TOO_MANY_REQUESTS
          ) {
            onFileStateChange(file, { progress: -1 });

            return new Promise((resolve) =>
              setTimeout(() => resolve(upload()), 3000)
            );
          }
          onFileStateChange(file, {
            status: "error",
            error: createUploadErrorMessage(error),
          });
          setUploadErr(true);
          props.onUploadEnd && props.onUploadEnd();
        }
      };
      await upload();
    }, undefined);
  };

  useImperativeHandle(ref, () => ({
    handleDrop,
    gridRef,
  }));
  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: handleDrop,
  });

  return (
    <React.Fragment>
      <Grid
        container
        spacing={3}
        {...getRootProps()}
        ref={gridRef}
        justifyContent="center"
        alignContent="center"
        width="100%"
        display="flex"
      >
      <input id="idInp" {...getInputProps()} className="offscreen" />
      {files.length > 0 && (
        <Grid item bgcolor="green"> 
          {files.map((file, i) => {
            return <SkynetUploadStatus key={i} {...file} />;
          })}
        </Grid>
      )}
      </Grid>
      <Snackbar
        open={uploadErr}
        autoHideDuration={4000}
        onClose={() => setUploadErr(false)}
      >
        <Alert onClose={() => setUploadErr(false)} severity="error">
          Error on upload!
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
});

export default SkynetUpload;
