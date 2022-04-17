import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { IProfileOptions } from "@skynethub/userprofile-library/dist/types";
import { useSkynet } from "../skynet";
import { UserProfileDAC } from "@skynethub/userprofile-library";

type State = {
    userDetails,
    getProfile(userID: string, options?: IProfileOptions): Promise<any>; //directory is getting created and success or failure is returned
};
//Create Skynet Context
const UserProfileContext = createContext({} as State);

//Custom Hook for Functional component access
export const useUserProfile = () => useContext(UserProfileContext);

type Props = {
    children: React.ReactNode;
};

export function UserProfileProvider({ children }: Props) {
    const { userID } = useSkynet();
    const [userDetails, setUserDetails] = useState();
    const [userProfileDAC, setUserProfileDAC] = useState(new UserProfileDAC() as any);

    useEffect(() => {
        if (userID) {
            getProfile(userID);
        }
    }, [userID])

    const getProfile = async (
        userID: string, options?: IProfileOptions
    ): Promise<any> => {
        console.log(`-> get userprofile starts : start`);
        let userData;
        if(userID) {
            userData = await userProfileDAC.getProfile(userID);
            setUserDetails(userData);
            console.log(userData, 'user profile details');
        }
        return userData;
    };

    const value = {
        userDetails,
        getProfile
    };
    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}
