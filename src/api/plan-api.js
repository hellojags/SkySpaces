import axios from 'axios';
import { token } from '../constants/apiConstant';

const statsUrl = `https://account.skynetfree.net/api/user/stats`;
const userUrl = `https://account.skynetfree.net/api/user`;
const config = {
    headers: {
        withCredentials: true,
        Cookies: '__stripe_mid=' + token,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Method': 'POST, GET, OPTIONS',
    }
}
export function getUserPlanDetails() {
    return axios.get(userUrl, config);
}

export function getUserStatsDetails() {
    return axios.get(statsUrl, config
    )
        .then(res => {
            console.log(res);
            return res;
        })
        .catch((error) => {
            return error;
        });
}