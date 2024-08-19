import React from "react";
import style from "./Rating.module.css"
import img_star from "../asset/img/img_star.png"


function Rating({ rating, size }){
    const stars = [];
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars.push(<img className={style.starSize} key={i} src={img_star} alt="star" style={size}/>);
        } else {
            stars.push(<img className={`${style.grayStar} ${style.starSize}`} key={i} src={img_star} alt="Notstar" style={size}/>);
        }
    }
    return (
        <div className={style.starContainer}>
            {stars}
        </div>
    );
}
export default Rating;