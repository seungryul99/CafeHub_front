import styled from "../../styles/GlobalStyle.module.css"
import style from "./review.module.css"
import { ReactComponent as Icon_list } from "../../asset/icon/icon_lists.svg"
import img_review from "../../asset/img/img_review.png"
import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useInView } from "react-intersection-observer"
import { useLocation, useNavigate } from "react-router-dom"
import Rating from "../../components/Rating"
import Loading from "../../components/loading"
import ReviewList from "../../components/ReviewList"
import { ReactComponent as Icon_writeReview } from "../../asset/icon/icon_write.svg"
import ModalComponent from "../../components/modalComponent"


function Review() {
    const location = useLocation();
    const cafeId = location.state?.cafeId;
    const cafePhotoUrl = location.state?.cafePhotoUrl;
    const cafeName = location.state?.cafeName;

    const [dataList, setDataList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageReLoad, setPageReLoad] = useState(false);

    const [ref, inView] = useInView();
    const [isLast, setIsLast] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken')
    const [cafeReviewCnt, setCafeReviewCnt] = useState(0);
    const [cafeRating, setCafeRating] = useState(0);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const displayComment = true;

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

    useEffect(() => {
        pageLoad(currentPage);
    }, [currentPage, pageReLoad])


    useMemo(() => {
        if (inView) {
            setCurrentPage(prevCurrentPage => prevCurrentPage + 1);
        }
    }, [inView])

    const pageLoad = async (currentPage) => {
        const token = localStorage.getItem('accessToken');


        const config = token ?
            { headers: { 'Authorization': `Bearer ${token}` } } : {};

        try {
            const response = await axios.get(`${process.env.REACT_APP_APIURL}/api/optional-auth/cafe/${cafeId}/reviews/${currentPage}`, config);

            // 서버로부터 받은 데이터 처리
            setIsLast(response.data.data.isLast);
            setCafeReviewCnt(response.data.data.cafeReviewCnt);
            setCafeRating(response.data.data.cafeRating);

            if (currentPage === 0) {
                setDataList(response.data.data.reviewList);
                console.log(response.data.data.reviewList);
            } else {
                setDataList(prevDataList => [...prevDataList, ...response.data.data.reviewList]);
            }
        } catch (error) {
            console.error('Error fetching data: ', error);

            // 401 Unauthorized 에러 발생 시 리프레시 토큰을 사용하여 새 액세스 토큰 발급
            if (error.response && error.response.data.code === 'LOGIN_401_1') {
                console.log('액세스 토큰 만료 예외 상황 발생');
                try {
                    // 리프레시 토큰을 사용하여 새 액세스 토큰 발급 요청
                    const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                    // 새 액세스 토큰 저장
                    const newAccessToken = getAccessTokenFromCookie();
                    console.log('새 토큰 발급 완료');

                    // 새로운 토큰으로 재요청
                    const retryConfig = {
                        headers: {
                            'Authorization': `Bearer ${newAccessToken}`
                        }
                    };

                    const retryResponse = await axios.get(`${process.env.REACT_APP_APIURL}/api/optional-auth/cafe/${cafeId}/reviews/${currentPage}`, retryConfig);

                    // 서버로부터 받은 데이터 처리
                    setIsLast(retryResponse.data.data.isLast);
                    setCafeReviewCnt(retryResponse.data.data.cafeReviewCnt);
                    setCafeRating(retryResponse.data.data.cafeRating);

                    if (currentPage === 0) {
                        setDataList(retryResponse.data.data.reviewList);
                        console.log(retryResponse.data.data.reviewList);
                    } else {
                        setDataList(prevDataList => [...prevDataList, ...retryResponse.data.data.reviewList]);
                    }

                } catch (reissueError) {
                    console.error('토큰 재발급 실패:', reissueError);
                    // 추가적인 에러 처리 (예: 로그아웃 처리)
                }
            }
        }
    };



    const loadList = () => {
        if (dataList?.length !== 0) {
            return (
                <>
                    <ul>
                        {dataList?.map((data, index) => (<ReviewList key={index} props={data}
                                                                     pageReLoad={pageReLoad}
                                                                     setPageReLoad={setPageReLoad}
                                                                     cafeId={cafeId}
                                                                     cafePhotoUrl={cafePhotoUrl}
                                                                     cafeName={cafeName}
                                                                     displayComment={displayComment}/>))}
                    </ul>
                    {isLast ? null : <div ref={ref} className={style.refContainer}><Loading ref={ref} /></div>}
                </>
            );
        } else {

            return <div className={style.noReviewsContainer}>아직 리뷰가 없습니다</div>
            // return <Loading />;
        }
    };

    const moveWriteReview = () => {
        navigate('/WriteReview', {
            state: {
                cafeId: cafeId,
                cafePhotoUrl:cafePhotoUrl,
                cafeName:cafeName
            }
        })
    }

    if (!dataList) {
        return <Loading />
    }

    return (
        <>
            <div className={styled.page_wrapper}>
                <main className={styled.main_container}>
                    <Top />
                    <article className={style.cafeBestReviewContainer}>
                        <div className={style.cafeBestReviewReviewCnt}>
                            <span>리뷰</span>
                            <span style={{ color: 'red', marginLeft: '3px' }}>{cafeReviewCnt}</span>
                        </div>
                        <div className={style.cafeBestReviewRatingContainer}>
                            <span className={style.cafeRatingFontSize}>{dataList.cafeRating}</span>
                            <Rating rating={cafeRating} />
                            <div className={style.writeReview} onClick={token ? moveWriteReview : () => setLoginModalOpen(true)}>
                                <Icon_writeReview className={style.reviewWriteBtn} />
                                <span style={{ marginLeft: '2px' }}>리뷰작성</span>
                            </div>
                        </div>
                        <div className={style.reviewHRContainer}><hr className={style.reviewHR} /></div>
                        <div style={{ width: '100%' }}>
                            {loadList()}
                        </div>
                    </article>
                    {loginModalOpen && <ModalComponent modalIsOpen={loginModalOpen} setModalIsOpen={setLoginModalOpen}></ModalComponent>}

                </main>
            </div>
        </>
    )
}

export default Review;

function Top() {
    return (
        <article className={style.containerWrapper}>
            <img src={img_review} className={style.imgBg} />
            <article className={style.textContainer}>
                <Icon_list fill="white" className={style.icon} />
                <span className={style.textOnBg}>전체 리뷰 목록</span>
            </article>
        </article>
    )
}

