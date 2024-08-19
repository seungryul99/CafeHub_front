import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "../../styles/GlobalStyle.module.css"
import styles from "../../styles/CafeListStyle.module.css"
import style from "./menu.module.css"
import { ReactComponent as Icon_cafe } from "../../asset/icon/icon_cafe.svg"
import img_cafeList_bg from "../../asset/img/img_cafeList.png"


function Menu(){
    const location = useLocation();
    const cafeId = location.state?.cafeId;
    const [dataList, setDataList] = useState();
    console.log(location.state?.cafeId)
    const [BEVERAGE, setBeverage] = useState([]);
    const [DESSERT, setDessert] = useState([]);

    useEffect(()=>{
        axios.get(`${process.env.REACT_APP_APIURL}/api/cafe/${cafeId}/menu`)
        .then(response => {
            console.log(response)
            setDataList(response.data.data.menuList);
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
        });
    },[cafeId])

    

    const menuClassify = () => {
        if (dataList) {
            const beverage = [];
            const dessert = [];
            dataList.forEach(data => {
                if (data.category === "BEVERAGE") {
                    beverage.push(data);
                } else if (data.category === "DESSERT") {
                    dessert.push(data);
                }
            });
            setBeverage(beverage);
            setDessert(dessert);
        }
    };

    useEffect(() => {
        menuClassify();
    }, [dataList]);

    console.log(BEVERAGE, DESSERT)

    return (
        <> 
            
            <div className={styled.page_wrapper}>
                <main className={styled.main_container}>
                    <article className={styles.containerWrapper}>
                        <img src={img_cafeList_bg} className={styles.imgBg}/>
                        <article className={styles.textContainer}>
                            <Icon_cafe fill="white" className={styles.icon}/>
                            <span className={styles.textOnBg}>메뉴 더보기</span>
                        </article>
                    </article>
                    <article className={style.contentContainer}>
                        <article className={style.contentWrapper}>
                            <span className={style.classify_first}>BEVERAGE</span>
                            
                            <ul>
                                {BEVERAGE.map((data) => (<MenuList key={data.menuId} props={data}/>))}
                            </ul>
                        </article>
                        <div className={style.reviewHRContainer} style={{marginTop:'6px'}}><hr className={style.reviewHR}/></div>

                        <article className={style.contentWrapper}>
                            <span className={style.classify}>DESSERT</span>
                            <ul>
                                {DESSERT.map((data) => (<MenuList key={data.menuId} props={data}/>))}
                            </ul>
                        </article>
                    </article>
                </main>
            </div>
        </>
    )
}

export default Menu;

function MenuList({props}){
    return (
        <li className={style.listWrapper}>
            <span className={style.menuName}>{props.menuName}</span>
            <span className={style.price}>{props.price}</span>
        </li>
    )
}