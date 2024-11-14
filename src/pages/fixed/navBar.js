import style from "./navBar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as Home } from "../../asset/icon/icon_home.svg";
import { ReactComponent as CafeData } from "../../asset/icon/icon_cafe.svg";
import { ReactComponent as Bookmark } from "../../asset/icon/icon_bookmark.svg";
import { ReactComponent as MyPage } from "../../asset/icon/icon_myPage.svg";
import { useState, useEffect } from "react";
import ModalComponent from "../../components/modalComponent";

// 네비게이션 항목 리스트 정의
const navList = [
    { id: 1, src: Home, title: "홈", url: "/" },
    { id: 2, src: CafeData, title: "카페둘러보기", url: "/CafeList" },
    { id: 3, src: Bookmark, title: "북마크", url: "/Bookmark" },
    { id: 4, src: MyPage, title: "마이페이지", url: "/MyPage" }
];

function NavBar({ selectedId, setSelectedId, setModalIsOpen }) {
    const location = useLocation(); // 현재 URL 가져오기

    // URL이 바뀔 때마다 selectedId를 업데이트하는 로직 추가
    useEffect(() => {
        const currentNav = navList.find(nav => nav.url === location.pathname);
        if (currentNav) {
            setSelectedId(currentNav.id);
        }
    }, [location.pathname, setSelectedId]);

    return (
        <nav className={style.wrapper}>
            {navList.map((data) => (
                <NavList
                    key={data.id}
                    props={data}
                    setSelectedId={setSelectedId}
                    isSelected={selectedId === data.id}
                    setModalIsOpen={setModalIsOpen}
                />
            ))}
        </nav>
    );
}

export default NavBar;

function NavList({ props, setSelectedId, isSelected, setModalIsOpen }) {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const token = localStorage.getItem('accessToken');
    const navigate = useNavigate();

    // 선택된 항목에 따라 색상 변경
    const color = isSelected ? "#492228" : "#ACABB0";

    // 네비게이션 클릭 시 호출되는 함수
    const handleNavigation = () => {
        setSelectedId(props.id);
        if (props.id === 2) {
            navigate(props.url, { state: { type: "All" } });
        } else if ((props.id === 3 && !token) || (props.id === 4 && !token)) {
            setLoginModalOpen(true); // 로그인 필요 시 모달 열기
        } else {
            navigate(props.url); // 일반 페이지 이동
        }
    };

    return (
        <>
            <div className={style.navA} onClick={handleNavigation}>
                <props.src className={style.img} fill={color} />
                <span className={style.text} style={{ color: color }}>
                    {props.title}
                </span>
            </div>
            {/* 로그인 모달 */}
            {loginModalOpen && (
                <ModalComponent
                    modalIsOpen={loginModalOpen}
                    setModalIsOpen={setLoginModalOpen}
                />
            )}
        </>
    );
}
