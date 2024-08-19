import styled from "../../styles/GlobalStyle.module.css"
import style from "./mainPage.module.css"
import ImgDate from '../../asset/img/img_date.png';
import ImgDessert from '../../asset/img/img_dessert.png';
import ImgMeeting from '../../asset/img/img_meeting.png';
import ImgStudy from '../../asset/img/img_study.png';
import { useNavigate } from "react-router-dom";



function MainPage(){

    return (
        <> 
            <div className={styled.page_wrapper}>
                <main className={styled.main_container}>
                    <ul className={style.ulContainer}>
                        {dataList.map((data)=>(<Imglist key={data.id} props={data}/>))}
                    </ul>
                </main>
            </div>

        </>
    )
}

export default MainPage;

const dataList = [
{id:1, theme: "Date", src: ImgDate, title:"데이트하기 좋은", tag:"#핫플 #분위기"}, 
{id:2, theme: "Dessert", src:ImgDessert, title:"디저트가 맛있는", tag:"#디저트 맛집"},
{id:3, theme: "Meet", src:ImgMeeting, title:"회의하기 좋은", tag:"#핫플 #분위기"},
{id:4, theme: "Study", src:ImgStudy, title:"공부하기 좋은", tag:"#핫플 #분위기"}
];//나중에 link 시킬때 여기에 url 하나씩 주고 밑에 Imglist의 li에 url걸어줘야 함.

function Imglist({props}){
    console.log(props.src)
    const navigate = useNavigate();


    const handleClickCafeTheme =()=>{
        navigate('/CafeList', {state: {type: props.theme}});
    }
    
    return (
        <li className={style.flexLine} onClick={handleClickCafeTheme}>
        <img src={props.src} className={style.img}></img>
        <p><span className={style.text}>{props.title}</span>
        <span className={style.text}>{props.tag}</span></p>
    </li>
    )
}