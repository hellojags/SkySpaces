import { useState, useCallback, useEffect, useMemo, useRef, createRef } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Button, Container, Grid, Box } from '@mui/material';
import { height } from '@mui/system';
import { createHash } from 'crypto';
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
  setChonkyDefaults
} from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import { useFileManager } from '../../contexts';
import { useSkynetManager } from '../../contexts';
import { DirectoryIndex } from 'fs-dac-library';
import SkynetUpload from '../upload/SkynetUpload';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import PublishIcon from '@mui/icons-material/Publish';
import {
  CustomFileData,
  useCustomFileMap,
  useFiles,
  useFolderChain,
  customFileActions,
  addUploadedFiles
} from './customization';
import { showActionNotification } from '../utils/util';
import UploaderElement from '../upload/UploaderElement';
import { isEmpty } from 'lodash';
import { getTime } from 'date-fns';

//import {useFileActionHandler} from "./FileActionHandler"
//import { FileData, DirectoryIndex } from 'fs-dac-library';

setChonkyDefaults({ iconComponent: ChonkyIconFA });

export type VFSProps = Partial<FileBrowserProps>;

export const SkyBrowser: React.FC<VFSProps> = React.memo((props) => {
  const [isDir, setIsDir] = useState<boolean>(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const inputFilesRef: any = useRef();
  const fileBrowserRef = React.useRef<FileBrowserHandle>(null);
  const { uploads, onUploadStateChange, handleDrop, getUploads, setUploads } = useSkynetManager();
  const onDrop = useCallback(async (acceptedFiles) => {
    // Do something with the files
    console.log(`acceptedFiles -> ${JSON.stringify(acceptedFiles)}`);
    //setDroppedFiles(acceptedFiles);
    await handleDrop(acceptedFiles);
    //fileBrowserRef.current.requestFileAction(addUploadedFiles, undefined);
    //alert(`Number of files ${acceptedFiles?.length}`);
  }, []);
  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop
  });

  const convert2ChonkyFileData = (upload): any => {
    console.log(`convert2ChonkyFileData: upload : ${JSON.stringify(upload)}`);
    const chonkyCustomFileData = {
      id: upload?.fileData?.hash, // (Required) String that uniquely identifies the file
      name: upload?.file?.name, // (Required) Full name, e.g. `MyImage.jpg`
      ext: '', // File extension, e.g. `.jpg`
      isDir: upload?.mode === 'directory' ? true : false, // Is a directory, default: false
      isHidden: false, // Is a hidden file, default: false
      isSymlink: false, // Is a symlink, default: false
      isEncrypted: true, // Is encrypted in some way, default: false
      openable: true, // Can be opened, default: true
      selectable: true, // Can be selected, default: true
      draggable: true, // Can be dragged, default: true
      droppable: true, // Can have files dropped into it, default: true for folders
      size: upload?.fileData?.size, // File size in bytes
      modDate: '' + upload?.fileData?.ts, // Last change date (or its string representation)
      childrenCount: 0, // Number of files inside of a folder (only for folders)
      // Default preview overriding
      color: 'green', // Color to use for this file
      icon: ChonkyIconName.file, // Icon to use for this file
      thumbnailUrl: null, // Automatically load thumbnail from this URL
      chunkSize: upload?.fileData?.chunkSize, // Any other user-defined property
      encryptionType: upload?.fileData?.encryptionType,
      url: upload?.fileData?.url,
      fsdacExt: {}
    };
    return [chonkyCustomFileData];
  };
  // prepare Files CustomFileData
  const getChonkyCustomFileData = (fileData, isDirectory) => {
    let chonkyCustomFileData = null;
    if (isDirectory) {
      chonkyCustomFileData = {
        id: fileData?.id, // (Required) String that uniquely identifies the file
        name: fileData?.name, // (Required) Full name, e.g. `MyImage.jpg`
        isDir: isDirectory, // Is a directory, default: false
        // isHidden: false, // Is a hidden file, default: false
        // isSymlink: false, // Is a symlink, default: false
        // isEncrypted: true, // Is encrypted in some way, default: false
        // openable: true, // Can be opened, default: true
        // selectable: true, // Can be selected, default: true
        // draggable: true, // Can be dragged, default: true
        // droppable: true, // Can have files dropped into it, default: true for folders
        // size: 0, // File size in bytes
        // modDate: '' + fileData?.modified, // Last change date (or its string representation)
        childrenCount: 0, // Number of files inside of a folder (only for folders)
        // Default preview overriding
        color: 'green', // Color to use for this file
        icon: ChonkyIconName.folder, // Icon to use for this file
        thumbnailUrl: null, // Automatically load thumbnail from this URL
        chunkSize: fileData?.file?.chunkSize ?? 0, // Any other user-defined property
        encryptionType: fileData?.file?.encryptionType ?? '',
        url: fileData?.file?.url ?? '',
        fsdacExt: {},
        parentId: null,
        childrenIds: []
      };
    } else {
      chonkyCustomFileData = {
        //[fileData?.file?.hash]: {
        id: fileData?.file?.hash, // (Required) String that uniquely identifies the file
        name: fileData?.name, // (Required) Full name, e.g. `MyImage.jpg`
        ext: fileData?.name.split('.').pop(), // File extension, e.g. `.jpg`
        isDir: isDirectory, // Is a directory, default: false
        isHidden: false, // Is a hidden file, default: false
        isSymlink: false, // Is a symlink, default: false
        isEncrypted: true, // Is encrypted in some way, default: false
        openable: true, // Can be opened, default: true
        selectable: true, // Can be selected, default: true
        draggable: true, // Can be dragged, default: true
        droppable: true, // Can have files dropped into it, default: true for folders
        size: fileData?.file?.size, // File size in bytes
        modDate: '' + fileData?.modified, // Last change date (or its string representation)
        childrenCount: 0, // Number of files inside of a folder (only for folders)
        // Default preview overriding
        color: 'green', // Color to use for this file
        icon: ChonkyIconName.file, // Icon to use for this file
        thumbnailUrl: null, // Automatically load thumbnail from this URL
        chunkSize: fileData?.file?.chunkSize, // Any other user-defined property
        encryptionType: fileData?.file?.encryptionType,
        url: fileData?.file.url,
        fsdacExt: {},
        parentId: '',
        childrenIds: []
        //}
      };
    }
    return chonkyCustomFileData;
  };
  const convertSkyFS_To_ChonkyCustomFileMap = (SkyFSDirectoryIndex: DirectoryIndex): any => {
    console.log(
      `convertSkyFS_To_ChonkyFileData: SkyFSDirectoryIndex : ${JSON.stringify(SkyFSDirectoryIndex)}`
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
    const CustomFileMap_Dirs = Object.values(SkyFSDirectoryIndex?.directories).map(
      (skyFSDirectoryDirObj) => {
        const path = getSkyPath(); // TODO: store in state variable
        skyFSDirectoryDirObj.id = createHash('sha256').update(`${path}/home`).digest('hex');
        const KeyValues = getChonkyCustomFileData(skyFSDirectoryDirObj, true);
        console.log(`# KeyValues = ${JSON.stringify(KeyValues)}`);
        return KeyValues;
      }
    );
    return CustomFileMap_Files.concat(CustomFileMap_Dirs);
  };
  // const updateSkyBrowser = (id) => {
  //   const uploads = getUploads();
  //   const index = uploads.findIndex((upload) => upload.id === id);
  //   if (index !== undefined && index >= 0) {
  //     // is status is 'complete', update skybrowser with FileData and remove item from uploads
  //     if (uploads[index].status === 'complete') {
  //       const chonkyFileData = convert2ChonkyFileData(uploads[index]);
  //       fileBrowserRef.current.requestFileAction(addUploadedFiles, chonkyFileData);
  //       setUploads((uploads) => {
  //         return delete uploads[index];
  //       });
  //     } else {
  //       console.log('updateSkyBrowser , uploads status is not COMPLETE. why ??');
  //     }
  //   }
  // };
  // const updateSkyBrowser = React.useCallback((id) => {
  //   const uploads = getUploads();
  //   const index = uploads.findIndex((upload) => upload.id === id);
  //   if(index !== undefined && index >= 0 )
  //   {
  //     // is status is 'complete', update skybrowser with FileData and remove item from uploads
  //     if (uploads[index].status === 'complete') {
  //       const chonkyFileData = convert2ChonkyFileData(uploads[index]);
  //       fileBrowserRef.current.requestFileAction(addUploadedFiles, chonkyFileData);
  //       setUploads((uploads) => {
  //         return delete uploads[index];
  //       });
  //     } else {
  //       console.log("updateSkyBrowser , uploads status is not COMPLETE. why ??")
  //     }
  //   }
  // }, []);
  const { getDirectoryIndex, createDirectory } = useFileManager();
  const {
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    resetFileMap,
    deleteFiles,
    moveFiles,
    createFolder,
    uploadFiles
  } = useCustomFileMap();

  const files = useFiles(fileMap, currentFolderId);

  const folderChain = useFolderChain(fileMap, currentFolderId);

  const getSkyPath = () => {
    let skyfsPath = '/'; //Initial root directory
    const folderNames = folderChain?.map((folder) => folder.name);
    if (folderNames.length >= 1) {
      skyfsPath = '/' + folderNames.join('/');
    }
    console.log(`skyfsPath -> ${skyfsPath}`);
    return skyfsPath;
  };

  const fileActions = useMemo(
    () => [
      ChonkyActions.CreateFolder,
      ChonkyActions.DeleteFiles,
      ChonkyActions.UploadFiles,
      ChonkyActions.DownloadFiles,
      ChonkyActions.DeleteFiles,
      ChonkyActions.CopyFiles
    ],
    []
  );

  const initializeCustomFileMap = async () => {
    let directoryIndexSkyFS = await getDirectoryIndex('/localhost/');
    console.log('# directoryIndexSkyFS =' + JSON.stringify(directoryIndexSkyFS));
    if (isEmpty(directoryIndexSkyFS.directories) && isEmpty(directoryIndexSkyFS.files)) {
      const response = await createDirectory('/localhost/', 'home');
      const path = getSkyPath();
      directoryIndexSkyFS.directories = {
        home: {
          name: 'home',
          created: Math.floor(Date.now() / 1000),
          id: createHash('sha256').update(`${path}/home`).digest('hex')
          //id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 35)
        }
      };
      const chonkyCustomFileMap = convertSkyFS_To_ChonkyCustomFileMap(directoryIndexSkyFS); // Conver directoryIndexSkyFS data to Chonky Browser format
      console.log('# chonkyCustomFileMap =' + JSON.stringify(chonkyCustomFileMap));
      if (chonkyCustomFileMap?.length > 0) {
        fileBrowserRef.current.requestFileAction(ChonkyActions.CreateFolder, chonkyCustomFileMap);
      }
    }
    const baseFileMap = fileMap;
    const rootFolderId = currentFolderId;
    return { baseFileMap, rootFolderId };
  };

  // run it once on page load.
  React.useEffect(() => {
    // get Directory Index data from SkyFS
    (async () => {
      await initializeCustomFileMap();
    })();
  }, []);

  React.useEffect(() => {
    const completedUploads = uploads.filter((upload) => upload.status === 'complete');
    completedUploads.forEach((completedUpload) => {
      const chonkyFileData = convert2ChonkyFileData(completedUpload);
      fileBrowserRef.current.requestFileAction(addUploadedFiles, chonkyFileData);
      // is status is 'complete', update skybrowser with FileData and remove item from uploads
      setUploads((uploads) => {
        return uploads.filter((upload) => upload.id !== completedUpload.id);
      });
    });
  }, [uploads]);

  // const updateSkyBrowser = (uploadId) => {
  //   const chonkyFileData = convert2ChonkyFileData(upload);
  //   fileBrowserRef.current.requestFileAction(addUploadedFiles, chonkyFileData);
  // }
  //const { uploads, onUploadStateChange, handleDrop, getUploads} = useSkynetManager();

  const useFileActionHandler = (
    setCurrentFolderId: (folderId: string) => void,
    deleteFiles: (files: CustomFileData[]) => void,
    moveFiles: (files: FileData[], source: FileData, destination: FileData) => void,
    createFolder: (folderName: string) => void,
    uploadFiles: (files: CustomFileData[]) => void
  ) => {
    // const { createFile1, getDirectoryIndex } = useFileManager();
    const { getDirectoryIndex, createDirectory } = useFileManager();
    React.useEffect(() => {
      // get Directory Index data from SkyFS
      (async () => {
        const skyfspath = getSkyPath();
        const directoryIndexSkyFS = await getDirectoryIndex(skyfspath);
        console.log('# directoryIndexSkyFS =' + JSON.stringify(directoryIndexSkyFS));
        const chonkyCustomFileMap = convertSkyFS_To_ChonkyCustomFileMap(directoryIndexSkyFS); // Conver directoryIndexSkyFS data to Chonky Browser format
        console.log('# chonkyCustomFileMap =' + JSON.stringify(chonkyCustomFileMap[0]));
        if (chonkyCustomFileMap?.length > 0) {
          fileBrowserRef.current.requestFileAction(addUploadedFiles, chonkyCustomFileMap);
        }
      })();
      //Trigget action to
      //fileBrowserRef.current.requestFileAction(addUploadedFiles, chonkyFileData);
    }, [currentFolderId]);

    //alert("inputFilesRef ## "+inputRef.current)
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
          deleteFiles(data.state.selectedFilesForAction!);
        } else if (data.id === ChonkyActions.MoveFiles.id) {
          moveFiles(data.payload.files, data.payload.source!, data.payload.destination);
        } else if (data.id === ChonkyActions.CreateFolder.id) {
          let folderName;
          if (data?.payload === undefined) {
            folderName = prompt('Provide the name for your new folder:');
            const path = getSkyPath();
            const response = (async () => {
              return await createDirectory(path, folderName);
            })();
            if (response) {
              const directories = {
                home: {
                  name: folderName,
                  created: Math.floor(Date.now() / 1000),
                  id: createHash('sha256').update(`${path}/${folderName}`).digest('hex')
                  //id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 35)
                }
              };
              const chonkyCustomFileMap = getChonkyCustomFileData(directories, true);
              createFolder(folderName);
            } else {
              //TODO: display error
            }
          } else {
            //todo: need to handle multiple folders
            folderName = data?.payload[0]?.name ?? 'failed';
            if (folderName) createFolder(folderName);
          }
        } else if (data.id === ChonkyActions.UploadFiles.id) {
          // step1: get File/Files Objects from UI uploader
          // step2: upload files using useFileManager Hook. it will return dac fileData
          // step3: update VFS Browser by calling uploadFiles
          //const folderName = prompt("Provide the name for your new folder:");
          console.log('getUploads() ' + getUploads().length);
          console.log('uploads ' + uploads.length);
          console.log('inputFilesRef.current ' + inputFilesRef.current);
          if (droppedFiles && droppedFiles.length > 0) {
            // this means we have files to process
            // const file1: File = new File(['Earth is a Beautiful, dont go to Mars !'], 'SkynetHub.txt', {
            //   type: 'text/plain',
            //   lastModified: new Date(0).getTime()
            // });
            // console.log('Before FileManager API: createFile1');
            // createFile1('/localhost/SkynetHub', file1, 'myfile001.txt');
            // console.log('After FileManager API: createFile1');
            // const files: CustomFileData[] = [{ id: '1', name: 'FirstFile.txt', size: 1103 }];
            // below function mutates Chonky FilesMap
            //uploadFiles(files);
          } // this means user has first time click on Upload File button
          else {
            inputFilesRef.current.click();
          }
          // inputFilesRef.current.click();
          //inputFilesRef.current.click();
        } else if (data.id === addUploadedFiles.id) {
          uploadFiles(data?.payload);
          console.log('### Insite Custom Action ####');
        }
        showActionNotification(data);
      },
      [uploadFiles, createFolder, deleteFiles, moveFiles, setCurrentFolderId, uploads]
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
    (file: FileData) => (file.thumbnailUrl ? `https://chonky.io${file.thumbnailUrl}` : null),
    []
  );
  const skynetUploadRef: any = React.createRef();
  const onSkynetUpload = async (uploadObj) => {
    console.log(`onUpload -> ${JSON.stringify(uploadObj)}`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        // bgcolor: 'primary.dark',
        alignContent: 'center',
        justifyContent: 'center'
      }}
      {...getRootProps()}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center'
        }}
      >
        <Grid container alignContent="center" justifyContent="center">
          <Grid item lg={1} visibility="hidden">
            <input
              {...getInputProps()}
              ref={inputFilesRef}
              accept="image/*"
              id="contained-button-file"
              multiple
              type="file"
            />
          </Grid>
          <Grid item lg={11}>
            <SkynetUpload
              ref={skynetUploadRef}
              onUpload={onSkynetUpload}
              portal="https://fileportal.org/"
              name="files"
              directoryMode={isDir}
              droppedFiles={droppedFiles}
            ></SkynetUpload>
          </Grid>
          <Grid item lg={12}>
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={resetFileMap}
              style={{ marginBottom: 15 }}
            >
              Reset file map
            </Button>
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() =>
                // evt.preventDefault() ||
                // evt.stopPropagation() ||
                skynetUploadRef.current.gridRef.current.click()
              }
              style={{
                marginBottom: 15,
                color: 'white',
                borderRadius: 10
              }}
              startIcon={<PublishIcon style={{ color: 'white' }} />}
            >
              Upload
            </Button>
          </Grid>
          <Grid item lg={12} sx={{ height: 500 }}>
            <FullFileBrowser
              ref={fileBrowserRef}
              files={files}
              folderChain={folderChain}
              fileActions={customFileActions}
              onFileAction={handleFileAction}
              thumbnailGenerator={thumbnailGenerator}
              darkMode={false}
              defaultFileViewActionId={'enable_list_view'}
              {...props}
            />
          </Grid>
          <Grid item lg={12} sx={{ height: 500 }}>
            {uploads.map((upload) => (
              <UploaderElement key={upload.id} upload={upload} skypath={getSkyPath} />
            ))}
          </Grid>
          {/* <Grid item lg={12}>
              <SkynetUpload
                ref={skynetUploadRef}
                onUpload={onSkynetUpload}
                portal="https://siasky.net/"
                name="files"
                directoryMode={isDir}
                droppedFiles={droppedFiles}
              ></SkynetUpload>
            </Grid> */}
          {/* <Grid item lg={12}>
              <label htmlFor="contained-button-file">
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  onClick={() =>
                    // evt.preventDefault() ||
                    // evt.stopPropagation() ||
                    skynetUploadRef.current.gridRef.current.click()
                  }
                  style={{
                    marginBottom: 15,
                    color: 'white',
                    borderRadius: 10
                  }}
                  startIcon={<PublishIcon style={{ color: 'white' }} />}
                >
                  Upload
                </Button>
              </label>
            </Grid> */}
        </Grid>
      </Container>
    </Box>
  );
});
