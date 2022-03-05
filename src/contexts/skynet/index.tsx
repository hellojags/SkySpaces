import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { MySky, SkynetClient } from "skynet-js";
import { FileSystemDAC } from "fs-dac-library";
// Initiate the SkynetClient
//const portal = "https://skynetpro.net";
const portal = "https://fileportal.org";
const client = new SkynetClient(portal);
const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
const dataDomain =  hostname === 'localhost' ? 'localhost' : 'skyspaces.hns'

type State = {
  mySky: MySky;
  userID: string;
  fileSystemDAC : any;
  dataDomain: string;
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
};

//Create Skynet Context
const SkynetContext = createContext({} as State);

//Custom Hook for Functional component access
export const useSkynet = () => useContext(SkynetContext);

type Props = {
  children: React.ReactNode;
};

export function SkynetProvider({ children }: Props) {
  const [userID, setUserID] = useState<string>();
  const [mySky, setMySky] = useState<any>();
  const [loggedIn, setLoggedIn] = useState(false);
  const [fileSystemDAC, setFileSystemDAC] = useState(new FileSystemDAC() as any);
  //const fileSystemDAC = new FileSystemDAC() as any;
  // On initial run, start initialization of MySky
  useEffect(() => {
    async function initMySky() {
      try {
        // load invisible iframe and define app's data domain
        // needed for permissions write
        const mySky = await client.loadMySky(dataDomain, { debug: true });
        // load necessary DACs and permissions
        await mySky.loadDacs(fileSystemDAC);
        // check if user is already logged in with permissions
        const loggedIn = await mySky.checkLogin();
        console.log("loggedIn: "+loggedIn);
        // set react state for login status and
        // to access mySky in rest of app
        setMySky(mySky);
        setLoggedIn(loggedIn);
        if (loggedIn) {
          setUserID(await mySky.userID());
        }
      } catch (e) {
        console.error(e);
      }
    }
    // call async setup function
    initMySky();
  }, []);
  // eslint-disable-next-line
  const login = async () => {
    // Try login again, opening pop-up. Returns true if successful
    const status = await mySky!.requestLoginAccess();
    // set react state
    setLoggedIn(status);
    if (status) {
      setUserID(await mySky!.userID());
      console.log(`Login Success: UserID ${userID}`);
    }
  };
  // eslint-disable-next-line
  const logout = async () => {
    // call logout to globally logout of mysky
    await mySky!.logout();
    //set react state
    setLoggedIn(false);
    setUserID("");
    console.log(`Logout Success: UserID ${userID}`);
  };
  const value = {
    mySky,
    userID,
    fileSystemDAC,
    dataDomain,
    loggedIn,
    login,
    logout,
  };
  return (
    <SkynetContext.Provider value={value}>{children}</SkynetContext.Provider>
  );
}
