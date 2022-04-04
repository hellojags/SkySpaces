import { createHash } from "crypto";

import { ChonkyIconName } from "@skynethubio/web3-file-explorer";
export const convert2ChonkyFileData = (upload, isDirectory): any => {
  console.log(`convert2ChonkyFileData: upload : ${JSON.stringify(upload)}`);
  let chonkyCustomFileData = null;
  if (isDirectory) {
    chonkyCustomFileData = {
      id: upload?.fileData?.hash, // (Required) String that uniquely identifies the file
      name: upload.absoluteFolderPath.split("/")[upload.absoluteFolderPath.split("/").length-2], // (Required) Full name, e.g. `MyImage.jpg`
      ext: "", // File extension, e.g. `.jpg`
      isDir: isDirectory, // Is a directory, default: false
      isHidden: false, // Is a hidden file, default: false
      isSymlink: false, // Is a symlink, default: false
      isEncrypted: true, // Is encrypted in some way, default: false
      openable: true, // Can be opened, default: true
      selectable: true, // Can be selected, default: true
      draggable: true, // Can be dragged, default: true
      droppable: true, // Can have files dropped into it, default: true for folders
      //size: upload?.fileData?.size, // File size in bytes
      //modDate: "" + upload?.fileData?.ts, // Last change date (or its string representation)
      childrenCount: 0, // Number of files inside of a folder (only for folders)
      // Default preview overriding
      color: "green", // Color to use for this file
      icon: ChonkyIconName.folder, // Icon to use for this file
      thumbnailUrl: null, // Automatically load thumbnail from this URL
      chunkSize: upload?.fileData?.chunkSize, // Any other user-defined property
      encryptionType: upload?.fileData?.encryptionType,
      url: upload?.fileData?.url,
      fsdacExt: {},
      parentId: null,
      childrenIds: [],
    };
  } else {
    chonkyCustomFileData = {
      id: upload?.fileData?.hash, // (Required) String that uniquely identifies the file
      name: upload?.file?.name, // (Required) Full name, e.g. `MyImage.jpg`
      ext: "", // File extension, e.g. `.jpg`
      isDir: upload?.mode === "directory" ? true : false, // Is a directory, default: false
      isHidden: false, // Is a hidden file, default: false
      isSymlink: false, // Is a symlink, default: false
      isEncrypted: true, // Is encrypted in some way, default: false
      openable: true, // Can be opened, default: true
      selectable: true, // Can be selected, default: true
      draggable: true, // Can be dragged, default: true
      droppable: true, // Can have files dropped into it, default: true for folders
      size: upload?.fileData?.size, // File size in bytes
      modDate: "" + upload?.fileData?.ts, // Last change date (or its string representation)
      childrenCount: 0, // Number of files inside of a folder (only for folders)
      // Default preview overriding
      color: "green", // Color to use for this file
      icon: ChonkyIconName.file, // Icon to use for this file
      thumbnailUrl: null, // Automatically load thumbnail from this URL
      chunkSize: upload?.fileData?.chunkSize, // Any other user-defined property
      encryptionType: upload?.fileData?.encryptionType,
      url: upload?.fileData?.url,
      fsdacExt: {},
    };
  }
  return [chonkyCustomFileData];
};
// prepare Files CustomFileData
export const getChonkyCustomFileData = (fileData, isDirectory) => {
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
      color: "green", // Color to use for this file
      icon: ChonkyIconName.folder, // Icon to use for this file
      thumbnailUrl: null, // Automatically load thumbnail from this URL
      chunkSize: fileData?.file?.chunkSize ?? 0, // Any other user-defined property
      encryptionType: fileData?.file?.encryptionType ?? "",
      url: fileData?.file?.url ?? "",
      fsdacExt: {},
      parentId: null,
      childrenIds: [],
    };
  } else {
    chonkyCustomFileData = {
      //[fileData?.file?.hash]: {
      id: fileData?.file?.hash, // (Required) String that uniquely identifies the file
      name: fileData?.name, // (Required) Full name, e.g. `MyImage.jpg`
      ext: fileData?.name.split(".").pop(), // File extension, e.g. `.jpg`
      isDir: isDirectory, // Is a directory, default: false
      isHidden: false, // Is a hidden file, default: false
      isSymlink: false, // Is a symlink, default: false
      isEncrypted: true, // Is encrypted in some way, default: false
      openable: true, // Can be opened, default: true
      selectable: true, // Can be selected, default: true
      draggable: true, // Can be dragged, default: true
      droppable: true, // Can have files dropped into it, default: true for folders
      size: fileData?.file?.size, // File size in bytes
      modDate: "" + fileData?.modified, // Last change date (or its string representation)
      childrenCount: 0, // Number of files inside of a folder (only for folders)
      // Default preview overriding
      color: "green", // Color to use for this file
      icon: ChonkyIconName.file, // Icon to use for this file
      thumbnailUrl: null, // Automatically load thumbnail from this URL
      chunkSize: fileData?.file?.chunkSize, // Any other user-defined property
      encryptionType: fileData?.file?.encryptionType,
      url: fileData?.file.url,
      fsdacExt: {},
      parentId: "",
      childrenIds: [],
      //}
    };
  }
  return chonkyCustomFileData;
};
