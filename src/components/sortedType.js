import style from "./sortedType.module.css";
import { ReactComponent as Icon_sort } from "../asset/icon/icon_sort.svg";
import { ReactComponent as Icon_name } from "../asset/icon/icon_name.svg";
import { ReactComponent as Icon_rate } from "../asset/icon/icon_rate.svg";
import { ReactComponent as Icon_review } from "../asset/icon/icon_review.svg";
import { ReactComponent as Icon_drop } from "../asset/icon/icon_drop.svg";
import { useState, useEffect } from "react";

function SortedType({ setSortedType }) {
    const [selectedType, setSelectedType] = useState(1);  // 초기값을 1로 설정하여 name 선택
    const [sortedIndices, setSortedIndices] = useState({
        1: 1,  // name 버튼의 sortedIndex
        2: 0,  // rating 버튼의 sortedIndex
        3: 0   // reviewNum 버튼의 sortedIndex
    });

    // 초기 렌더링 시 name이 기본적으로 설정되도록
    useEffect(() => {
        setSortedType("name");
    }, [setSortedType]);

    const handleSortChange = (btnId, sortedUrl) => {
        const currentSortedIndex = sortedIndices[btnId];
        const nextIndex = (currentSortedIndex + 1) % sortedUrl.length;

        setSortedType(sortedUrl[nextIndex]);

        setSortedIndices({
            1: btnId === 1 ? nextIndex : 0,  // name
            2: btnId === 2 ? nextIndex : 0,  // rating
            3: btnId === 3 ? nextIndex : 0   // reviewNum
        });

        setSelectedType(btnId);
    };

    return (
        <div className={style.Container}>
            <div className={style.sortContainer}>
                <Icon_sort className={style.sort} fill="#492228" />
                <span className={style.sortText}>정렬 기준</span>
            </div>
            <div className={style.btnContainer}>
                <ul className={style.ulList}>
                    {btnDataList.map((data) => (
                        <BtnList
                            key={data.btnId}
                            props={data}
                            isSelected={selectedType === data.btnId}
                            sortedIndex={sortedIndices[data.btnId]}
                            handleSortChange={handleSortChange}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SortedType;

export const btnDataList = [
    { btnId: 1, sortedUrl: ["name_d", "name"], icon: Icon_name, btnText: "이름 순" },
    { btnId: 2, sortedUrl: ["rating_a", "rating"], icon: Icon_rate, btnText: "별점 순" },
    { btnId: 3, sortedUrl: ["reviewNum_a", "reviewNum"], icon: Icon_review, btnText: "리뷰 개수" }
];

function BtnList({ props, isSelected, sortedIndex, handleSortChange }) {
    const backgroundColor = isSelected ? "#492228" : "#FFF";
    const contentColor = isSelected ? "#FFF" : "#492228";

    const handleClick = () => {
        handleSortChange(props.btnId, props.sortedUrl);
    };

    return (
        <li className={style.liList}>
            <button
                type="button"
                className={style.btnStyle}
                style={{ background: backgroundColor }}
                onClick={handleClick}
            >
                <props.icon className={style.btnIcon} fill={contentColor} />
                <span className={style.btnText} style={{ color: contentColor }}>
                    {props.btnText}
                </span>
                <Icon_drop className={style.drop} fill={contentColor} />
            </button>
        </li>
    );
}
