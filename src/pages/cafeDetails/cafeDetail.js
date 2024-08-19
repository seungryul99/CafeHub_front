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
import ModalComponent from "../../components/modalComponent"


function CafeDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const cafeId = location.state?.cafeId;
    const token = sessionStorage.getItem('accessToken')
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const displayComment = false;

    const [cafeData, setCafeData] = useState({
        cafePhotoUrl: "",
        cafeName: "",
        cafeTheme: "",
        cafeRating: "",
        cafeReviewCnt: "",
        cafeAddress: "",
        cafePhone: "",
        cafeOperationHour: "",
        bestMenuList: [],
        bestReviewList: [],
        bookmarkChecked: false
    });

    const pageLoad = () => {

        axios.get(`${process.env.REACT_APP_APIURL}/api/cafe/${cafeId}`, {

            headers: {
                'Authorization': token
            }
        })
            .then(response => {
                setCafeData(response.data.data);
                console.log(response.data.data)
                setCafeLike(response.data.data.bookmarkChecked)
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }

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

    const updateBookmark = (newCafeLike) => {
        const data = {
            cafeId: cafeId,
            bookmarkChecked: newCafeLike
        };

        console.log("Sending data to server:", data); // 콘솔에 데이터를 출력하여 확인
        axios.post(`${process.env.REACT_APP_APIURL}/api/auth/bookmark`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
            .then(res => {
                console.log(res);
            })
            .catch(error => {
                console.error('Error updating data: ', error);
            });
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
                    <ul>
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
