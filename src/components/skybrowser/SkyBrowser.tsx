import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  createRef,
} from "react";
import plusFill from "@iconify/icons-eva/plus-fill";
import { Link as RouterLink } from "react-router-dom";
// material
import { Button, Container, Grid, Box, Modal, Card, CardHeader, CardContent, CardActions,FormControl, Input, InputLabel, Typography, TextField } from "@mui/material";
import { height } from "@mui/system";
import { createHash } from "crypto";
// Chonky
import {
  ChonkyActions,
  ChonkyIconName,
  ChonkyFileActionData,
  FileArray,
  FileBrowserHandle,
  FileBrowserProps,
  FileData,
  FileHelper,
  FullFileBrowser,
  setChonkyDefaults,
  FileBrowser,
  FileNavbar,
  FileToolbar,
  FileList,
} from "@skynethubio/web3-file-explorer";
import { ChonkyIconFA } from "@skynethubio/web3-file-explorer-icons";
import { useFileManager } from "../../contexts";
import { useSkynetManager } from "../../contexts";

import { convert2ChonkyFileData, getChonkyCustomFileData } from "./utils";
import React from "react";
import { useDropzone } from "react-dropzone";
import PublishIcon from "@mui/icons-material/Publish";
import {
  CustomFileData,
  useCustomFileMap,
  useFiles,
  useFolderChain,
  customFileActions,
  addUploadedFiles,
} from "./customization";
import { showActionNotification } from "../utils/util";
import UploaderElement from "../upload/UploaderElement";
import { isEmpty } from "lodash";
import { getTime } from "date-fns";
import { DirectoryIndex } from "fs-dac-library";
import ActionHeader from '../ActionHeader';
import { useAction } from '../../contexts';
import { makeStyles } from '@mui/styles';
//TODOs
// 1. currently only cupport Files drop, need to add support for directory as well

setChonkyDefaults({ iconComponent: ChonkyIconFA });
const styles = makeStyles((theme) => ({
  modalStyle: {
    overflow: 'auto',
    width: '80%',
    ['@media (min-width: 992px)']: {
      width: '40%'
    }
  },
  actionButton: {
    justifyContent: 'right'
  },
}));
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
};
export type VFSProps = Partial<FileBrowserProps>;

