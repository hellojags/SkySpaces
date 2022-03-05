import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { File, FileCheck, FileError } from "./svg";
import LoadingSpinner from "./LoadingSpinner";
import { Grid, Typography } from "@mui/material";
import Description from "@mui/icons-material/Description";
import FileCopy from "@mui/icons-material/FileCopy";

export default function SkynetUploadStatus2({
  file,
  url,
  status,
  progress,
  error,
}) {
  const [copied, setCopied] = useState(false);
  const urlRef = useRef(null);
  useEffect(() => {
    if (copied) {
      const timeoutId = setTimeout(() => {
        setCopied(false);
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [copied, setCopied]);

  const getIcon = () => {
    if (status === "uploading" || status === "processing") {
      return <File />;
    } else if (status === "error") {
      return <FileError />;
    } else {
      return <FileCheck />;
    }
  };
  const copyToClipboard = (e) => {
    urlRef.current.select();
    document.execCommand("copy");
    e.target.focus();
    setCopied(true);
  };
  const copyText = copied ? "Copied!" : "Copy to clipboard";
  const getProgressText = (progress) => {
    if (progress === -1) {
      return "Waiting...";
    } else if (progress > 0) {
      return `Uploading ${Math.round(progress * 100)}%`;
    }
    return "Uploading...";
  };
  return (
    <Grid
      container
      spacing={3}
      justifyContent="space-between"
      alignContent="center"
    >
      <Grid item>
        <Description />
      </Grid>
      <Grid item>
        <Typography>{file}</Typography>
        {status === "uploading" && getProgressText(progress)}
        {status === "processing" && "Processing..."}
        {status === "error" && (
          <span className="red-text">{error || "Upload failed."}</span>
        )}
        {status === "complete" && (
          <Typography>
            <a
              ref={urlRef}
              href={url}
              className="url green-text"
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a>
          </Typography>
        )}
        {(status === "uploading" || status === "processing") && (
          <Grid item>
            <LoadingSpinner />
          </Grid>
        )}
      </Grid>
      <Grid item>
        {status === "complete" && (
          <FileCopy
            style={{
              cursor: "pointer",
            }}
            onClick={() => copyToClipboard(url)}
          />
        )}
      </Grid>
      <textarea value={url} ref={urlRef} readOnly={true} />
    </Grid>
  );
}
SkynetUploadStatus2.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  status: PropTypes.string.isRequired,
  url: PropTypes.string,
  progress: PropTypes.number,
  error: PropTypes.string,
};
