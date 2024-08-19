import styled from '../../styles/GlobalStyle.module.css';
import style from "./myPage.module.css"
import NicknameArti from '../../asset/icon/icon_nicknameAlt.png';
import MyReview from '../../asset/icon/icon_myReview.png';
import MyComment from '../../asset/icon/icon_myComment.png';
import GoodBye from '../../asset/icon/icon_goodBye.png';
import MyAsk from '../../asset/icon/icon_myAsk.png';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { ReactComponent as Icon_logout } from "../../asset/icon/icon_logout.svg"
import { ReactComponent as Icon_camera } from "../../asset/icon/icon_camera.svg"
import { ReactComponent as Icon_mail } from "../../asset/icon/icon_mail.svg"
import { ReactComponent as Icon_nickname } from "../../asset/icon/icon_myPage.svg"
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BasicImg from "../../asset/img/img_basicUserPhoto.png"
import Loading from '../../components/loading';
import { KakaoLogin } from '../../components/kakaoLogins/kakaoLogin';



function MyPage({setSelectedId, setIsLogin}) {
    const [userData, setUserData] = useState();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('accessToken')
    const [userNickname, setUserNickname] = useState('');
    const [userProfileImg, setUserProfileImg] = useState('');
    const [change, setChange] = useState(false);
    const [userUpdatePost, setUserUpdatePost] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [reRender, setReRender] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('accessToken') === null) {
            KakaoLogin();
        }
        axios.get(`${process.env.REACT_APP_APIURL}/api/auth/mypage`, {
            headers: {
                'Authorization': token
            }
        })
            .then(res => {
                setUserData(res.data.data)
                setUserNickname(res.data.data.nickname);
                setUserProfileImg(res.data.data.profileImg ? res.data.data.profileImg : BasicImg);
                console.log(res)
            })
            .catch(error => {
                console.error('Error updating data: ', error);
            });
    }, [reRender]);

    const handleLogout = () => {
        axios.post(`${process.env.REACT_APP_APIURL}/api/auth/member/logout`, {}, {
            headers: {
                'Authorization': token
            }
        })
            .then(res => {
                sessionStorage.removeItem('accessToken');
                setSelectedId(1);
                setIsLogin("")
                navigate('/');
            })
            .catch(error => {
                console.error('Error updating data: ', error);
            });
    }
    useEffect(() => {
        if (initialized) {
        const formData = new FormData();
        const reviewData = {
            nickname : userNickname
        };
        console.log(reviewData)
        console.log(userProfileImg)
        
        formData.append("nickname", new Blob([JSON.stringify(reviewData)], { type: "application/json" }));

        
        formData.append("profileImg", userProfileImg);
        console.log("Nickname: ", formData.get("nickname"));
        console.log("ProfileImg: ", formData.get("profileImg"));
                
        axios.post(`${process.env.REACT_APP_APIURL}/api/auth/mypage`, formData, {
            headers: {
                'Authorization': token,
                'Content-Type': 'multipart/form-data'
            },
        })
            .then(res => {
                console.log("Update success");
                setChange(!change)
                setReRender(!reRender)
            })
            .catch(error => {
                console.error('Error updating data: ', error);
            });
        }else{
            setInitialized(true);
        }
    }, [userUpdatePost])

    const handleChange = (event) => {
        setUserNickname(event.target.value);
    };
    const profileImgUpdate = (event) => {
        setUserProfileImg(event.target.files[0]);
        setUserUpdatePost(!userUpdatePost);
    }
    const userNicknameUpdate = () => {
        setUserUpdatePost(!userUpdatePost);
    }

    if (!userData) {
        return <Loading />
    }

    return (
        <>
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
                            <img src={userProfileImg ? userProfileImg : BasicImg} className={style.photo}></img>
                            <label for="file" className={style.photoAltWrapper}>
                                <Icon_camera className={style.photoAlt} />
                            </label>
                            <input
                                type="file"
                                id="file"
                                onChange={profileImgUpdate}
                                className={style.fileInput}
                                accept="image/jpg,image/png,image/jpeg"
                            />

                        </article>

                        <article className={style.container}>
                            <article className={style.nicknameArti}>
                                <div className={style.nickDiv}>
                                    <Icon_nickname className={style.nicknameIcon} />
                                    <input type="text" value={userNickname} className={style.nickText} onChange={handleChange}></input>
                                </div>
                                <img src={NicknameArti} className={style.nicknameArtiIcon} onClick={userNickname.length > 1 ? userNicknameUpdate : undefined} />
                            </article>

                            <article className={style.emailArti}>
                                <Icon_mail className={style.nicknameIcon} />
                                <input type="text" value={userData.email} className={style.emailText} readOnly></input>
                            </article>
                        </article>
                    </article>

                    <ul className={style.ulList}>
                        {myList.map((data) => (<MyPagelist key={data.id} props={data} />))}
                    </ul>
                </main>
            </div>
        </>
    )
}

export default MyPage;



const myList = [
    { id: 1, src: MyReview, title: "내 리뷰" },
    { id: 2, src: MyComment, title: "내 댓글" },
    { id: 5, src: GoodBye, title: "회원탈퇴" },
    { id: 6, src: MyAsk, title: "문의하기" }
]

function MyPagelist({ props }) {
    console.log(props.src)
    return (
        <li className={style.flexLine}>
            <div className={style.imgTitleBox}>
                <img src={props.src} className={style.img}></img>
                <span className={style.text}>{props.title}</span>
            </div>
            <FontAwesomeIcon className={style.imgV} icon={faChevronRight} />
        </li>
    )
}