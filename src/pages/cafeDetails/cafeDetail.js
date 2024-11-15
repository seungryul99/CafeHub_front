import styled from "../../styles/GlobalStyle.module.css"
import style from "./cafeDetail.module.css"
import { ReactComponent as Icon_pin } from "../../asset/icon/icon_pin.svg"
import { ReactComponent as Icon_clock } from "../../asset/icon/icon_clock.svg"
import { ReactComponent as Icon_call } from "../../asset/icon/icon_call.svg"
import { ReactComponent as Icon_like } from "../../asset/icon/icon_like.svg"
import { ReactComponent as Icon_go } from "../../asset/icon/icon_go.svg"
import img_star from "../../asset/img/img_star.png"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import WriteReview from '../../asset/icon/icon_nicknameAlt.png';
import axios from "axios"
import Rating from "../../components/Rating"
import ReviewList from "../../components/ReviewList"
import { KakaoLogin } from '../../components/kakaoLogins/kakaoLogin';
import ModalComponent from "../../components/modalComponent"


function CafeDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const cafeId = location.state?.cafeId;
    const token = localStorage.getItem('accessToken')
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const displayComment = false;



    const [cafeData, setCafeData] = useState({
        cafeId : "",
        cafePhotoUrl: "",
        cafeName: "",
        cafeTheme: "",
        cafeReviewCnt: "",
        cafeOperationHour: "",
        cafeAddress: "",
        cafePhone: "",
        cafeRating: "",
        bookmarkChecked: false,
        bestMenuList: [],
        bestReviewList: []
    });

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


    const pageLoad = async () => {
        try {
            // 헤더 설정 (AccessToken이 있으면 Authorization 헤더 추가)
            const token = localStorage.getItem('accessToken');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}) // AccessToken이 있으면 Authorization 헤더 추가
            };

            // API 요청
            const response = await axios.get(`${process.env.REACT_APP_APIURL}/api/optional-auth/cafe/${cafeId}`, { headers });

            // 데이터 가공 및 상태 업데이트
            response.data.data.cafeRating = Math.round(response.data.data.cafeRating * 10) / 10;
            setCafeData(response.data.data);
            setCafeLike(response.data.data.bookmarkChecked);

        } catch (error) {
            console.error('API 요청 실패:', error);

            // 만약 토큰 만료로 인한 401 에러가 발생하면 리프레시 토큰으로 새로운 액세스 토큰 발급 시도
            if (error.response && error.response.data.code === 'LOGIN_401_1') {
                console.log('액세스 토큰 만료 예외 상황 발생')
                try {
                    // 리프레시 토큰을 사용하여 새 액세스 토큰 발급 요청
                    console.log('쿠키 발사 전')
                    const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                    console.log('쿠키 발사 후')
                    
                    // 새 액세스 토큰 저장
                    const newAccessToken = getAccessTokenFromCookie();

                    console.log('새 토큰 발급 완료')


                    // 새로운 토큰으로 재요청
                    const retryResponse = await axios.get(`${process.env.REACT_APP_APIURL}/api/optional-auth/cafe/${cafeId}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${newAccessToken}`, // 새 토큰 추가
                        }
                    });

                    // 데이터 가공 및 상태 업데이트
                    retryResponse.data.data.cafeRating = Math.round(retryResponse.data.data.cafeRating * 10) / 10;
                    setCafeData(retryResponse.data.data);
                    setCafeLike(retryResponse.data.data.bookmarkChecked);

                } catch (reissueError) {
                    console.error('토큰 재발급 실패:', reissueError);
                    // 추가적인 에러 처리 (예: 로그아웃 처리)
                }
            }
        }
    };




    useEffect(() => {
        if (cafeId) {
            pageLoad();
        }
    }, [cafeId]);

    const [cafeLike, setCafeLike] = useState();
    const changeCafeLikeColor = () => {
        if (!token) {
            setLoginModalOpen(true);
        }
        else {
            setCafeLike(prevCafeLike => {
                const newCafeLike = !prevCafeLike;
                updateBookmark(newCafeLike); // 변경된 상태를 전달
                return newCafeLike; // 변경된 상태 반환
            });
        }
    }
    const cafeLikeColor = () => {

        return (
            <div className={style.likeContainer} onClick={changeCafeLikeColor}>
                <Icon_like fill={cafeLike ? "#FF4F4F" : "#FFF"} className={style.like} stroke={cafeLike ? "#FF4F4F" : "#828282"} />
            </div>
        )
    }

    
    // 카페 상세 페이지에서 북마크 버튼
    const updateBookmark = async (newCafeLike) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            KakaoLogin();
            return;
        }

        const data = {
            cafeId: cafeId,
            bookmarkChecked: newCafeLike
        };

        console.log("Sending data to server:", data);

        try {
            await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/bookmark`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Bookmark updated successfully');
        } catch (error) {
            console.error('카페 상세 페이지에서 북마크 도중 예외 발생: ', error);

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
    };


    const moveWriteReview = () => {
        console.log(cafeData)
        navigate('/WriteReview', {
            state: {
                cafeId: cafeId,
                cafePhotoUrl: cafeData.cafePhotoUrl,
                cafeName: cafeData.cafeName
            }
        })
    }

    const moveMoreMenu = () => {
        navigate('/Menu', { state: { cafeId: cafeId } });
    }
    const moveMoreReview = () => {
        navigate('/Review', { state: { cafeId: cafeId, cafePhotoUrl: cafeData.cafePhotoUrl, cafeName: cafeData.cafeName } })
    }



    return (
        <div className={styled.page_wrapper}>
            <main className={styled.main_container}>
                <article className={style.cafeInfo}>
                    <img className={style.cafeInfoBg} src={cafeData.cafePhotoUrl}></img>

                    <div className={style.cafeInfoTitleContainer}>
                        {cafeLikeColor()}
                        <div className={style.cafeInfoTitleLike}>
                            <span className={style.cafeInfoTitle}>{cafeData.cafeName}</span>
                        </div>
                        <div className={style.cafeInfoPlus}>
                            <span>{cafeData.cafeTheme}</span>
                            <img src={img_star} className={style.reviewStar}></img>
                            <span style={{ marginLeft: '2px' }}>별점<span style={{ color: 'red', marginLeft: '3px' }}>{cafeData.cafeRating}</span></span>
                            <span style={{ marginLeft: '15px' }}>리뷰</span>
                            <span style={{ color: 'red', marginLeft: '3px' }}>{cafeData.cafeReviewCnt}</span>
                        </div>

                    </div>
                    <div className={style.cafeInfoDetailContainer}>
                        <div className={style.cafeInfoDetailWrapper}>
                            <span className={style.detailInfo}>상세 정보</span>
                            <div className={style.reviewHRContainer}><hr className={style.reviewHR} /></div>

                            <div className={style.iconTextContainer}>
                                <div>
                                    <Icon_pin className={style.icon_detail} style={{ height: '13px' }} />
                                    <span className={style.detailText}>{cafeData.cafeAddress}</span>
                                </div>
                                <div className={style.iconTextWrapper}>
                                    <Icon_call className={style.icon_detail} style={{ height: '13px' }} />
                                    <span className={style.detailText}>{cafeData.cafePhone}</span>
                                </div>
                                <div className={style.iconTextWrapper}>
                                    <Icon_clock className={style.icon_detail} style={{ height: '13px' }} />
                                    <span className={style.detailText}>{cafeData.cafeOperationHour}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                <article className={style.cafeMenuContainer}>
                    <span className={style.cafeMenuTextMenu}>대표 메뉴</span>
                    <ul className={style.bestMenuList}>
                        {cafeData.bestMenuList.map((data, index) => (<BestMenuList key={index} props={data} />))}
                    </ul>
                    <div className={style.menuPlus}>
                        <span onClick={moveMoreMenu}>메뉴 더보기</span>
                        <Icon_go fill="rgb(104, 104, 104)" style={{ width: '9px', height: '9px', marginLeft: '2px' }} />
                    </div>
                </article>

                <article className={style.cafeBestReviewContainer}>
                    <div className={style.cafeBestReviewReviewCnt}>
                        <span>리뷰</span>
                        <span style={{ color: 'red', marginLeft: '3px' }}>{cafeData.cafeReviewCnt}</span>
                    </div>
                    <div className={style.cafeBestReviewRatingContainer}>
                        <div className={style.ratingWrapper}>
                            <span className={style.cafeRatingFontSize}>{cafeData.cafeRating}점</span>
                            <Rating rating={cafeData.cafeRating} />
                        </div>
                        <div className={style.writeReview} onClick={token ? moveWriteReview : () => setLoginModalOpen(true)}>
                            <img src={WriteReview} className={style.reviewWriteBtn} style={{ width: '10px', height: '10px' }}></img>
                            <span style={{ marginLeft: '2px' }}>리뷰작성</span>
                        </div>
                    </div>
                    <div className={style.reviewHRContainer}><hr className={style.reviewHR} /></div>
                    <ul >
                        {cafeData.bestReviewList.map((data) => (<ReviewList key={data.reviewId} props={data} displayComment={displayComment}/>))}
                    </ul>
                    <div className={style.reviewPlus}>
                        <span onClick={moveMoreReview}>리뷰 더보기</span>
                        <Icon_go fill="rgb(104, 104, 104)" style={{ width: '9px', height: '9px', marginLeft: '2px' }} />
                    </div>

                </article>
                {loginModalOpen && <ModalComponent modalIsOpen={loginModalOpen} setModalIsOpen={setLoginModalOpen}></ModalComponent>}


            </main>
        </div>
    )
}
export default CafeDetail;




function BestMenuList({ props }) {

    return (
        <div className={style.flexLineWrapper}>
            <li className={style.flexLine}>
                <span>{props.name}</span>
                <span>{props.price}</span>
            </li>
            <hr className={style.BestMenuListHr} style={{ marginTop: '15px' }} />
        </div>
    )
}
