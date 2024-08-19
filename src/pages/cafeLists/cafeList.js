import style from "../../styles/CafeListStyle.module.css"
import styled from "../../styles/GlobalStyle.module.css"
import styles from "./cafeList.module.css"
import img_cafeList_bg from "../../asset/img/img_cafeList.png"
import img_dateTitle from "../../asset/img/img_dateTitle.png"
import img_dessertTitle from "../../asset/img/img_dessertTitle.png"
import img_studyTitle from "../../asset/img/img_studyTitle.png"
import img_meetingTitle from "../../asset/img/img_meetingTitle.png"

import img_star from "../../asset/img/img_star.png"
import { ReactComponent as Icon_cafe } from "../../asset/icon/icon_cafe.svg"
import SortedType from "../../components/sortedType"
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer"
import Loading from "../../components/loading";


function CafeList() {
    const location = useLocation();
    const type = location.state.type;
    const [sortedType, setSortedType] = useState('name');
    const [currentPage, setCurrentPage] = useState(0);
    
    const [ref, inView] = useInView();

    const [dataList, setDataList] = useState([]);
    const [isLast, setIsLast] = useState(false);
    


    const pageLoad = (currentPage) => {
        axios.get(`${process.env.REACT_APP_APIURL}/api/cafeList/${type}/${sortedType}/${currentPage}`)
        .then(response => {
            const cafeList = response.data.data.cafeList || [];
            console.log(response)
            setIsLast(response.data.data.isLast);
            if (currentPage === 0) {
                scrollToTop();
                setDataList(cafeList);
            } else{
                setDataList(prevDataList => Array.isArray(prevDataList) ? [...prevDataList, ...cafeList] : cafeList)
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
        });
    }

    useEffect(()=>{
        pageLoad(currentPage);
    }, [currentPage])


    const scrollToTop = () => {
        window.scrollTo(0, 0);
        console.log('scroll 맨 위로 왜 안돼!!!!')
    }

    useMemo(()=>{
        if(inView){
            setCurrentPage(prevCurrentPage => prevCurrentPage + 1);
        }
    },[inView])
    

    useMemo(()=>{
        setCurrentPage(0);
        pageLoad(currentPage);
    }, [sortedType, type])


    const findTheme = cafeThemeDataList.find(item => item.theme === type);

    const loadList = () => {
        if (dataList?.length !== 0) {
            return (
                <>
                    <ul>
                        {dataList?.map((data, index) => (<CafeListList key={index} props={data}/>))}
                    </ul>
                    {isLast ? null : <div ref={ref} className={styles.refContainer}><Loading ref={ref}/></div>}
                </>
            );
        } else {
            return <Loading />;
        }
    };


    return (
        <>
            <div className={styled.page_wrapper}>
                <main className={styled.main_container}>
                    <CafeThemeList props = {findTheme}/>
                    <SortedType setSortedType = {setSortedType}/>
                    <div style={{width: '100%'}}>
                        {loadList()}
                    </div>
                </main>
            </div>
        </>
    )
}

export default CafeList;

function CafeListList({props}){
    const navigate = useNavigate();

    const func = () => {
        navigate('/CafeDetail', {state: {cafeId: props.cafeId}})
    }

    return (
        <div className={style.flexLine} onClick={func} style={{cursor:'pointer'}}>
                <img className={style.cafeImg} src={props.cafePhotoUrl}></img>
                <div className={style.CafeTextContainer}>
                    <div>
                        <span className={style.cafeTitle}>{props.cafeName}</span>
                        <span className={style.cafeTheme}>{props.cafeTheme}</span>
                        <div className={style.starRatingReview}>
                            <img className={style.img_star} src={img_star}></img>
                            <span className={style.cafeRating}>{props.cafeRating} ({props.cafeReviewNum})</span>
                        </div>
                    </div>
                </div>
        </div>
    )
}

const cafeThemeDataList = [
    {theme: "Date", image:img_dateTitle, themeIcon:Icon_cafe, themeText:"데이트 카페 리스트"},
    {theme: "Dessert", image:img_dessertTitle, themeIcon:Icon_cafe, themeText:"디저트 카페 리스트"},
    {theme: "Meet", image:img_meetingTitle, themeIcon:Icon_cafe, themeText:"회의 카페 리스트"},
    {theme: "Study", image:img_studyTitle, themeIcon:Icon_cafe, themeText:"공부 카페 리스트"},
    {theme: "All", image:img_cafeList_bg, themeIcon:Icon_cafe, themeText:"전체 카페 리스트"}
]

function CafeThemeList({props}) {
    

    return(
        <article className={style.containerWrapper}>
            <img src={props.image} className={style.imgBg}/>
            <article className={style.textContainer}>
                <props.themeIcon fill="white" className={style.icon}/>
                <span className={style.textOnBg}>{props.themeText}</span>
            </article>
        </article>
    )
}