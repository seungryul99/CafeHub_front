import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import style from "./Comment.module.css";
import Loading from "./loading";
import { ReactComponent as Icon_setting } from "../asset/icon/icon_setting.svg";
import ModalComponent from './modalComponent';

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
function Comment({ props, commentCnt, setCommentCnt, pageReLoad, setPageReLoad }) {
    const [commentRegisterFlag, setCommentRegisterFlag] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    return (
        <>
            <CommentInput
                reviewId={props.reviewId}
                commentCnt={commentCnt}
                setCommentCnt={setCommentCnt}
                commentRegisterFlag={commentRegisterFlag}
                setCommentRegisterFlag={setCommentRegisterFlag}
                setCurrentPage={setCurrentPage}
                pageReLoad={pageReLoad}
                setPageReLoad={setPageReLoad}
                setModalIsOpen={setModalIsOpen}
            />
            {props.commentCnt !== 0 && <GetComment
                props={props}
                commentRegisterFlag={commentRegisterFlag}
                setCommentRegisterFlag={setCommentRegisterFlag}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageReLoad={pageReLoad}
                setPageReLoad={setPageReLoad}
                setCommentCnt={setCommentCnt} // 댓글 수 업데이트를 위한 함수 전달
            />}
            <ModalComponent modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} />
        </>
    );
}

export default Comment;

