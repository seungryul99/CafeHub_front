import style from "./title.module.css"

import Kakao from "../../asset/img/img_kakaotalk.png"
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from "axios";

function Title({setSelectedId, isLogin }){

    const SocialKakao = ()=> {

        const kakaoURL = 'http://localhost:8080/api/member/login';

        const HandleLogin = () => {
            // 카카오 로그인 요청을 서버로 보낸 후 서버가 리다이렉트 URL을 응답함
            window.location.href = kakaoURL; // 카카오 로그인 요청 URL로 리다이렉트
        };


        console.log("here")
        const token = sessionStorage.getItem('accessToken')
        console.log("token : " + token)



        return !token &&
        <div className={style.loginBtn} onClick={HandleLogin}>
            <img src={Kakao} className={style.kakao}></img>
            <span className={style.loginText}>로그인</span>
        </div>
    }



    const handleClick = () => {
        setSelectedId(1);
      }
    return (
        <>
            <header className={style.topBar}>
                <Link to="/" onClick={handleClick}><span className={style.cafeHub}>CafeHub</span></Link>
                <SocialKakao/>
            </header>

        </>
    )
}
export default Title;
