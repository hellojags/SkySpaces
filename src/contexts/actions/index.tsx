import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  // Initiate the SkynetClient
  //const portal = "https://skynetpro.net";
  /* const portal = "https://siasky.net";
  const client = new SkynetClient(portal); */
  
  type State = {
    actionsMsg: string;
    setActionMsg: (msg) => void;
    folderPath: string;
    setCurrentFolderPath: (folderPath)=> void;
    setSelectedFile: (file) => void;
  };
  
  //Create Skynet Context
  const ActionContext = createContext({} as State);
  
  //Custom Hook for Functional component access
  export const useAction = () => useContext(ActionContext);
  
  type Props = {
    children: React.ReactNode;
  };
  
  export function ActionProvider({ children }: Props) {
    const [actionsMsg, setActionsMsg] = useState('');
    const [folderPath, setFolderPath] = useState('/localhost/');
    const [selectedFiles, setSelectedFiles] = useState([]);
    //const fileSystemDAC = new FileSystemDAC() as any;
    // On initial run, start initialization of MySky
    useEffect(() => {
    }, []);
    // eslint-disable-next-line
    const setActionMsg = (msg) => {
      setActionsMsg(msg);
      console.log(actionsMsg);
    };
    const setCurrentFolderPath = (path) => {
      setFolderPath(path);
      console.log(folderPath);
    };

    const setSelectedFile = (file) => {
      let files = [];
      files.push(file);
      setSelectedFiles([...file]);
      console.log(selectedFiles);
    }
    // eslint-disable-next-line
    const value = {
      actionsMsg,
      setActionMsg,
      folderPath,
      setCurrentFolderPath,
      setSelectedFile,
      selectedFiles
    };
    return (
      <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
    );
  }
  