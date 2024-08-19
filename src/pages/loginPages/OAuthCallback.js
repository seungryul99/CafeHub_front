import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/loading';
import { Cookies, useCookies } from 'react-cookie';

const OAuthCallback = ({ setIsLogin }) => {
    const code = new URL(window.location.href).searchParams.get('code');
    const navigate = useNavigate();

    useEffect(() => {
        const getToken = async () => {
            try {
                const response = await axios
                    .get(
                        `${process.env.REACT_APP_APIURL}/api/member/login/kakao?code=${code}`,
                    )
                    .then(res => {

                        console.log("해치웠나?");

                        const authorizationToken = res.headers.get("Authorization");
                        console.log(authorizationToken)


                        if (authorizationToken) {
                            // JWT 토큰을 세션 스토리지에 저장
                            sessionStorage.setItem('accessToken', authorizationToken);
                            setIsLogin(sessionStorage.getItem('accessToken'))

                            navigate('/');
                        } else {
                            console.error('토큰이 응답 헤더에 포함되지 않았습니다.');
                        }
                    })
                    .catch((error) => {
                        console.error('로그인 실패:', error);
                    });
            } catch (e) {
                console.error(e);
            }

        };
        getToken();

    }, []);
    return <Loading />
};

export default OAuthCallback;
