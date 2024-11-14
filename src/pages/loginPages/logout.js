import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/loading';

const Logout = ({ setIsLogin }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken'); // 세션 저장소에서 jwtAccessToken 추출

        if (accessToken) {
            // 세션 저장소에서 accessToken 제거
            localStorage.removeItem('accessToken');
            setIsLogin(null); // setIsLogin으로 상태 업데이트
        } else {
            console.error('토큰이 세션 스토리지에 포함되지 않았습니다.');
        }

        navigate('/'); // 메인 페이지로 리다이렉트

    }, [navigate, setIsLogin]); // setIsLogin을 의존성 배열에 추가

    return <Loading />; // 로딩 중일 때 보여줄 컴포넌트
};

export default Logout;
