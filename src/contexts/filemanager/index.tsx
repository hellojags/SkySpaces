import React, { createContext, useContext, useEffect } from "react";
import { DirectoryIndex, FileData } from "fs-dac-library";
import save from "save-file";
import { IFileSystemDACResponse } from "fs-dac-library/dist/cjs/types";
import { useSkynet } from "../skynet";
import { path } from "path-browserify";
import { FileWithPath } from "react-dropzone";
type State = {
  createFile1: (
    directoryPath: string,
    file: FileWithPath,
    filename: string,
    onProgress?: (progress: number) => void
  ) => Promise<any>;
  uploadFileData: (
    file: FileWithPath,
    fileName: string,
    onProgress?: (progress: number) => void
  ) => Promise<FileData>; // It will return FileData object whihc contains SkyLink of uploaded data
  downloadFileData: (fileData: FileData, mimeType: string) => Promise<Blob>; // returns full binary file
  createDirectory: (
    path: string,
    name: string
  ) => Promise<IFileSystemDACResponse>; //directory is getting created and success or failure is returned
  createFile: (
    directoryPath: string,
    name: string,
    fileData: FileData
  ) => Promise<IFileSystemDACResponse>;
  updateFile: (
    directoryPath: string,
    name: string,
    fileData: FileData
  ) => Promise<IFileSystemDACResponse>;
  getDirectoryIndex: (path: string) => Promise<DirectoryIndex>;
  shareDirectory: (path: string) => Promise<string>;
};

//Create Skynet Context
const FileManagerContext = createContext({} as State);

//Custom Hook for Functional component access
export const useFileManager = () => useContext(FileManagerContext);

type Props = {
  children: React.ReactNode;
};

