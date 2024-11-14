import React, { useEffect, useState } from 'react';
import styled from '../../styles/GlobalStyle.module.css';
import style from "./myPage.module.css";
import NicknameArti from '../../asset/icon/icon_nicknameAlt.png';
import MyReview from '../../asset/icon/icon_myReview.png';
import MyComment from '../../asset/icon/icon_myComment.png';
import GoodBye from '../../asset/icon/icon_goodBye.png';
import MyAsk from '../../asset/icon/icon_myAsk.png';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { ReactComponent as Icon_logout } from "../../asset/icon/icon_logout.svg";
import { ReactComponent as Icon_camera } from "../../asset/icon/icon_camera.svg";
import { ReactComponent as Icon_mail } from "../../asset/icon/icon_mail.svg";
import { ReactComponent as Icon_nickname } from "../../asset/icon/icon_myPage.svg";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BasicImg from "../../asset/img/img_basicUserPhoto.png";
import Loading from '../../components/loading';
import { KakaoLogin } from '../../components/kakaoLogins/kakaoLogin';

function MyPage({ setSelectedId, setIsLogin }) {
    const [userData, setUserData] = useState(null);
    const [userNickname, setUserNickname] = useState('');
    const [userProfileImg, setUserProfileImg] = useState(BasicImg);
    const [loading, setLoading] = useState(false);
    const [reRender, setReRender] = useState(false);
    const token = localStorage.getItem('accessToken');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            KakaoLogin();
        } else {
            fetchUserData();
        }
    }, [token, reRender]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_APIURL}/api/auth/mypage`, {
                headers: { 'Authorization': token },
                withCredentials: true
            });
            const { data } = res.data;
            setUserData(data);
            setUserNickname(data.nickname);
            console.log(data.memberImgUrl)
            setUserProfileImg(data.memberImgUrl === "DefaultImage" ? BasicImg : data.memberImgUrl);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/member/logout`, {}, {
                headers: { 'Authorization': token }
            });
            window.location.href = res.data.data;
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const updateProfileImage = async (file) => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("profileImg", file);

        try {
            await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/mypage/profileImg`, formData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setReRender(prev => !prev); // Trigger re-render
        } catch (error) {
            console.error('Error updating image:', error);
        } finally {
            setLoading(false);
        }
    };

        const updateNickname = async () => {
            if (userNickname.trim().length < 2) return;
            setLoading(true);
            try {
                await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/mypage/nickname`, { nickname: userNickname }, {
                    headers: {
                        'Authorization': token
                    }
                });
                setReRender(prev => !prev);
            } catch (error) {
                console.error('Error updating nickname:', error);
            } finally {
                setLoading(false);
            }
        };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUserProfileImg(URL.createObjectURL(file)); // Preview the selected file
            updateProfileImage(file);
        }
    };

    const handleNicknameChange = (event) => {
        setUserNickname(event.target.value);
    };

    // Loading 상태일 경우 Loading 컴포넌트만 렌더링
    if (loading) {
        return <Loading />;
    }

    // userData가 없을 경우에는 null을 반환하여 아무것도 렌더링하지 않음
    if (!userData) {
        return null;
    }

    return (
        <div className={styled.page_wrapper}>
            <main className={styled.main_container}>
                <article className={style.profile}>
                    <article className={style.profileInfoLogout}>
                        <span className={style.profileInfo}>프로필 정보</span>
                        <button type="button" className={style.logoutBtn} onClick={handleLogout}>
                            <span>로그아웃</span>
                            <Icon_logout className={style.logout} />
                        </button>
                    </article>

                    <article className={style.photoArti}>
                        <img src={userProfileImg} className={style.photo} alt="Profile" />
                        <label htmlFor="file" className={style.photoAltWrapper}>
                            <Icon_camera className={style.photoAlt} />
                        </label>
                        <input
                            type="file"
                            id="file"
                            onChange={handleFileChange}
                            className={style.fileInput}
                            accept="image/jpg,image/png,image/jpeg"
                        />
                    </article>

                    <article className={style.container}>
                        <article className={style.nicknameArti}>
                            <div className={style.nickDiv}>
                                <Icon_nickname className={style.nicknameIcon} />
                                <input type="text" value={userNickname} className={style.nickText} onChange={handleNicknameChange} />
                            </div>
                            <img
                                src={NicknameArti}
                                className={style.nicknameArtiIcon}
                                onClick={updateNickname}
                                alt="Update Nickname"
                            />
                        </article>

                        <article className={style.emailArti}>
                            <Icon_mail className={style.nicknameIcon} />
                            <input type="text" value={userData.email} className={style.emailText} readOnly />
                        </article>
                    </article>
                </article>

                <ul className={style.ulList}>
                    {myList.map((data) => (<MyPagelist key={data.id} props={data} />))}
                </ul>
            </main>
        </div>
    );
}

export default MyPage;

const myList = [
    { id: 1, src: MyReview, title: "내 리뷰" },
    { id: 2, src: MyComment, title: "내 댓글" },
    { id: 5, src: GoodBye, title: "회원탈퇴" },
    { id: 6, src: MyAsk, title: "문의하기" }
];

function MyPagelist({ props }) {
    return (
        <li className={style.flexLine}>
            <div className={style.imgTitleBox}>
                <img src={props.src} className={style.img} alt={props.title} />
                <span className={style.text}>{props.title}</span>
            </div>
            <FontAwesomeIcon className={style.imgV} icon={faChevronRight} />
        </li>
    );
}
