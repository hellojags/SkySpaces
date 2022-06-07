import * as React from "react";
import { createContext, useContext } from "react";
import path from "path-browserify";
import { nanoid } from "nanoid";
import { FileWithPath } from "react-dropzone";

const MAX_PARALLEL_UPLOADS = 1;
const getFilePath = (file) => file.webkitRelativePath || file.path || file.name;
const getRootDirectory = (file) => {
  const filePath = getFilePath(file);
  const { root, dir } = path.parse(filePath);
  return path.normalize(dir).slice(root.length).split(path.sep)[0];
};
//Step1: Define State type
export type uploads = {
  id: string;
  name: string; // mostly we get this populated only in case of Directory
  mode: string; // file or directory
  files: FileWithPath[];
  url: string;
  fileData: any;
  status: string;
  absoluteFolderPath: string;
};
type State = {
  mode: string;
  setMode: (value: string) => void;
  uploads: uploads[];
  getUploads: () => uploads[];
  setUploads: (uploads) => void;
  handleDrop: (files: FileWithPath[], folderPath: string) => Promise<void>;
  onUploadStateChange: (id: string, state: any) => void;
};
//Step2: Define Initail State
const initailState = {} as State;

//Step3: Create Context
export const SkynetManagerContext = createContext(initailState);

//Step4: Create Hook for functional component access
export const useSkynetManager = () => useContext(SkynetManagerContext);

type Props = {
  children: React.ReactNode;
};

//Step5: Create Hook for functional component access
export function SkynetManagerProvider({ children }: Props) {
  const [mode, setMode] = React.useState("file");
  const [uploads, setUploads] = React.useState([]);
  //const inputFilesRef: any = React.createRef();

  const onUploadStateChange = (id, state) => {
    setUploads((uploads) => {
      const index = uploads.findIndex((upload) => upload.id === id);
      return [
        ...uploads.slice(0, index),
        { ...uploads[index], ...state },
        ...uploads.slice(index + 1),
      ];
    });
  };
  // const onUploadStateChange = React.useCallback((id, state) => {
  //   setUploads((uploads) => {
  //     const index = uploads.findIndex((upload) => upload.id === id);
  //     return [
  //       ...uploads.slice(0, index),
  //       { ...uploads[index], ...state },
  //       ...uploads.slice(index + 1)
  //     ];
  //   });
  //   console.log("Latest Uploads Size" + uploads.length);
  //   console.log("Latest Uploads Size" + getUploads().length);
  // }, []);

  const getUploads = () => {
    return uploads;
  };
  const handleDrop = async (files, folderPath) => {
    if (mode === "directory" && files.length) {
      const name = getRootDirectory(files[0]); // get the file path from the first file
      files = [{ name, files }];
    }
    setUploads((uploads) => [
      ...files.map((file) => {
        let tempPath = ''
        // prepare file's folder path but will have to check mode if directory or file otherwise below commected logic will create propblem
        if (file.path.indexOf('/') > -1 && file.path[0] !== '/') {
          tempPath = folderPath + '/' + file.path;
        } else {
          tempPath = folderPath + file.path;
        }
        //tempPath = folderPath + file.path; // uncomment this logic to file upload
        console.log(tempPath);
        //const absoluteFolderPath = tempPath[tempPath.length -1].join("/");
        const absoluteFolderPath = tempPath.substring(
          0,
          tempPath.lastIndexOf(file.name)
        );
        return {
          id: nanoid(),
          file,
          mode,
          status: "enqueued",
          absoluteFolderPath,
        };
      }),
      ...uploads,
    ]);
  };
  React.useEffect(() => {
    const enqueued = uploads.filter(({ status }) => status === "enqueued");
    const uploading = uploads.filter(({ status }) =>
      ["uploading", "processing", "retrying"].includes(status)
    );
    const queue = enqueued
      .slice(0, MAX_PARALLEL_UPLOADS - uploading.length)
      .map(({ id }) => id);
    if (queue.length && uploading.length < MAX_PARALLEL_UPLOADS) {
      setUploads((uploads) => {
        return uploads.map((upload) => {
          if (queue.includes(upload.id))
            return { ...upload, status: "uploading" };
          return upload;
        });
      });
    }
  }, [uploads]);
  const value = {
    mode,
    setMode,
    uploads,
    getUploads,
    setUploads,
    handleDrop,
    onUploadStateChange,
  };
  return (
    <SkynetManagerContext.Provider value={value}>
      {children}
    </SkynetManagerContext.Provider>
  );
}
