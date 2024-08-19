    import style from "./sortedType.module.css"
import { ReactComponent as Icon_sort } from "../asset/icon/icon_sort.svg"
import { ReactComponent as Icon_name } from "../asset/icon/icon_name.svg"
import { ReactComponent as Icon_rate } from "../asset/icon/icon_rate.svg"
import { ReactComponent as Icon_review } from "../asset/icon/icon_review.svg"
import { ReactComponent as Icon_drop } from "../asset/icon/icon_drop.svg"
import { useState } from "react"

function SortedType({setSortedType}) {
    const [selectedType, setSelectedType] = useState(1);

    return (
        <>
            <div className={style.Container}>
                <div className={style.sortContainer}>
                    <Icon_sort className={style.sort} fill = "#492228"/>
                    <span className={style.sortText}>정렬 기준</span>
                </div>
                <div className={style.btnContainer}>
                    <ul className={style.ulList}>
                        {btnDataList.map((data)=>(<BtnList 
                            key={data.btnId} 
                            props={data}
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                            setSortedType = {setSortedType}
                            />
                        ))}
                    </ul>
                </div>

            </div>
        </>
    )
}
export default SortedType;

export const btnDataList = [
    {btnId:1, sortedUrl: "name", icon:Icon_name, btnText:"이름 순"},
    {btnId:2, sortedUrl: "rating", icon:Icon_rate, btnText:"별점 순"},
    {btnId:3, sortedUrl: "reviewNum", icon:Icon_review, btnText:"리뷰 개수"}
] 


function BtnList({props, selectedType, setSelectedType, setSortedType}) {
    const isSelected = selectedType === props.btnId;
    const backgroundColor = isSelected ? "#492228" : "#FFF";
    const contentColor = isSelected ? "#FFF" : "#492228";

    const func = () => {
        setSelectedType(props.btnId);
        setSortedType(props.sortedUrl);
    }
    return(
        <li className={style.liList}>
            <button type="button" className={style.btnStyle} style={{background: backgroundColor}} onClick={func}>
                <props.icon className={style.btnIcon} fill={contentColor}/>
                <span className={style.btnText} style={{color: contentColor}}>{props.btnText} </span>
                <Icon_drop className={style.drop} fill={contentColor}/>
            </button>
        </li>
    )

}
