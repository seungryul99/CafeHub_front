import styled from "../../styles/GlobalStyle.module.css"
import style from "./writeReview.module.css"
import React, { useState, useRef, useEffect } from 'react'
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"
import { ReactComponent as Icon_writeReview } from "../../asset/icon/icon_write.svg"
import img_writeReview from "../../asset/img/img_wrtiteReview.png"
import img_star from "../../asset/img/img_star.png"
import { KakaoLogin } from "../../components/kakaoLogins/kakaoLogin"

function UpdateReview() {
    const location = useLocation();
    const { cafeId, reviewId, prevReviewRating, prevPhotoUrls, prevreviewContent, cafePhotoUrl, cafeName} = location.state || {};
    const ARRAY = [0, 1, 2, 3, 4];
    const [clicked, setClicked] = useState([false, false, false, false, false]);
    const navigate = useNavigate();
    const token = sessionStorage.getItem('accessToken')

    const defaultCafePhotoUrl = 'defaultCafePhotoUrl';
    const defaultCafeName = 'defaultCafeName';


    const [reviewContent, setReviewContent] = useState(prevreviewContent);
    const [reviewRating, setReviewRating] = useState(prevReviewRating);
    const [photos, setPhotos] = useState(prevPhotoUrls);
    const [detailImgs, setDetailImgs] = useState([]);

    useEffect(() => {
        if (sessionStorage.getItem('accessToken') === null) {
            KakaoLogin();
        }
        const updatedClicked = ARRAY.map((_, index) => index < reviewRating);
        setClicked(updatedClicked);
        setPhotos(prevPhotoUrls);
    }, [reviewRating]);


    const handleStarClick = index => {
        const updatedClicked = ARRAY.map((_, i) => i <= index);
        setClicked(updatedClicked);
        setReviewRating(index + 1);
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

    const wrapperRef = useRef(null);

    const handleWheel = (event) => {
        event.preventDefault();
        wrapperRef.current.scrollLeft += event.deltaY;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (reviewContent.trim() !== '') {
            const formData = new FormData();
            const reviewData = {
                reviewContent,
                reviewRating
            };
            formData.append("ReviewUpdateRequest", new Blob([JSON.stringify(reviewData)], { type: "application/json" }));
            if (photos.length > 0) {
                for (let i = 0; i < photos.length; i++) {
                    formData.append("photos", photos[i]);
                }
            }

            axios.post(`${process.env.REACT_APP_APIURL}/api/auth/cafe/${reviewId}/update`, formData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'multipart/form-data'
                },
            })
                .then(res => {
                    console.log("write success");
                    navigate(`/CafeDetail`, { state: { cafeId: cafeId } });
                })
                .catch(error => {
                    console.error('Error updating data: ', error);
                });
        }
    };

    
    const handleChange = (event) => {
        setReviewContent(event.target.value);
    };

    return (
        <>
            <div className={styled.page_wrapper}>
                <main className={styled.main_container}>
                    <Top />
                    <article className={style.cafePhotoWrapper}>
                        <img src={cafePhotoUrl ? cafePhotoUrl : defaultCafePhotoUrl} className={style.cafeImg} />
                        <span className={style.AskReivewText}>
                            <p style={{ color: "#FF4F4F", fontWeight:"700" }}>"{cafeName ? cafeName : defaultCafeName}"</p>
                            <p style={{marginLeft: "0px"}}>어떠셨나요?</p>
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
        </>
    )
}

export default UpdateReview;

function Top() {
    return (
        <article className={style.containerWrapper}>
            <img src={img_writeReview} className={style.imgBg} />
            <article className={style.textContainer}>
                <Icon_writeReview fill="white" className={style.icon} />
                <span className={style.textOnBg}>전체 리뷰 목록</span>
            </article>
        </article>
    )
}