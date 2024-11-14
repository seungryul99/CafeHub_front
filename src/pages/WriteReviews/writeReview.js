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
                        'Authorization': token,
                        'Content-Type': 'multipart/form-data'
                    },
                });
                console.log("write success");
                navigate(`/CafeDetail`, { state: { cafeId: cafeId } });
            } catch (error) {
                console.error('Error updating data: ', error);
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
