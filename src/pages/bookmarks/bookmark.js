    import styled from "../../styles/GlobalStyle.module.css";
    import style from "../../styles/CafeListStyle.module.css";
    import styles from "./bookmark.module.css"
    import img_bookmark_bg from "../../asset/img/img_bookmark_bg.png";
    import img_deerSweetLab from "../../asset/img/img_deerSweetLab.png";
    import img_star from "../../asset/img/img_star.png"
    import { ReactComponent as Icon_bookmark } from "../../asset/icon/icon_bookmark.svg"
    import { ReactComponent as Icon_like } from "../../asset/icon/icon_like.svg"
    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import Loading from "../../components/loading";
    import axios from "axios";
    import { KakaoLogin } from "../../components/kakaoLogins/kakaoLogin";


    const getAccessTokenFromCookie = () => {
        const cookies = document.cookie.split('; ').map(cookie => cookie.split('='));
        const accessTokenCookie = cookies.find(([name]) => name === 'JwtAccessToken');

        if (accessTokenCookie) {
            // JWT 토큰을 로컬 스토리지에 저장
            localStorage.setItem('accessToken', accessTokenCookie[1]);

            // 쿠키에서 jwtAccessToken을 삭제합니다.
            document.cookie = "JwtAccessToken=; Max-Age=0; Path=/; SameSite=Strict";

            return accessTokenCookie[1];
        }
        return null;
    };
    function Bookmark() {

        const [dataList, setDataList] = useState([]);






        const pageLoad = async () => {
            if (localStorage.getItem('accessToken') === null) {
                KakaoLogin();
                return;
            }

            const initialToken = localStorage.getItem("accessToken");

            // 첫 요청
            try {
                const response = await axios.get(`${process.env.REACT_APP_APIURL}/api/auth/bookmarks`, {
                    headers: {
                        'Authorization': `Bearer ${initialToken}`
                    }
                });

                setDataList(response.data.data.cafeList);
            } catch (error) {
                console.error('북마크 리스트 요청 시 에러 발생 : ', error);

                // 401 Unauthorized 에러 발생 시 예외 처리
                if (error.response && error.response.data.code === 'LOGIN_401_1') {
                    console.log('액세스 토큰 만료, 재발급 시도');
                    try {
                        // 리프레시 토큰을 사용하여 새 액세스 토큰 발급 요청
                        const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                        // 새 액세스 토큰을 가져옴
                        const newAccessToken = getAccessTokenFromCookie();
                        localStorage.setItem('accessToken', newAccessToken);
                        console.log('새 토큰 발급 완료');

                        // 새 토큰으로 다시 북마크 요청
                        const retryResponse = await axios.get(`${process.env.REACT_APP_APIURL}/api/auth/bookmarks`, {
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}`
                            }
                        });

                        console.log("토큰 재발급 후 요청 성공")
                        setDataList(retryResponse.data.data.cafeList);
                    } catch (reissueError) {
                        console.error('토큰 재발급 실패:', reissueError);
                    }
                }
            }
        };

        useEffect(() => {
            pageLoad();
        }, [])

        return (
            <>
                <div className={styled.page_wrapper}>
                    <main className={styled.main_container}>
                        <article className={style.containerWrapper}>
                            <img src={img_bookmark_bg} className={style.imgBg} />
                            <article className={style.textContainer}>
                                <Icon_bookmark fill="white" className={style.icon} />
                                <span className={style.textOnBg}>북마크 카페 리스트</span>
                            </article>
                        </article>

                        {dataList?.length !== 0 ?
                            <>
                                <ul>
                                    {dataList?.map((data, index) => (<BookmarkList key={index} props={data} />))}
                                </ul>
                            </> : <Loading />}

                    </main>
                </div>
            </>
        )
    }
    export default Bookmark;



    function BookmarkList({ props }) {
        const [like, setLike] = useState(true);
        const [initialized, setInitialized] = useState(false);
        useEffect(() => {
            const updateBookmark = async () => {
                if (initialized) {
                    const data = {
                        cafeId: props.cafeId,
                        bookmarkChecked: like
                    };
                    const initialToken = localStorage.getItem("accessToken");

                    try {
                        await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/bookmark`, data, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${initialToken}`
                            }
                        });
                        console.log('Bookmark updated successfully');
                    } catch (error) {
                        console.error('북마크 리스트에서 북마크 도중 예외 발생: ', error);

                        // 401 Unauthorized 에러 발생 시 예외 처리
                        if (error.response && error.response.data.code === 'LOGIN_401_1') {
                            console.log('액세스 토큰 만료, 재발급 시도');
                            try {
                                const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                                const newAccessToken = getAccessTokenFromCookie();
                                console.log('새 토큰 발급 완료');

                                // 새 토큰으로 다시 북마크 요청
                                await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/bookmark`, data, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${newAccessToken}`
                                    }
                                });
                                console.log('Bookmark updated successfully after reissue');
                            } catch (reissueError) {
                                console.error('토큰 재발급 실패:', reissueError);
                            }
                        }
                    }
                } else {
                    setInitialized(true);
                }
            };

            updateBookmark(); // 비동기 함수 호출
        }, [like]);




        const changeColor = () => {
            setLike(!like);
        }

        const LikeIcon = () => {
            return like ? <Icon_like fill="#FF4F4F" stroke="#FF4F4F"/> : <Icon_like fill="#FFF" stroke="#828282"/>;
        };

        const navigate = useNavigate();
        const handleNavigation = () => {
            navigate('/CafeDetail', { state: { cafeId: props.cafeId } });
        };

        return (
            <div className={style.flexLine}>
                <img className={style.cafeImg} src={props.cafePhotoUrl} style={{ cursor: 'pointer' }} onClick={handleNavigation} />
                <div className={style.CafeTextContainer}>
                    <div onClick={handleNavigation} style={{ cursor: 'pointer' }}>
                        <span className={style.cafeTitle}>{props.cafeName}</span>
                        <span className={style.cafeTheme}>{props.cafeTheme}</span>
                        <div className={style.starRatingReview}>
                            <img className={style.img_star} src={img_star}></img>
                            <span className={style.cafeRating}>{Math.round(props.cafeRating*10)/10} ({props.cafeReviewNum})</span>
                        </div>
                    </div>
                    <div className={styles.likeContainer} style={{ cursor: 'pointer' }} onClick={changeColor}>
                        <LikeIcon />
                    </div>
                </div>
            </div>
        )
    }