const CommentInput = ({ reviewId, commentCnt, setCommentCnt, commentRegisterFlag, setCommentRegisterFlag, setCurrentPage, pageReLoad, setPageReLoad, setModalIsOpen }) => {
    const [comment, setComment] = useState('');

    const handleChange = (event) => {
        setComment(event.target.value);
    };

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

    const handleSubmit = async () => {
        try {
            // 액세스 토큰 가져오기
            const token = localStorage.getItem('accessToken');

            // 토큰이 없으면 모달 열기
            if (!token) {
                setModalIsOpen(true);
                return;
            }

            // 댓글 내용이 비어 있지 않으면 요청 처리
            if (comment.trim() !== '') {
                const data = { commentContent: comment };

                // API 요청
                const response = await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/reviews/${reviewId}/comment`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // 댓글 성공적으로 등록된 후 상태 업데이트
                setComment('');
                setCommentCnt(commentCnt + 1); // 댓글 수 증가
                setCommentRegisterFlag(!commentRegisterFlag);
                setCurrentPage(0);
                setPageReLoad(!pageReLoad);

            }
        } catch (error) {
            console.error('API 요청 실패:', error);

            // 만약 토큰 만료로 인한 401 에러가 발생하면 리프레시 토큰으로 새로운 액세스 토큰 발급 시도
            if (error.response && error.response.data.code === 'LOGIN_401_1') {
                console.log('액세스 토큰 만료 예외 상황 발생');
                try {
                    // 리프레시 토큰을 사용하여 새 액세스 토큰 발급 요청
                    console.log('쿠키 발사 전');
                    const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                    console.log('쿠키 발사 후');

                    // 새 액세스 토큰 저장
                    const newAccessToken = getAccessTokenFromCookie();
                    console.log('새 토큰 발급 완료');

                    // 새로운 토큰으로 재요청
                    const retryResponse = await axios.post(`${process.env.REACT_APP_APIURL}/api/auth/reviews/${reviewId}/comment`, { commentContent: comment }, {
                        headers: {
                            'Authorization': `Bearer ${newAccessToken}`, // 새 토큰 추가
                        }
                    });

                    // 댓글 성공적으로 등록된 후 상태 업데이트
                    setComment('');
                    setCommentCnt(commentCnt + 1); // 댓글 수 증가
                    setCommentRegisterFlag(!commentRegisterFlag);
                    setCurrentPage(0);
                    setPageReLoad(!pageReLoad);

                } catch (reissueError) {
                    console.error('토큰 재발급 실패:', reissueError);
                    // 추가적인 에러 처리 (예: 로그아웃 처리)
                }
            }
        }
    };


    return (
        <div className={style.commentInputContainer}>
            <input
                type="text"
                value={comment}
                onChange={handleChange}
                placeholder="댓글 추가..."
                className={style.commentInput}
            />
            <button onClick={handleSubmit} className={style.submitButton}>
                등록
            </button>
        </div>
    );
};

const GetComment = ({ props, commentRegisterFlag, setCommentRegisterFlag, currentPage, setCurrentPage, pageReLoad, setPageReLoad, setCommentCnt }) => {
    const [ref, inView] = useInView();
    const [isLast, setIsLast] = useState(false);
    const [dataList, setDataList] = useState([]);
    const token = localStorage.getItem('accessToken');

    const pageLoad = async (currentPage) => {
        const config = token ? {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        } : {};

        try {
            const response = await axios.get(`${process.env.REACT_APP_APIURL}/api/optional-auth/reviews/${props.reviewId}/comments/${currentPage}`, config);
            setIsLast(response.data.data.isLast);

            if (currentPage === 0) {
                setDataList(response.data.data.comments);
            } else {
                setDataList((prevDataList) => [...prevDataList, ...response.data.data.comments]);
            }
        } catch (error) {
            console.error('Error fetching data: ', error);

            // 401 Unauthorized 에러 처리 (토큰 만료)
            if (error.response && error.response.data.code === 'LOGIN_401_1') {
                console.log('액세스 토큰 만료, 재발급 시도');
                try {
                    // 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급 요청
                    const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                    // 새로운 액세스 토큰을 쿠키에서 가져오기
                    const newAccessToken = getAccessTokenFromCookie();

                    console.log("토큰 재발급 성공")
                    // 새로운 토큰으로 다시 요청
                    const retryResponse = await axios.get(
                        `${process.env.REACT_APP_APIURL}/api/optional-auth/reviews/${props.reviewId}/comments/${currentPage}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}`
                            }
                        }
                    );

                    console.log("재요청 성공")
                    setIsLast(retryResponse.data.data.isLast);

                    if (currentPage === 0) {
                        setDataList(retryResponse.data.data.comments);
                    } else {
                        setDataList((prevDataList) => [...prevDataList, ...retryResponse.data.data.comments]);
                    }
                } catch (reissueError) {
                    console.error('토큰 재발급 실패:', reissueError);
                    // 추가적인 에러 처리 (예: 로그아웃 처리)
                }
            }
        }
    };


    useEffect(() => {
        pageLoad(currentPage);
    }, [currentPage, commentRegisterFlag]);

    useMemo(() => {
        if (inView) {
            setCurrentPage(prevCurrentPage => prevCurrentPage + 1);
        }
    }, [inView]);

    const loadList = () => {
        return (
            <>
                <ul>
                    {dataList?.map((data, index) => (
                        <CommentList
                            key={index}
                            data={data}
                            pageReLoad={pageReLoad}
                            setPageReLoad={setPageReLoad}
                            commentRegisterFlag={commentRegisterFlag}
                            setCommentRegisterFlag={setCommentRegisterFlag}
                            dataList={dataList}
                            setDataList={setDataList}
                            setCommentCnt={setCommentCnt} // 댓글 수 업데이트를 위한 함수 전달
                        />
                    ))}
                </ul>
                {isLast ? null : <div ref={ref} className={style.refContainer}><Loading /></div>}
            </>
        );
    };

    return (
        <div style={{ width: '100%' }}>
            {loadList()}
        </div>
    );
}

const CommentList = ({ data, pageReLoad, setPageReLoad, commentRegisterFlag, setCommentRegisterFlag, dataList, setDataList, setCommentCnt }) => {
    const [isDropMenuOpen, setIsDropMenuOpen] = useState(false);
    const token = localStorage.getItem('accessToken');

    const toggleDropMenu = (e) => {
        e.stopPropagation();
        setIsDropMenuOpen(prevState => !prevState);
    };

    const toggleDropMenuDown = (e) => {
        e.stopPropagation();
        setIsDropMenuOpen(false);
    };

    const commentManagementCheck = () => {
        return (
            <>
                {data.commentManagement && (
                    <span className={style.settingIconWrapper} onClick={toggleDropMenu}>
                        <Icon_setting fill="#828282" />
                    </span>
                )}
            </>
        );
    };

    const deleteComment = async () => {
        const commentId = data.commentId;
        const reviewId = data.reviewId;

        try {
            await axios.delete(`${process.env.REACT_APP_APIURL}/api/auth/review/${reviewId}/comment/${commentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // 댓글 삭제 후 댓글 수 감소
            setCommentCnt(prevCount => prevCount - 1); // 댓글 수 감소
            setDataList(prevDataList => prevDataList.filter(comment => comment.commentId !== commentId));
            setPageReLoad(!pageReLoad);
            setCommentRegisterFlag(!commentRegisterFlag);
        } catch (error) {
            console.error('Error deleting comment: ', error);

            // 401 Unauthorized 에러 발생 시 리프레시 토큰을 사용하여 새 액세스 토큰 발급
            if (error.response && error.response.data.code === 'LOGIN_401_1') {
                console.log('액세스 토큰 만료 예외 상황 발생');

                try {
                    // 리프레시 토큰을 사용하여 새 액세스 토큰 발급 요청
                    const reissueResponse = await axios.post('/reissue/token', {}, { withCredentials: true });

                    // 새 액세스 토큰 저장
                    const newAccessToken = getAccessTokenFromCookie(); // 새 액세스 토큰을 쿠키에서 가져오는 함수
                    console.log('새 토큰 발급 완료');

                    // 새로운 토큰으로 다시 삭제 요청
                    await axios.delete(`${process.env.REACT_APP_APIURL}/api/auth/review/${reviewId}/comment/${commentId}`, {
                        headers: {
                            'Authorization': `Bearer ${newAccessToken}`
                        }
                    });

                    // 댓글 삭제 후 댓글 수 감소
                    setCommentCnt(prevCount => prevCount - 1); // 댓글 수 감소
                    setDataList(prevDataList => prevDataList.filter(comment => comment.commentId !== commentId));
                    setPageReLoad(!pageReLoad);
                    setCommentRegisterFlag(!commentRegisterFlag);

                } catch (reissueError) {
                    console.error('토큰 재발급 실패:', reissueError);
                    // 추가적인 에러 처리 (예: 로그아웃 처리)
                }
            }
        }
    };


    return (
        <li className={style.flexLine} onClick={toggleDropMenuDown}>
            <article className={style.nicknameAndDateWrapper}>
                {data.commentWriterProfile && (
                    <img
                        src={data.commentWriterProfile}
                        alt={`${data.nickname}'s profile`}
                        className={style.profileImage}
                    />
                )}
                <div>
                    <span className={style.nickname}>{data.nickname}</span>
                    <span className={style.commentDate}>{data.commentDate}</span>
                </div>
                {commentManagementCheck()}
                {isDropMenuOpen && (
                    <ul className={style.dropMenuContainer}>
                        <li className={style.dropMenuWrapper} onClick={deleteComment}>
                            <span>삭제</span>
                        </li>
                    </ul>
                )}
            </article>

            <article className={style.contentWrapper}>
                <span className={style.content}>{data.commentContent}</span>
            </article>
        </li>
    );
};
