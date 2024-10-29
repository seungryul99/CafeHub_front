import style from "./title.module.css";
import Kakao from "../../asset/img/img_kakaotalk.png";
import { Link } from "react-router-dom";
import React from 'react';

function Title({ setSelectedId, isLogin, setIsLogin }) {
    const SocialKakao = () => {
        const kakaoURL = 'http://localhost:8080/api/member/login/kakao';

        const handleLogin = () => {
            // 카카오 로그인 요청을 서버로 보낸 후 서버가 리다이렉트 URL을 응답함
            window.location.href = kakaoURL; // 카카오 로그인 요청 URL로 리다이렉트
        };

        return !isLogin && ( // isLogin이 false일 때만 로그인 버튼 표시
            <div className={style.loginBtn} onClick={handleLogin}>
                <img src={Kakao} className={style.kakao} alt="Kakao 로그인" />
                <span className={style.loginText}>로그인</span>
            </div>
        );
    }

    const handleClick = () => {
        setSelectedId(1);
    }

    return (
        <>
            <header className={style.topBar}>
                <Link to="/" onClick={handleClick}>
                    <span className={style.cafeHub}>CafeHub</span>
                </Link>
                <SocialKakao />
            </header>
        </>
    );
}

export default Title;
