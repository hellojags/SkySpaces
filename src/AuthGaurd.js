import { useEffect } from 'react'
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkynet } from './contexts/skynet';
function AuthGaurd(props) {
    const navigate = useNavigate();
    const { mySky, logout } = useSkynet();

    const checkLogin = useCallback(async () => {
        console.log('first check');
        if (mySky) {
            const loggedIn = await mySky.checkLogin();
            if (!loggedIn) {
                await logout();
                navigate('/login', { replace: true });
                console.log(loggedIn, 'final check');
            }
        }
    }, [mySky, logout, navigate]);


    useEffect(() => {
        checkLogin();
    }, [mySky, checkLogin]);

    return (
        props.component
    )
}

export default AuthGaurd;