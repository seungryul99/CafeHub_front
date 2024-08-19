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
    const token = sessionStorage.getItem('accessToken')
    const [cafeReviewCnt, setCafeReviewCnt] = useState(0);
    const [cafeRating, setCafeRating] = useState(0);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const displayComment = true;

    useEffect(() => {
        pageLoad(currentPage);
    }, [currentPage, pageReLoad])


    useMemo(() => {
        if (inView) {
            setCurrentPage(prevCurrentPage => prevCurrentPage + 1);
        }
    }, [inView])

    const pageLoad = (currentPage) => {
        const config = token ? {
            headers: {
                'Authorization': token
            }
        } : {};
        axios.get(`${process.env.REACT_APP_APIURL}/api/cafe/${cafeId}/reviews/${currentPage}`, config)
            .then(response => {
                console.log(response)
                setIsLast(response.data.isLast);
                setCafeReviewCnt(response.data.cafeReviewCnt)
                setCafeRating(response.data.cafeRating)
                if (currentPage === 0) {
                    setDataList(response.data.reviewList);
                } else {
                    setDataList(prevDataList => [...prevDataList, ...response.data.reviewList]);
                }
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }


    const loadList = () => {
        if (dataList?.length !== 0) {
            return (
                <>
                    <ul>
                        {dataList?.map((data, index) => (<ReviewList key={index} props={data} pageReLoad={pageReLoad} setPageReLoad={setPageReLoad} cafeId={cafeId} cafePhotoUrl={cafePhotoUrl} cafeName={cafeName} displayComment={displayComment}/>))}
                    </ul>
                    {isLast ? null : <div ref={ref} className={style.refContainer}><Loading ref={ref} /></div>}
                </>
            );
        } else {
            return <Loading />;
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

