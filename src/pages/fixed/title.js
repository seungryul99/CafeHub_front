import style from "./title.module.css"

import Kakao from "../../asset/img/img_kakaotalk.png"
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from "axios";

function Title({setSelectedId, isLogin }){
    
    const SocialKakao = ()=> {
        const Rest_api_key= process.env.REACT_APP_Rest_api_key
        const redirect_uri = `http://13.209.177.1:3000/OAuthCallback`
        // oauth 요청 URL
        const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${Rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`
        const HandleLogin = ()=>{
            window.location.href = kakaoURL
        }
        const token = sessionStorage.getItem('accessToken')
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
