import * as React from 'react';
import { useState, useCallback, useEffect, useMemo, useRef, createRef } from 'react';
import { filter } from 'lodash';
//import DemoFsMap from '../../_mocks_/chonky_data.json';
import DemoFsMap from '../../_mocks_/chonky_skyfs_data.json';
import {
  ChonkyActions,
  ChonkyActionUnion,
  GenericFileActionHandler,
  ChonkyFileActionData,
  FileArray,
  FileBrowserProps,
  FileData,
  FileHelper,
  FullFileBrowser,
  setChonkyDefaults,
  defineFileAction,
  ChonkyIconName
} from 'chonky';
import { useFileManager } from '../../contexts';

// Custom File Action
export const addUploadedFiles = defineFileAction({
  id: 'add_uploaded_files',
  // hotkeys: ['ctrl+o'],
  // button: {
  //   name: 'Add Uploaded Files',
  //   toolbar: true,
  //   contextMenu: true,
  //   icon: ChonkyIconName.flash,
  // },
  __payloadType: {} as CustomFileData,
})
//
// Define your actions
// const customActionOne = defineFileAction({
//   id: 'custom-one',
//   __payloadType: {} as { one: string },
// } as const);
// const customActionTwo = defineFileAction({
//   id: 'custom-two',
//   __payloadType: {} as { two: string },
// } as const);
// Define your types
//type CustomActionUnion = typeof customActionOne | typeof customActionTwo;
type CustomActionUnion = typeof addUploadedFiles;
export type CustomHandler = GenericFileActionHandler<ChonkyActionUnion | CustomActionUnion>;

const fileActions =  [
    ChonkyActions.CreateFolder,
    ChonkyActions.DeleteFiles,
    ChonkyActions.UploadFiles,
    ChonkyActions.DownloadFiles,
    ChonkyActions.DeleteFiles,
    ChonkyActions.CopyFiles,
  ];

export const customFileActions = [...fileActions,addUploadedFiles];

//-- end

// ----------------------------------------------------------------------
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

// We define a custom interface for file data because we want to add some custom fields
// to Chonky's built-in `FileData` interface.
export interface CustomFileData extends FileData {
  parentId?: string;
  childrenIds?: string[];
}
interface CustomFileMap {
  [fileId: string]: CustomFileData;
}

// Helper method to attach our custom TypeScript types to the imported JSON file map.
const prepareCustomFileMap = () => {
  const baseFileMap = DemoFsMap.fileMap as unknown as CustomFileMap;
  const rootFolderId = DemoFsMap.rootFolderId;
  return { baseFileMap, rootFolderId };
};



