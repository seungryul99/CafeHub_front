import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/loading';

const OAuthCallback = ({ setIsLogin }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // 쿠키에서 jwtAccessToken을 가져옵니다.
        const getAccessTokenFromCookie = () => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; JwtAccessToken=`); // 'JwtAccessToken'으로 분리
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const accessToken = getAccessTokenFromCookie(); // 쿠키에서 jwtAccessToken 추출
        if (accessToken) {
            // JWT 토큰을 세션 스토리지에 저장
            sessionStorage.setItem('accessToken', accessToken);
            setIsLogin(accessToken); // 로그인 상태 업데이트

            // 쿠키를 삭제합니다.
            document.cookie = "JwtAccessToken=; Max-Age=0; Path=/; SameSite=Strict"; // 'JwtAccessToken' 삭제

            navigate('/'); // 메인 페이지로 리다이렉트
        } else {
            console.error('토큰이 쿠키에 포함되지 않았습니다.');
        }
    }, []);

    return <Loading />; // 로딩 중일 때 보여줄 컴포넌트
};

export default OAuthCallback;
