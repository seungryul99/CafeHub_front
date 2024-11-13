// jwtRefresh.js

import axios from 'axios';

// 쿠키에서 토큰을 추출하는 함수
const getTokenFromCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받는 함수
export const refreshAccessToken = async () => {
    try {
        const refreshToken = getTokenFromCookie('JwtRefreshToken'); // 쿠키에서 리프레시 토큰 가져오기
        if (!refreshToken) {
            throw new Error('리프레시 토큰이 쿠키에 없습니다.');
        }

        // 리프레시 토큰을 서버로 보내 액세스 토큰을 재발급받기
        const response = await axios.post(`${process.env.REACT_APP_APIURL}/reissue/token`, {}, {
            headers: {
                Authorization: `Bearer ${refreshToken}` // 리프레시 토큰을 Authorization 헤더에 담아서 전송
            },
            withCredentials: true, // 쿠키를 포함한 요청
        });

        // 새로 발급된 액세스 토큰을 쿠키에 저장
        const newAccessToken = response.data.accessToken;
        document.cookie = `JwtAccessToken=${newAccessToken}; Path=/; SameSite=Strict; Secure`; // 액세스 토큰 쿠키 설정

        return newAccessToken;
    } catch (error) {
        console.error('액세스 토큰 재발급 실패:', error);
        throw new Error('액세스 토큰을 재발급할 수 없습니다.');
    }
};

// Axios 요청을 인터셉트하여 401 에러 발생 시 리프레시 토큰을 사용해 새 액세스 토큰을 발급받고 재요청하는 로직
export const axiosInterceptor = () => {
    axios.interceptors.response.use(
        (response) => response, // 정상 응답 처리
        async (error) => {
            if (error.response && error.response.status === 401) {
                // 401 에러 발생 시 리프레시 토큰을 사용하여 액세스 토큰 재발급
                try {
                    const newAccessToken = await refreshAccessToken(); // 새로운 액세스 토큰을 가져옴
                    error.config.headers['Authorization'] = `Bearer ${newAccessToken}`; // 새 액세스 토큰으로 재요청
                    return axios(error.config); // 재요청
                } catch (refreshError) {
                    // 리프레시 토큰으로도 새로운 액세스 토큰을 발급받을 수 없는 경우
                    console.error('토큰 갱신 실패:', refreshError);
                    window.location.href = '/login'; // 로그인 페이지로 리다이렉트
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error); // 다른 에러는 그대로 반환
        }
    );
};
