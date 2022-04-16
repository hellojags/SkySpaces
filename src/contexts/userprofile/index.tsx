import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  import { MySky, SkynetClient } from "skynet-js";
  import { UserProfileDAC } from "@skynethub/userprofile-library";
  // Initiate the SkynetClient
  //const portal = "https://skynetpro.net";
  const portal = "https://siasky.net";
  const client = new SkynetClient(portal);
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const dataDomain =  hostname === 'localhost' ? 'localhost' : 'skyspaces.hns'
  
  type State = {
    userProfileDAC : any;
    getUserProfile: () => void;
  };
  
  //Create Skynet Context
  const UserProfileContext = createContext({} as State);
  
  //Custom Hook for Functional component access
  export const useUserProfile = () => useContext(UserProfileContext);
  
  type Props = {
    children: React.ReactNode;
  };
  
  export function UserProfileProvider({ children }: Props) {
    const [userID, setUserID] = useState<string>();
    const [mySky, setMySky] = useState<any>();
    const [userProfile, setUserProfile] = useState<any>();
    const [loggedIn, setLoggedIn] = useState(false);
    const [userProfileDAC, setUserProfileDAC] = useState(new UserProfileDAC() as any);
    //const fileSystemDAC = new FileSystemDAC() as any;
    // On initial run, start initialization of MySky
    useEffect(() => {
      async function initMySky() {
        try {
          // load invisible iframe and define app's data domain
          // needed for permissions write
          const mySky = await client.loadMySky(dataDomain, { debug: true });
          // load necessary DACs and permissions
          await mySky.loadDacs(userProfileDAC);
          // check if user is already logged in with permissions
          const loggedIn = await mySky.checkLogin();
          console.log("loggedIn from user profile: "+loggedIn);
          // set react state for login status and
          // to access mySky in rest of app
          setMySky(mySky);
          setLoggedIn(loggedIn);
          if (loggedIn) {
            setUserID(await mySky.userID());
            console.log(userID);
          }
        } catch (e) {
          console.error(e);
        }
      }
      // call async setup function
      initMySky();
    }, []);
    // eslint-disable-next-line
    const getUserProfile = async () => {
      // Try login again, opening pop-up. Returns true if successful
      /* const status = await mySky.checkLogin();
      setLoggedIn(status); */
      console.log(userID, 'userId from user profile context');
      if (userID) {
        const userProfile = await mySky.getProfile(userID);
        setUserProfile(userProfile);
        console.log(userProfile);
      }
    };
    // eslint-disable-next-line
    const value = {
      userProfileDAC,
      getUserProfile,
    };
    return (
      <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
    );
  }
  