export function FileManagerProvider({ children }: Props) {
  const { fileSystemDAC } = useSkynet();
  const [directoryIndex, setDirectoryIndex] = React.useState([]);

  // On initial run, start initialization of MySky
  useEffect(() => {}, []);

  const checkAndCreateDirectoryRecursively = async (
    basePath: string,
    relativePath: string
  ): Promise<boolean> => {
    const result: boolean = false;
    const tempFoldersChain = relativePath.split("/");
    const foldersChain = tempFoldersChain.slice(1, tempFoldersChain.length - 1);
    let currentFolderBasePath = basePath;
    for (const folderName of foldersChain) {
      if (!directoryIndex.includes(`${currentFolderBasePath}/${folderName}`)) {
        // must check for path, just foldername wont work.
        //create directory using SkyFS
        const status = await createDirectory(currentFolderBasePath, folderName);
        if (status.success === true) {
          // prepare absolute path
          currentFolderBasePath = `${currentFolderBasePath}/${folderName}`;
          directoryIndex.push(currentFolderBasePath);
          console.log(
            `Directory '${folderName}' created at path : ${currentFolderBasePath}`
          );
        } else {
          console.log(
            `** FAILED ** to create directory '${folderName}' at path : ${currentFolderBasePath}`
          );
        }
      } else {
        // prepare absolute path
        currentFolderBasePath = `${currentFolderBasePath}/${folderName}`;
        directoryIndex.push(currentFolderBasePath);
      }
    }
    return result;
  };
  // step1: uploadFileData -> FileData
  // step2: createFile
  const createFile1 = async (
    directoryPath: string,
    file: FileWithPath,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    try {
      const filewithpath: FileWithPath = file;
      // Check if directory exist at a file path, if not create directory structure before uploading a file
      await checkAndCreateDirectoryRecursively(
        directoryPath,
        filewithpath.path
      );
      const fileData = await uploadFileData(file, filename, onProgress);
      if (fileData) {
        // const directoryPath: string = "/localhost/SkynetHub";
        // const filename: string = "SkynetHub.txt";
        // const fileData: FileData = {
        //   size: 33,
        //   chunkSize: 16777216,
        //   encryptionType: "AEAD_XCHACHA20_POLY1305",
        //   hash: "122017ff35007b75d8b4be92af2d752a0d2c944923134ae9cc81a8642d03db7cff3f",
        //   key: "5_wGHUjTszvUn3pOxL1xBFjfgyjCD4kKXQxfA7bfhk4=",
        //   ts: 1633926778331,
        //   url: "sia://AAAvo7VYN3hgzKHIihw-kFi4j7PiC4qdlrjFog0r4SU-gw",
        // };
        const tempAbsoluteFolderPath = directoryPath+filewithpath.path;
        const absoluteFolderPath = tempAbsoluteFolderPath.substring(0, tempAbsoluteFolderPath.lastIndexOf(filename));
        const status = await createFile(absoluteFolderPath, filename, fileData);
        if (status.success === true) {
          return fileData;
        } else {
          return { success: false, error: "createFile operation failed" };
        }
      } else {
        return { success: false, error: "uploadFileData operation failed" };
      }
    } catch (e) {
      return { success: false, error: e.getMessage };
    }
  };
  const uploadFileData = async (
    file: FileWithPath,
    fileName: String,
    onProgress?: (progress: number) => void
  ): Promise<FileData> => {
    // const file: File = new File(["Sample Skynet Data!"], "filename.txt", {
    //   type: "text/plain",
    //   lastModified: new Date(0).getTime(),
    // });
    console.log(`-> uploadFileData : start`);
    console.log(`uploadFileData : file Object -> ${JSON.stringify(file)}`);
    const fileData: FileData = await fileSystemDAC.uploadFileData(
      file,
      fileName,
      onProgress
    );
    console.log(`uploadFileData : fileData -> ${JSON.stringify(fileData)}`);
    console.log(`<- uploadFileData : End`);
    return fileData;
  };

  const downloadFileData = async (
    fileData: FileData,
    mimeType: string
  ): Promise<Blob> => {
    // const fileData: FileData = {
    //   size: 23,
    //   chunkSize: 16777216,
    //   encryptionType: "AEAD_XCHACHA20_POLY1305",
    //   hash: "1220588e0dbae9ef1e34164654b0490b3f5104f8a298c9274b4ed679db275aae1cbe",
    //   key: "c-lo-ljfZW5Rx7Kx9c9EYJrv045-gKAm0u5s2WG-9Xg=",
    //   ts: 1633844173248,
    //   url: "sia://AAC9eHtFMyl5rpn4wSuxqTVg7CsDbDSlB7AiFE0rIvC0nw",
    // };
    // const fileData: FileData = {
    //   size: 19,
    //   chunkSize: 16777216,
    //   encryptionType: "AEAD_XCHACHA20_POLY1305",
    //   hash: "1220347dabb67a4cdb0218ceb27c675f2f0f5253f9eaffa1688c5f72c15eda58bbc9",
    //   key: "PfTZWBE6VxUnr8JMuNpf07xmvhWOyZVI9RXskBiewWw=",
    //   ts: 1633845870700,
    //   url: "sia://AACoTK1V_3mvnA-2vmVrU621vTI0zZiS2eg71vtoh0MEZQ",
    // };
    //const mimeType: string = "txt";
    console.log(`-> downloadFileData : start`);
    console.log(
      `downloadFileData : fileData Object -> ${JSON.stringify(fileData)}`
    );
    const file: Blob = await fileSystemDAC.downloadFileData(fileData, mimeType);
    console.log(`downloadFileData : file.size -> ${file?.size}`);
    await save(file, "test.txt");
    console.log(`<- downloadFileData : End`);
    return file;
  };

  const createDirectory = async (
    path: string,
    name: string
  ): Promise<IFileSystemDACResponse> => {
    console.log(`-> createDirectory : start`);
    // const path: string = "/localhost/";
    // const name: string = "SkynetHub";
    console.log(`createDirectory : ${path} : ${name}`);
    const response = await fileSystemDAC.createDirectory(path, name);
    console.log(`createDirectory : response -> ${JSON.stringify(response)}`);
    console.log(`<- createDirectory : End`);
    return response;
  };

  const createFile = async (
    directoryPath: string,
    name: string,
    fileData: FileData
  ): Promise<IFileSystemDACResponse> => {
    console.log(`-> createFile : start`);
    // const directoryPath: string = "/localhost/SkynetHub";
    // const name: string = "firstFile.txt";
    // const fileData: FileData = {
    //   size: 23,
    //   chunkSize: 16777216,
    //   encryptionType: "AEAD_XCHACHA20_POLY1305",
    //   hash: "1220588e0dbae9ef1e34164654b0490b3f5104f8a298c9274b4ed679db275aae1cbe",
    //   key: "c-lo-ljfZW5Rx7Kx9c9EYJrv045-gKAm0u5s2WG-9Xg=",
    //   ts: 1633844173248,
    //   url: "sia://AAC9eHtFMyl5rpn4wSuxqTVg7CsDbDSlB7AiFE0rIvC0nw",
    // };
    console.log(
      `createFile : ${directoryPath} ${name} , fileData: ${JSON.stringify(
        fileData
      )}`
    );
    const response = await fileSystemDAC.createFile(
      directoryPath,
      name,
      fileData
    );
    console.log(`createFile :  response -> ${JSON.stringify(response)}`);
    console.log(`<- createFile : End`);
    return response;
  };

  const updateFile = async (
    directoryPath: string,
    name: string,
    fileData: FileData
  ): Promise<IFileSystemDACResponse> => {
    console.log(`-> updateFile : start`);
    // const directoryPath: string = "/localhost/SkynetHub";
    // const name: string = "firstFile.txt";
    // const fileData: FileData = {
    //   size: 19,
    //   chunkSize: 16777216,
    //   encryptionType: "AEAD_XCHACHA20_POLY1305",
    //   hash: "1220347dabb67a4cdb0218ceb27c675f2f0f5253f9eaffa1688c5f72c15eda58bbc9",
    //   key: "PfTZWBE6VxUnr8JMuNpf07xmvhWOyZVI9RXskBiewWw=",
    //   ts: 1633845870700,
    //   url: "sia://AACoTK1V_3mvnA-2vmVrU621vTI0zZiS2eg71vtoh0MEZQ",
    // };
    console.log(`updateFile : ${directoryPath} ${name} ${fileData}`);
    const response = await fileSystemDAC.updateFile(
      directoryPath,
      name,
      fileData
    );
    console.log(`updateFile : response -> ${JSON.stringify(response)}`);
    console.log(`<- updateFile : End`);
    return response;
  };

  const getDirectoryIndex = async (path: string): Promise<DirectoryIndex> => {
    console.log(`-> getDirectoryIndex : start`);
    //const path: string = "/localhost/SkynetHub";
    console.log(`getDirectoryIndex : ${path}`);
    const rootDirectoryIndex = await fileSystemDAC.getDirectoryIndex(path);
    console.log(
      `getDirectoryIndex : rootDirectoryIndex -> ${JSON.stringify(
        rootDirectoryIndex
      )}`
    );
    console.log(`<- getDirectoryIndex : End`);
    return rootDirectoryIndex;
  };

  const shareDirectory = async (path: string): Promise<string> => {
    console.log(`-> shareDirectory : start`);
    //const path: string = "/localhost/SkynetHub";
    console.log(`shareDirectory : ${path}`);
    const response = await fileSystemDAC.getShareUriReadOnly(path);
    console.log(`shareDirectory : response -> ${response}`);
    console.log(`<- shareDirectory : End`);
    return response;
  };

  const value = {
    createFile1,
    uploadFileData,
    downloadFileData,
    createDirectory,
    createFile,
    updateFile,
    getDirectoryIndex,
    shareDirectory,
  };
  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
}
