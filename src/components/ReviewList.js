import React, { useEffect, useState } from "react";
import style from "./ReviewList.module.css"
import { ReactComponent as Icon_like } from "../asset/icon/icon_like.svg"
import Rating from "../components/Rating"
import { ReactComponent as Icon_comment } from "../asset/icon/icon_comment.svg"
import { ReactComponent as Icon_setting } from "../asset/icon/icon_setting.svg"
import axios from "axios";
import Comment from "./Comment";
import { useNavigate } from "react-router-dom";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import ReactModal from "react-modal";
import { KakaoLogin } from "./kakaoLogins/kakaoLogin";
import ModalComponent from "./modalComponent";
import Loading from '../components/loading';


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

function ReviewList({ props, pageReLoad, setPageReLoad, cafeId, cafePhotoUrl, cafeName, displayComment }) {

    //리뷰가 3줄이 넘어가면 더보기 띄우기
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken')


    const [showMore, setShowMore] = useState(false);
    const toggleShowMore = () => {
        setShowMore(!showMore);
    };
    const reviewContent = props.reviewContent;
    const reviewContentLines = reviewContent.match(/.{1,27}/g);
    const displayContentLines = showMore ? reviewContentLines : reviewContentLines.slice(0, 3);
    const photoUrls = (props.photoUrls || []).map(photo => photo);
    const displyCommentBtn = displayComment;
    //
    const [reviewLike, setReviewLike] = useState(props.likeChecked);
    const [reviewLikeCnt, setReviewLikeCnt] = useState(props.likeCnt);

    const [initialized, setInitialized] = useState(false);

    const [commentCnt, setCommentCnt] = useState(props.commentCnt);
    const [loading, setLoading] = useState(false); // 로딩 상태 추가


    useEffect(() => {
        const handleRequest = async () => {
            try {
                if (!initialized) {
                    setInitialized(true);
                    return;
                }

                if (!token) {
                    KakaoLogin();
                    return;
                }

                const reviewId = props.reviewId;
                const data = {
                    reviewId: reviewId,
                    reviewLike: reviewLike
                };

                console.log("Sending data to server:", data);

                // API 요청
                const response = await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/review/like`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log(response);

            } catch (error) {
                console.error('Error updating data: ', error);

                // 만약 토큰 만료로 인한 401 에러가 발생하면 리프레시 토큰으로 새로운 액세스 토큰 발급 시도
                if (error.response && error.response.data.code === 'LOGIN_401_1') {
                    console.log('액세스 토큰 만료 예외 상황 발생');
                    try {
                        // 리프레시 토큰을 사용하여 새 액세스 토큰 발급 요청
                        console.log('쿠키 발사 전');


                        const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                        console.log('쿠키 발사 후');

                        // 새 액세스 토큰 저장
                        const newAccessToken = getAccessTokenFromCookie();
                        console.log('새 토큰 발급 완료');



                        const reviewId = props.reviewId;
                        const data = {
                            reviewId: reviewId,
                            reviewLike: reviewLike
                        };
                        // 새로운 토큰으로 재요청
                        const retryResponse = await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/review/like`, data, {
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}` // 새 토큰 추가
                            }
                        });

                        console.log(retryResponse);

                    } catch (reissueError) {
                        console.error('토큰 재발급 실패:', reissueError);
                        // 추가적인 에러 처리 (예: 로그아웃 처리)
                    }
                }
            }
        };

        handleRequest();
    }, [reviewLikeCnt]);


    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const changeReviewLikeColor = () => {
        if (!token) {
            setLoginModalOpen(true);
        } else {
            setReviewLike(!reviewLike);
            setReviewLikeCnt(!reviewLike ? reviewLikeCnt + 1 : reviewLikeCnt - 1)
        }
    }
    const CheckReviewLike = () => {
        return (
            <div onClick={changeReviewLikeColor}>
                <Icon_like fill={reviewLike ? "#FF4F4F" : "#FFF"} stroke={reviewLike ? "#FF4F4F" : "#828282"} className={style.like} />
            </div>
        )
    }



    const [commentOpen, setCommentOpen] = useState(false)
    const commentBtnColor = commentOpen ? "#FF4F4F" : "#828282"
    const commentCntColor = commentOpen ? "#828282" : "#FF4F4F"
    const openComment = () => {
        setCommentOpen(!commentOpen);
    }

    const [isDropMenuOpen, setIsDropMenuOpen] = useState(false)
    const toggleDropMenu = (e) => {
        e.stopPropagation(); // 이벤트 캡처링 방지
        setIsDropMenuOpen(prevState => !prevState);
    }
    const toggleDropMenuDown = (e) => {
        e.stopPropagation(); // 이벤트 캡처링 방지
        setIsDropMenuOpen(false);
    }
    const reviewManagementCheck = () => {
        return (
            <>
                {props.reviewManagement && <div className={style.settingIconWrapper} onClick={toggleDropMenu}>
                    <Icon_setting fill="#828282" /></div>}
            </>
        )
    }

    const deleteReview = () => {
        setLoading(true); // 로딩 시작

        const reviewId = props.reviewId;

        const config = token ? {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        } : {};

        axios({
            method: 'delete',
            url: `${process.env.REACT_APP_APIURL}/api/auth/review`,
            ...config,
            data: {
                reviewId: reviewId,
                cafeId: cafeId
            }
        })
            .then(res => {
                console.log(res);
                setPageReLoad(!pageReLoad);
            })
            .catch(async (error) => {
                console.error('Error deleting review: ', error);

                // 401 Unauthorized 에러 처리 (토큰 만료)
                if (error.response && error.response.data.code === 'LOGIN_401_1') {
                    console.log('액세스 토큰 만료, 재발급 시도');
                    try {
                        // 토큰 재발급 요청
                        const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });
                        const newAccessToken = getAccessTokenFromCookie();
                        console.log('새 토큰 발급 완료');

                        // 새로운 토큰으로 리뷰 삭제 요청 재시도
                        await axios({
                            method: 'delete',
                            url: `${process.env.REACT_APP_APIURL}/api/auth/review`,
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}`,
                                'Content-Type': 'application/json'
                            },
                            data: {
                                reviewId: reviewId,
                                cafeId: cafeId
                            }
                        });
                        console.log('Review deleted successfully after reissue');
                        setPageReLoad(!pageReLoad);
                    } catch (reissueError) {
                        console.error('토큰 재발급 실패:', reissueError);
                    }
                }
            })
            .finally(() => {
                setLoading(false); // 로딩 종료
            });
    };


    const updateReview = () => {
        navigate('/updateReview', {
            state: {
                cafeId: cafeId,
                reviewId: props.reviewId,
                prevReviewRating: props.reviewRating,
                prevPhotoUrls: photoUrls,
                prevreviewContent: props.reviewContent,
                cafePhotoUrl: cafePhotoUrl,
                cafeName: cafeName
            }
        })
    }


    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [indexOfClickedImage, setIndexOfClickedImage] = useState(0);

    const openModal = (index) => {
        setIndexOfClickedImage(index);
        setModalIsOpen(true);

    }
    const closeModal = () => setModalIsOpen(false);


    const images = photoUrls.map((url) => ({
        original: url,
        thumbnail: url,
        originalHeight: 300,
        originalWidth: 400
    }));

    const renderLeftNav = (onClick, disabled) => (
        <button
            type="button"
            className={`${style.customArrow} image-gallery-icon image-gallery-left-nav`}
            disabled={disabled}
            onClick={onClick}
            aria-label="Previous Slide"
        >
            &#9664;
        </button>
    );

    const renderRightNav = (onClick, disabled) => (
        <button
            type="button"
            className={`${style.customArrow} image-gallery-icon image-gallery-right-nav`}
            disabled={disabled}
            onClick={onClick}
            aria-label="Next Slide"
        >
            &#9654;
        </button>
    );


    return (
        <li className={style.bestReviewflexLine} onClick={toggleDropMenuDown}>
            {/* 로딩 중일 때 로딩 스피너 표시 */}
            {loading ? (
                <Loading />  // 로딩 중일 때는 로딩 스피너만 보이도록
            ) : (
                <div className={style.ReviewFlexLineWrapper}>
                    <div className={style.authorNameDate}>
                        <div className={style.authorNameDateWrapper}>
                            <img src={props.authorProfile} className={style.authorProfile} />
                            <span className={style.authorName}>{props.author}</span>
                            <span className={style.authorDate}>{props.reviewCreateAt}</span>
                        </div>
                        {reviewManagementCheck()}
                    </div>
                    {isDropMenuOpen && (
                        <ul className={style.dropMenuContainer}>
                            <li className={style.dropMenuWrapper} onClick={deleteReview}>
                                <span>삭제</span>
                            </li>
                        </ul>
                    )}
                    <Rating rating={props.reviewRating} size={{ width: '25px', height: '25px' }} />

                    {photoUrls && photoUrls.length > 0 && (
                        <div className={style.photoContainer}>
                            {photoUrls.slice(0, 3).map((url, index) => (
                                <img key={index} src={url} alt={`Review photo ${index + 1}`} className={style.reviewPhoto} onClick={() => openModal(index)} />
                            ))}
                            {photoUrls.length > 3 && (
                                <div className={style.morePhotosContainer} onClick={() => openModal(2)}>
                                    <img src={photoUrls[2]} alt="More photos" className={style.reviewPhoto} style={{ opacity: 0.5 }} />
                                    <div className={style.morePhotosOverlay}>+{photoUrls.length - 3}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={style.reviewContentContainer}>
                        {displayContentLines.map((line, index) => (
                            <span key={index} className={style.reviewContent}>
                            {line}
                                <br />
                        </span>
                        ))}
                        {reviewContentLines.length > 3 && (
                            <span className={style.viewMore} onClick={toggleShowMore}>
                                {/*간략히 보기는 일단 없어도 될거 같음*/}
                            {showMore ? (
                                <span style={{ lineHeight: '0px' }}></span>
                            ) : (
                                <span style={{ lineHeight: '25px' }}>. . . 더보기</span>
                            )}
                        </span>
                        )}
                    </div>
                    <div className={style.reviewCommentLikeContainer} style={{ marginTop: '20px' }}>
                        {displyCommentBtn && (
                            <div style={{ display: 'flex', cursor: 'pointer', color: `${commentBtnColor}` }} onClick={openComment}>
                                <Icon_comment fill={commentBtnColor} style={{ width: '16px', height: '14px' }} />
                                {props.commentCnt === 0 ? (
                                    <span className={style.comment}>댓글 달기</span>
                                ) : (
                                    <span className={style.comment}>
                                    댓글 <span style={{ color: `${commentCntColor}` }}>({commentCnt})</span>
                                </span>
                                )}
                            </div>
                        )}
                        <div className={style.checkReviewLikeWrapper} style={{ display: 'flex' }}>
                            <CheckReviewLike />
                            <span>{reviewLikeCnt}</span>
                        </div>
                    </div>
                    {commentOpen && (
                        <Comment
                            props={props}
                            commentCnt={commentCnt}
                            setCommentCnt={setCommentCnt}
                            pageReLoad={pageReLoad}
                            setPageReLoad={setPageReLoad}
                        />
                    )}
                    <div className={style.reviewHRContainer} style={{ marginTop: '6px' }}>
                        <hr className={style.reviewHR} />
                    </div>
                </div>
            )}

            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Image Gallery"
                className={style.modal}
                overlayClassName={style.modalOverlay}
                ariaHideApp={false}
            >
                <div className={style.modalExit} onClick={closeModal}>X</div>
                <ImageGallery
                    items={images}
                    startIndex={indexOfClickedImage}
                    showThumbnails={false}
                    showFullscreenButton={false}
                    showPlayButton={false}
                    style={{ WebkitUserDrag: 'none' }}
                    renderLeftNav={renderLeftNav}
                    renderRightNav={renderRightNav}
                />
            </ReactModal>

            {loginModalOpen && <ModalComponent modalIsOpen={loginModalOpen} setModalIsOpen={setLoginModalOpen}></ModalComponent>}
        </li>
    );



}
export default ReviewList;

