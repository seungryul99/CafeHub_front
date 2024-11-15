import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as Icon_writeReview } from "../../asset/icon/icon_write.svg";
import img_writeReview from "../../asset/img/img_wrtiteReview.png";
import img_star from "../../asset/img/img_star.png";
import { KakaoLogin } from "../../components/kakaoLogins/kakaoLogin";
import styled from "../../styles/GlobalStyle.module.css";
import style from "./writeReview.module.css";
import Loading from '../../components/loading';

function WriteReview() {
    const location = useLocation();
    const { cafeId, cafePhotoUrl, cafeName } = location.state || {};
    const defaultCafePhotoUrl = 'defaultCafePhotoUrl';
    const defaultCafeName = 'defaultCafeName';

    const ARRAY = [0, 1, 2, 3, 4];
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [detailImgs, setDetailImgs] = useState([]);
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        if (!token) {
            KakaoLogin();
        }
    }, [token]);

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

    const handleStarClick = index => {
        let clickStates = [...clicked];
        for (let i = 0; i < 5; i++) {
            clickStates[i] = i <= index;
        }
        setClicked(clickStates);
        setReviewRating(index + 1);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (reviewContent.trim() !== '') {
            setLoading(true); // 업로드 시작 시 로딩 상태 true
            const formData = new FormData();
            const reviewData = {
                reviewContent,
                reviewRating
            };
            formData.append("ReviewData", new Blob([JSON.stringify(reviewData)], { type: "application/json" }));

            if (photos.length > 0) {
                for (let i = 0; i < photos.length; i++) {
                    formData.append("photos", photos[i]);
                }
            }

            try {
                await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/cafe/${cafeId}/review`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                });
                console.log("write success");
                navigate(`/CafeDetail`, { state: { cafeId: cafeId } });
            } catch (error) {
                console.error('Error submitting review: ', error);

                // 401 Unauthorized 에러 발생 시 리프레시 토큰을 사용하여 새 액세스 토큰 발급
                if (error.response && error.response.data.code === 'LOGIN_401_1') {
                    console.log('액세스 토큰 만료 예외 상황 발생');

                    try {
                        // 리프레시 토큰을 사용하여 새 액세스 토큰 발급 요청
                        const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                        // 새 액세스 토큰 저장
                        const newAccessToken = getAccessTokenFromCookie();
                        console.log('새 토큰 발급 완료');

                        // 새로운 토큰으로 다시 요청
                        const retryConfig = {
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}`,
                                'Content-Type': 'multipart/form-data'
                            }
                        };

                        // 리뷰 제출 재시도
                        await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/cafe/${cafeId}/review`, formData, retryConfig);

                        console.log("write success");
                        navigate(`/CafeDetail`, { state: { cafeId: cafeId } });

                    } catch (reissueError) {
                        console.error('토큰 재발급 실패:', reissueError);
                        // 추가적인 에러 처리 (예: 로그아웃 처리)
                    }
                }
            } finally {
                setLoading(false); // 업로드 완료 후 로딩 상태 false
            }
        }
    };


    const handleFileChange = (event) => {
        setPhotos(event.target.files);
        const fileArr = event.target.files;

        let fileURLs = [];

        let file;
        let filesLength = fileArr.length > 5 ? 5 : fileArr.length;

        for (let i = 0; i < filesLength; i++) {
            file = fileArr[i];

            let reader = new FileReader();
            reader.onload = () => {
                console.log(reader.result);
                fileURLs[i] = reader.result;
                setDetailImgs([...fileURLs]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (event) => {
        setReviewContent(event.target.value);
    };

    const wrapperRef = useRef(null);

    const handleWheel = (event) => {
        event.preventDefault();
        wrapperRef.current.scrollLeft += event.deltaY;
    };

    return (
        <>
            {loading ? (
                <Loading /> // 로딩 중일 때 로딩 컴포넌트 표시
            ) : (
                <div className={styled.page_wrapper}>
                    <main className={`${styled.main_container} ${style.mainWrapper}`}>
                        <Top />
                        <article className={style.cafePhotoWrapper}>
                            <img src={cafePhotoUrl ? cafePhotoUrl : defaultCafePhotoUrl} className={style.cafeImg} />
                            <span className={style.AskReivewText}>
                                <p style={{ color: "#FF4F4F", fontWeight: "700" }}>"{cafeName ? cafeName : defaultCafeName}"</p>
                                <p style={{ marginLeft: "0px" }}>어떠셨나요?</p>
                            </span>
                        </article>
                        <article className={style.contentInputContainer}>
                            <article className={style.starWrapper}>
                                {ARRAY.map((el, idx) => {
                                    return (
                                        <img
                                            key={idx}
                                            src={img_star}
                                            alt="star"
                                            className={`${style.starSize} ${clicked[el] ? '' : style.grayStar}`}
                                            onClick={() => handleStarClick(el)}
                                        />
                                    );
                                })}
                            </article>
                            <textarea
                                type="text"
                                value={reviewContent}
                                onChange={handleChange}
                                placeholder="최소 5자 이상 작성해 주세요."
                                className={style.contentInput}
                            />
                            <article className={style.imageUploadWrapper} onWheel={handleWheel} ref={wrapperRef}>
                                {detailImgs?.length > 0 &&
                                    <div className={style.imagePreviewContainer}>
                                        {detailImgs.map((img, index) => (
                                            <img key={index} src={img} alt={`Preview ${index}`} className={style.imagePreview} />
                                        ))}
                                    </div>
                                }
                                <label htmlFor="file">
                                    <div className={style.imageUploadBtn}>+</div>
                                </label>
                                <input
                                    type="file"
                                    id="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className={style.fileInput}
                                    accept="image/jpg,image/png,image/jpeg"
                                />
                            </article>
                            <button
                                type="submit"
                                className={(!(reviewContent.length > 4) || !reviewRating) ? style.cantsubmitButton : style.submitButton}
                                disabled={!(reviewContent.length > 4) || !reviewRating}
                                onClick={handleSubmit}
                            >
                                등록
                            </button>
                        </article>
                    </main>
                </div>
            )}
        </>
    );
}

export default WriteReview;

function Top() {
    return (
        <article className={style.containerWrapper}>
            <img src={img_writeReview} className={style.imgBg} />
            <article className={style.textContainer}>
                <Icon_writeReview fill="white" className={style.icon} />
                <span className={style.textOnBg}>리뷰 작성하기</span>
            </article>
        </article>
    );
}