export const SkyBrowser: React.FC<VFSProps> = React.memo((props) => {
  const classes = styles();
  const inputFilesRef: any = useRef(); // Reference to Input type File Picker
  const fileBrowserRef = React.useRef<FileBrowserHandle>(null); // Reference to Chonky Browser component
  const folderNameRef:any = React.useRef(); // Reference to Chonky Browser component
  const [folderPath, setFolderPath] = useState("/localhost/");
  const [newFolderName, setNewFolderName] = useState('');
  const { actionsMsg, setActionMsg, setCurrentFolderPath } = useAction();
  const [open, setOpen] = useState(false);
  const [createdFolders, setCreatedFolders] = useState([]);

  const {
    mode,
    setMode,
    uploads,
    onUploadStateChange,
    handleDrop,
    getUploads,
    setUploads,
  } = useSkynetManager();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      console.log(acceptedFiles);
      //return;
      await handleDrop(acceptedFiles, folderPath);
    },
    [folderPath]
  );

  async function myCustomFileGetter(event) {
    const files = [];
    const fileList = event.dataTransfer
      ? event.dataTransfer.files
      : event.target.files;

    for (var i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);

      Object.defineProperty(file, "myProp", {
        value: true,
      });

      files.push(file);
    }

    return files;
  }

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop,
    //  onDrop, getFilesFromEvent: event => myCustomFileGetter(event)
  });

  // const inputElement = inputRef.current;
  // React.useEffect(() => {
  //   if (!inputElement) return;
  //   if (mode === "directory")
  //     inputElement.setAttribute("webkitdirectory", "true");
  //   if (mode === "file") inputElement.removeAttribute("webkitdirectory");
  // }, [inputElement, mode]);

  const { getDirectoryIndex, createDirectory } = useFileManager();
  const {
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    resetFileMap,
    deleteFiles,
    moveFiles,
    createFolder,
    uploadFiles,
  } = useCustomFileMap();
  const files = useFiles(fileMap, currentFolderId);
  const folderChain = useFolderChain(fileMap, currentFolderId);

  const initializeCustomFileMap = async () => {
    let directoryIndexSkyFS = await getDirectoryIndex("/localhost/");
    console.log(
      "# directoryIndexSkyFS =" + JSON.stringify(directoryIndexSkyFS)
    );
    // If Initial Folder/File structure is not present
    if (
      isEmpty(directoryIndexSkyFS.directories) &&
      isEmpty(directoryIndexSkyFS.files)
    ) {
      const response = await createDirectory("/localhost/", "home");
      directoryIndexSkyFS.directories = {
        home: {
          name: "home",
          created: Math.floor(Date.now() / 1000),
          id: createHash("sha256").update(`${folderPath}/home`).digest("hex"),
          //id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 35)
        },
      };
      const chonkyCustomFileMap =
        convertSkyFS_To_ChonkyCustomFileMap(directoryIndexSkyFS); // Conver directoryIndexSkyFS data to Chonky Browser format
      console.log(
        "# chonkyCustomFileMap =" + JSON.stringify(chonkyCustomFileMap)
      );
      if (chonkyCustomFileMap?.length > 0) {
        fileBrowserRef.current.requestFileAction(
          ChonkyActions.CreateFolder,
          chonkyCustomFileMap
        );
      }
    }
    const baseFileMap = fileMap;
    const rootFolderId = currentFolderId;
    return { baseFileMap, rootFolderId };
  };
  const convertSkyFS_To_ChonkyCustomFileMap = (
    SkyFSDirectoryIndex: DirectoryIndex
  ): any => {
    console.log(
      `convertSkyFS_To_ChonkyFileData: SkyFSDirectoryIndex : ${JSON.stringify(
        SkyFSDirectoryIndex
      )}`
    );
    // prepare files CustomFileData. arreay of "[fileId: string]: CustomFileData"
    const CustomFileMap_Files = Object.values(SkyFSDirectoryIndex?.files).map(
      (skyFSDirectoryFileObj) => {
        const KeyValues = getChonkyCustomFileData(skyFSDirectoryFileObj, false);
        console.log(`# KeyValues = ${JSON.stringify(KeyValues)}`);
        return KeyValues;
      }
    );
    // prepare directories CustomFileData. arreay of "[fileId: string]: CustomFileData"
    const CustomFileMap_Dirs = Object.values(
      SkyFSDirectoryIndex?.directories
    ).map((skyFSDirectoryDirObj) => {
      skyFSDirectoryDirObj.id = createHash("sha256")
        .update(`${folderPath}/${skyFSDirectoryDirObj.name}`)
        .digest("hex");
      const KeyValues = getChonkyCustomFileData(skyFSDirectoryDirObj, true);
      console.log(`# KeyValues = ${JSON.stringify(KeyValues)}`);
      return KeyValues;
    });
    console.log(CustomFileMap_Files.concat(CustomFileMap_Dirs));
    return CustomFileMap_Files.concat(CustomFileMap_Dirs);
  };
  // Runs once on page load
  React.useEffect(() => {
    // get Directory Index data from SkyFS
    (async () => {
      await initializeCustomFileMap();
    })();
  }, []);

  React.useEffect(() => {
    let skyfsPath = "/"; //Initial root directory
    const folderNames = folderChain?.map((folder) => folder.name);
    if (folderNames.length >= 1) {
      skyfsPath = "/" + folderNames.join("/");
    }
    console.log(`skyfsPath -> ${skyfsPath}`);
    setFolderPath(skyfsPath);
    setCurrentFolderPath(skyfsPath);
  }, [folderChain]);

  // Runs everytime uploaded files status is updated
  React.useEffect(() => {
    const completedUploads = uploads.filter(
      (upload) => upload.status === "complete"
    );
    completedUploads.forEach((completedUpload) => {
      console.log(
        `Folder Path: ${folderPath}, completedUpload Object : ${JSON.stringify(
          completedUpload
        )} `
      );
      // if completed upload file is in current folder on UI then only render else skip render.
      // either absolute file path match with current path or  current folderpath and filefolderpath should match

      // If file is uploaded at current path, display file
      if (folderPath === completedUpload.absoluteFolderPath) {
        // convert Upload object to Chonky FileData Object for rendering in browser
        const chonkyFileData = convert2ChonkyFileData(completedUpload, false, folderPath);
        fileBrowserRef.current.requestFileAction(
          addUploadedFiles,
          chonkyFileData
        );
      }
      //If folder is uploaded at current path, display folder
      const tempRemainingPath = completedUpload.absoluteFolderPath.replace(folderPath, "").split("/");
      if (tempRemainingPath.length >= 3 ) {
        // TODO: add directory parameter in convert2ChonkyFileData
        console.log(`upload.absoluteFolderPath.split ${completedUpload.absoluteFolderPath.split("/")}`);
        const chonkyFileData = convert2ChonkyFileData(completedUpload, true, tempRemainingPath[1]);
        console.log(chonkyFileData);
        if(createdFolders.indexOf(chonkyFileData[0].name) < 0) {
          setCreatedFolders( createdFolders => [...createdFolders, chonkyFileData.name]);
          fileBrowserRef.current.requestFileAction(
            ChonkyActions.CreateFolder,
            chonkyFileData
          );
        }
      }

      // if (
      //   folderPath.concat(`/${completedUpload.name}`) ===
      //     completedUpload.absoluteFolderPath ||
      //   completedUpload.absoluteFolderPath.replace(folderPath, "").split("/")
      //     .length <= 3
      // ) {
      //   // convert Upload object to Chonky FileData Object for rendering in browser
      //   const chonkyFileData = convert2ChonkyFileData(completedUpload);
      //   fileBrowserRef.current.requestFileAction(
      //     addUploadedFiles,
      //     chonkyFileData
      //   );
      // }
      // is status is 'complete', update skybrowser with FileData and remove item from uploads
      setUploads((uploads) => {
        return uploads.filter((upload) => upload.id !== completedUpload.id);
      });
    });
  }, [uploads]);

  const newFolderPath = useMemo(() => {
    const currentFolder = fileMap[currentFolderId];
    const folderChain = [currentFolder];
    let parentId = currentFolder.parentId;
    while (parentId) {
      const parentFile = fileMap[parentId];
      if (parentFile) {
        folderChain.unshift(parentFile);
        parentId = parentFile.parentId;
      } else {
        break;
      }
    }
    let skyfsPath = "/"; //Initial root directory
    const folderNames = folderChain?.map((folder) => folder.name);
    if (folderNames.length >= 1) {
      skyfsPath = "/" + folderNames.join("/");
    }
    console.log(`new skyfsPath -> ${skyfsPath}`);
    setFolderPath(skyfsPath);
    setCurrentFolderPath(skyfsPath);
    return skyfsPath;
  }, [currentFolderId, fileMap]);

  React.useEffect(() => {
    setCreatedFolders([]);
    // get Directory Index data from SkyFS
    (async () => {
      console.log(
        `useEffect: currentFolderId ${currentFolderId} newFolderPath=${newFolderPath} folderPath =${folderPath}`
      );
      const directoryIndexSkyFS = await getDirectoryIndex(folderPath);
      console.log(
        "# directoryIndexSkyFS =" + JSON.stringify(directoryIndexSkyFS)
      );
      const chonkyCustomFileMap =
        convertSkyFS_To_ChonkyCustomFileMap(directoryIndexSkyFS); // Conver directoryIndexSkyFS data to Chonky Browser format
      console.log(
        "# chonkyCustomFileMap =" + JSON.stringify(chonkyCustomFileMap[0])
      );
      if (chonkyCustomFileMap?.length > 0) {
        fileBrowserRef.current.requestFileAction(
          addUploadedFiles,
          chonkyCustomFileMap
        );
      }
    })();
    //Trigget action to
    //fileBrowserRef.current.requestFileAction(addUploadedFiles, chonkyFileData);
  }, [currentFolderId]);

  React.useEffect(() => {
    if (props) { }
    console.log(props);
  }, [props])

  const useFileActionHandler = (
    setCurrentFolderId: (folderId: string) => void,
    deleteFiles: (files: CustomFileData[]) => void,
    moveFiles: (
      files: FileData[],
      source: FileData,
      destination: FileData
    ) => void,
    createFolder: (folderName: string, folderId: string) => void,
    uploadFiles: (files: CustomFileData[]) => void
  ) => {
    const { createDirectory } = useFileManager();
    return useCallback(
      //(data: ChonkyFileActionData) => {
      (data: any) => {
        if (data.id === ChonkyActions.OpenFiles.id) {
          const { targetFile, files } = data.payload;
          const fileToOpen = targetFile ?? files[0];
          if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
            setCurrentFolderId(fileToOpen.id);
            return;
          }
        } else if (data.id === ChonkyActions.DeleteFiles.id) {
          console.log(data.state.selectedFilesForAction);
          deleteFiles(data.state.selectedFilesForAction!);
        } else if (data.id === ChonkyActions.MoveFiles.id) {
          moveFiles(
            data.payload.files,
            data.payload.source!,
            data.payload.destination
          );
        } else if (data.id === ChonkyActions.CreateFolder.id) {
          let folderName;
          if (data?.payload === undefined) {
            folderName = prompt("Provide the name for your new folder:");
            const response = (async () => {
              return await createDirectory(folderPath, folderName);
            })();
            if (response && folderName) {
              const folderId = createHash("sha256")
                .update(`${folderPath}/${folderName}`)
                .digest("hex");
              createFolder(folderName, folderId);
            } else {
              //TODO: display error
            }
          } else {
            //todo: need to handle multiple folders
            folderName = newFolderName === '' ? data?.payload[0]?.name : newFolderName;
            const folderId = createHash("sha256")
              .update(`${folderPath}/${folderName}`)
              .digest("hex");
            createFolder(folderName, folderId);
          }
        } else if (data.id === ChonkyActions.UploadFiles.id) {
          console.log("getUploads() " + getUploads().length);
          console.log("uploads " + uploads.length);
          inputFilesRef.current.click();
        } else if (data.id === addUploadedFiles.id) {
          uploadFiles(data?.payload);
          console.log("### Insite Custom Action ####");
        }
        showActionNotification(data);
      },
      [
        uploadFiles,
        createFolder,
        deleteFiles,
        moveFiles,
        setCurrentFolderId,
        uploads,
        folderPath,
        newFolderName
      ]
    );
  };

  const handleFileAction = useFileActionHandler(
    setCurrentFolderId,
    deleteFiles,
    moveFiles,
    createFolder,
    uploadFiles
  );

  const thumbnailGenerator = useCallback(
    (file: FileData) =>
      file.thumbnailUrl ? `https://chonky.io${file.thumbnailUrl}` : null,
    []
  );

  const createFolderData = useCallback(async () => {
    let folderName;
    let directoryIndexSkyFS;
    let chonkyCustomFileMap;
    directoryIndexSkyFS = await getDirectoryIndex(folderPath);
    if (
      isEmpty(directoryIndexSkyFS.directories) &&
      isEmpty(directoryIndexSkyFS.files)
    ) {
      const response = await createDirectory(folderPath, newFolderName);
      directoryIndexSkyFS.directories = {
        home: {
          name: newFolderName,
          created: Math.floor(Date.now() / 1000),
          id: createHash("sha256").update(folderPath + '/' + newFolderName).digest("hex"),
          //id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 35)
        },
      };
      const chonkyCustomFileMap =
        convertSkyFS_To_ChonkyCustomFileMap(directoryIndexSkyFS); // Conver directoryIndexSkyFS data to Chonky Browser format
      console.log(
        "# chonkyCustomFileMap =" + JSON.stringify(chonkyCustomFileMap)
      );
      if (chonkyCustomFileMap?.length > 0) {
        fileBrowserRef.current.requestFileAction(
          ChonkyActions.CreateFolder,
          chonkyCustomFileMap
        );
      }
    } else {
      const response = await createDirectory(folderPath, newFolderName);
      chonkyCustomFileMap = convertSkyFS_To_ChonkyCustomFileMap(directoryIndexSkyFS);
      console.log(chonkyCustomFileMap);
      if (chonkyCustomFileMap?.length > 0 && response) {
        fileBrowserRef.current.requestFileAction(
          ChonkyActions.CreateFolder,
          chonkyCustomFileMap
        );
      }
    }

  }, [newFolderName])

  useEffect(() => {
    if (newFolderName !== '') {
      createFolderData();
    }
  }, [newFolderName, createFolderData])

  const clearActionMsg = useCallback(() => {
    setActionMsg('');
  }, [])

  useEffect(() => {
    handleCallbackFromAction(actionsMsg);
    clearActionMsg();
  }, [actionsMsg, clearActionMsg]);

  const handleCallbackFromAction = (msgFromChild) => {
    let chonkyCustomFileMap;
    let selectedFiles = [];
    //(async () => {
    if (msgFromChild === 'Create Folder') {
      setNewFolderName('');
      setOpen(true);
    }
    if (msgFromChild === 'Files' || msgFromChild === 'Folder' || msgFromChild === 'Web App') {
      if (msgFromChild === 'Folder') {
        inputFilesRef.current.setAttribute("webkitdirectory", "");
        inputFilesRef.current.setAttribute("directory", "");
      } else {
        inputFilesRef.current.removeAttribute("webkitdirectory");
        inputFilesRef.current.removeAttribute("directory");
      }
      inputFilesRef.current.click();
    }
    if (msgFromChild === 'Delete') {
      fileBrowserRef.current.getFileSelection().forEach((value) => {
        const result = chonkyCustomFileMap.find(obj => {
          return obj.id === value;
        })
        selectedFiles.push(result);
      });
      console.log(selectedFiles);
      handleFileAction(deleteFiles(selectedFiles));
    }
    //})();
  }
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setNewFolderName('');
    setOpen(false);
  };

  const getFolderName = () => {
    if(folderNameRef.current) {
      setNewFolderName(folderNameRef.current.firstChild.value);
    }
    setOpen(false);
  }
  return (
    <Box
      sx={{
        display: "flex",
        // bgcolor: 'primary.dark',
        alignContent: "center",
        justifyContent: "center",
      }}
      {...getRootProps()}
    >
      <Grid container alignContent="center" justifyContent="center" lg={12}>
        {/* <ActionHeader item lg={12} parentCallBack={handleCallbackFromAction} /> */}
        <Grid item lg={12} visibility="hidden">
          <input
            {...getInputProps()}
            ref={inputFilesRef}
            accept="*/*"
            id="contained-button-file"
            multiple
            type="file"
          />
        </Grid>
        <Grid item md={12} lg={12} sx={{ height: '78vh' }}>
        <FileBrowser ref={fileBrowserRef}
            files={files}
            folderChain={folderChain}
            fileActions={customFileActions}
            onFileAction={handleFileAction}
            thumbnailGenerator={thumbnailGenerator}
            darkMode={false}
            defaultFileViewActionId={"enable_list_view"}
            {...props}>
          <FileNavbar />
          {/* <FileToolbar /> */}
          <FileList />
        </FileBrowser>
          {/* <FullFileBrowser
            ref={fileBrowserRef}
            files={files}
            folderChain={folderChain}
            fileActions={customFileActions}
            onFileAction={handleFileAction}
            thumbnailGenerator={thumbnailGenerator}
            darkMode={false}
            defaultFileViewActionId={"enable_list_view"}
            {...props}
          /> */}
        </Grid>
        {/* <Grid item lg={12} sx={{ display: "flex" }}>
        {uploads.map((upload) => (
          <UploaderElement
            key={upload.id}
            upload={upload}
            folderPath={folderPath}
          />
        ))}
      </Grid> */}
      </Grid>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className={classes.modalStyle}
          component="form"
          noValidate
          autoComplete="off"
        >
          <CardHeader title="" />
          <Card>
            <CardContent>
              {/* <Typography>
                Please enter the folder name.
              </Typography> */}
              <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                <InputLabel htmlFor="folder-name-input">Enter Folder Name</InputLabel>
                <Input
                  id="folder-name-input"
                  type="text"
                  ref={folderNameRef}
                />
              </FormControl>
            </CardContent>
            <CardActions className={classes.actionButton}>
              <Button variant="contained" onClick={getFolderName} >
                Submit
              </Button>
              <Button variant="contained" onClick={handleClose} >
                Close
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Modal>
    </Box>
  );
});