// Hook that sets up our file map and defines functions used to mutate - `deleteFiles`,
// `moveFiles`, and so on.
export const useCustomFileMap = () => {
  //const { getDirectoryIndex, createDirectory } = useFileManager();
  
  let { baseFileMap, rootFolderId } = useMemo(prepareCustomFileMap, []);

  // Setup the React state for our file map and the current folder.
  const [fileMap, setFileMap] = useState(baseFileMap);
  const [currentFolderId, setCurrentFolderId] = useState(rootFolderId);


  // Setup the function used to reset our file map to its initial value. Note that
  // here and below we will always use `useCallback` hook for our functions - this is
  // a crucial React performance optimization, read more about it here:
  // https://reactjs.org/docs/hooks-reference.html#usecallback
  const resetFileMap = useCallback(() => {
    setFileMap(baseFileMap);
    setCurrentFolderId(rootFolderId);
  }, [baseFileMap, rootFolderId]);

  // Setup logic to listen to changes in current folder ID without having to update
  // `useCallback` hooks. Read more about it here:
  // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables
  const currentFolderIdRef = useRef(currentFolderId);
  useEffect(() => {
    currentFolderIdRef.current = currentFolderId;
  }, [currentFolderId]);

  //ChonkyActions.UploadFiles, ChonkyActions.DownloadFiles, ChonkyActions.DeleteFiles, ChonkyActions.CopyFiles

  // Function that will be called when user creates a new folder using the toolbar
  // button. That that we use incremental integer IDs for new folder, but this is
  // not a good practice in production! Instead, you should use something like UUIDs
  // or MD5 hashes for file paths.
  const uploadFiles = useCallback((files: CustomFileData[]) => {
    setFileMap((currentFileMap) => {
      // Create a copy of the file map to make sure we don't mutate it.
      const newFileMap = { ...currentFileMap };
      //console.log(`files -> ${JSON.stringify(files)}`)
      files.forEach((file) => {
        // Add files to the file map.
        newFileMap[file.id] = {
          ...file,
          modDate: new Date(),
          parentId: currentFolderIdRef.current
        };
        file.parentId = currentFolderIdRef.current;
        // Update the parent folder to make sure new files are added as children objects
        if (file.parentId) {
          const parent = newFileMap[file.parentId]!;
          //parent.childrenIds!.push(file.id);
          //const newChildrenIds = parent.childrenIds!.push(file.id);
          newFileMap[file.parentId] = {
            ...parent,
            childrenIds: [...parent.childrenIds!, file.id],
            childrenCount: parent.childrenIds.length
          };
        }
      });
      baseFileMap = newFileMap;
      //console.log(`newFileMap -> ${JSON.stringify(newFileMap)}`)
      return newFileMap;
    });
  }, []);

  // Function that will be called when user deletes files either using the toolbar
  // button or `Delete` key.
  const deleteFiles = useCallback((files: CustomFileData[]) => {
    // We use the so-called "functional update" to set the new file map. This
    // lets us access the current file map value without having to track it
    // explicitly. Read more about it here:
    // https://reactjs.org/docs/hooks-reference.html#functional-updates
    setFileMap((currentFileMap) => {
      // Create a copy of the file map to make sure we don't mutate it.
      const newFileMap = { ...currentFileMap };

      files.forEach((file) => {
        // Delete file from the file map.
        delete newFileMap[file.id];

        // Update the parent folder to make sure it doesn't try to load the
        // file we just deleted.
        if (file.parentId) {
          const parent = newFileMap[file.parentId]!;
          const newChildrenIds = parent.childrenIds!.filter((id) => id !== file.id);
          newFileMap[file.parentId] = {
            ...parent,
            childrenIds: newChildrenIds,
            childrenCount: newChildrenIds.length
          };
        }
      });

      return newFileMap;
    });
  }, []);

  // Function that will be called when files are moved from one folder to another
  // using drag & drop.
  const moveFiles = useCallback(
    (files: CustomFileData[], source: CustomFileData, destination: CustomFileData) => {
      setFileMap((currentFileMap) => {
        const newFileMap = { ...currentFileMap };
        const moveFileIds = new Set(files.map((f) => f.id));

        // Delete files from their source folder.
        const newSourceChildrenIds = source.childrenIds!.filter((id) => !moveFileIds.has(id));
        newFileMap[source.id] = {
          ...source,
          childrenIds: newSourceChildrenIds,
          childrenCount: newSourceChildrenIds.length
        };

        // Add the files to their destination folder.
        const newDestinationChildrenIds = [...destination.childrenIds!, ...files.map((f) => f.id)];
        newFileMap[destination.id] = {
          ...destination,
          childrenIds: newDestinationChildrenIds,
          childrenCount: newDestinationChildrenIds.length
        };

        // Finally, update the parent folder ID on the files from source folder
        // ID to the destination folder ID.
        files.forEach((file) => {
          newFileMap[file.id] = {
            ...file,
            parentId: destination.id
          };
        });

        return newFileMap;
      });
    },
    []
  );

  // Function that will be called when user creates a new folder using the toolbar
  // button. That that we use incremental integer IDs for new folder, but this is
  // not a good practice in production! Instead, you should use something like UUIDs
  // or MD5 hashes for file paths.
  const idCounter = useRef(0);
  const createFolder = useCallback((folderName: string) => {
    setFileMap((currentFileMap) => {
      const newFileMap = { ...currentFileMap };

      // Create the new folder
      //TODO: create valid folderID
      const newFolderId = `new-folder-${idCounter.current++}`;
      newFileMap[newFolderId] = {
        id: newFolderId,
        name: folderName,
        isDir: true,
        modDate: new Date(),
        parentId: currentFolderIdRef.current,
        childrenIds: [],
        childrenCount: 0
      };

      // Update parent folder to reference the new folder.
      const parent = newFileMap[currentFolderIdRef.current];
      newFileMap[currentFolderIdRef.current] = {
        ...parent,
        childrenIds: [...parent.childrenIds!, newFolderId]
      };

      return newFileMap;
    });
  }, []);

  return {
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    resetFileMap,
    deleteFiles,
    moveFiles,
    createFolder,
    uploadFiles
  };
};

export const useFiles = (fileMap: CustomFileMap, currentFolderId: string): FileArray => {
  return useMemo(() => {
    const currentFolder = fileMap[currentFolderId];
    const childrenIds = currentFolder.childrenIds!;
    const files = childrenIds.map((fileId: string) => fileMap[fileId]);
    return files;
  }, [currentFolderId, fileMap]);
};

export const useFolderChain = (fileMap: CustomFileMap, currentFolderId: string): FileArray => {
  return useMemo(() => {
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
    return folderChain;
  }, [currentFolderId, fileMap]);
};