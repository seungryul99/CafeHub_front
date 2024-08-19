import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import style from "./Comment.module.css"
import Loading from "./loading";
import { ReactComponent as Icon_setting } from "../asset/icon/icon_setting.svg"
import { KakaoLogin } from "./kakaoLogins/kakaoLogin";



function Comment({ props, commentCnt, setCommentCnt, pageReLoad, setPageReLoad }) {
    console.log(props, "이거 이거이거")
    const [commentRegisterFlag, setCommentRegisterFlag] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);


    return (
        <>
            <CommentInput reviewId={props.reviewId} commentCnt={commentCnt} setCommentCnt={setCommentCnt}
                commentRegisterFlag={commentRegisterFlag} setCommentRegisterFlag={setCommentRegisterFlag}
                setCurrentPage={setCurrentPage} pageReLoad={pageReLoad} setPageReLoad={setPageReLoad}/>
            {props.commentCnt !== 0 && <GetComment props={props} commentRegisterFlag={commentRegisterFlag} setCommentRegisterFlag={setCommentRegisterFlag} currentPage={currentPage}
                setCurrentPage={setCurrentPage} pageReLoad={pageReLoad} setPageReLoad={setPageReLoad} />}
        </>
    )
}

export default Comment;

const CommentInput = ({ reviewId, commentCnt, setCommentCnt, commentRegisterFlag, setCommentRegisterFlag, setCurrentPage, pageReLoad, setPageReLoad }) => {
    const [comment, setComment] = useState('');

    const handleChange = (event) => {
        setComment(event.target.value);
    };

    const handleSubmit = async () => {
        if (sessionStorage.getItem('accessToken') === null) {
            KakaoLogin();
        }

        const token = sessionStorage.getItem('accessToken')

        if (comment.trim() !== '') {
            console.log('Comment submitted:', comment);
            const data = {
                commentContent: comment
            }
            axios.post(`${process.env.REACT_APP_APIURL}/api/auth/reviews/${reviewId}/comment`, data, {
                headers: {
                    'Authorization': token,
                }
            })
                .then(res => {
                    console.log(res);
                    setComment('');
                    setCommentCnt(commentCnt + 1);
                    setCommentRegisterFlag(!commentRegisterFlag);
                    setCurrentPage(0)
                    setPageReLoad(!pageReLoad)
                })
                .catch(error => {
                    console.error('Error updating data: ', error);
                });
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
    )
}

const GetComment = ({ props,commentRegisterFlag, setCommentRegisterFlag, currentPage, setCurrentPage, pageReLoad, setPageReLoad }) => {
    console.log(commentRegisterFlag)


    const [ref, inView] = useInView();
    const [isLast, setIsLast] = useState(false);
    const [dataList, setDataList] = useState([]);
    const token = sessionStorage.getItem('accessToken')

    const pageLoad = (currentPage) => {
        const config = token ? {
            headers: {
                'Authorization': token
            }
        } : {};

        console.log("다시 get 요청!!")
        axios.get(`${process.env.REACT_APP_APIURL}/api/reviews/${props.reviewId}/comments/${currentPage}`, config)
            .then(response => {
                console.log(response.data.data); // 서버 응답 확인@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

                setIsLast(response.data.data.isLast);

                if (currentPage === 0) {
                    setDataList(response.data.data.comments);
                } else {
                    setDataList((prevDataList) => [...prevDataList, ...response.data.data.comments]);

                }
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }

    useEffect(() => {
        pageLoad(currentPage);
    }, [currentPage, commentRegisterFlag])


    useMemo(() => {
        if (inView) {
            setCurrentPage(prevCurrentPage => prevCurrentPage + 1);
        }
    }, [inView])


    const loadList = () => {
        if (dataList?.length !== 0 || dataList?.length === 0) {
            return (
                <>
                    <ul>
                        {dataList?.map((data, index) => (<CommentList key={index} data={data} pageReLoad={pageReLoad} setPageReLoad={setPageReLoad} commentRegisterFlag={commentRegisterFlag} setCommentRegisterFlag={setCommentRegisterFlag}/>))}
                    </ul>
                    {isLast ? null : <div ref={ref} className={style.refContainer}><Loading /></div>}
                </>
            );
        } else {
            return <Loading />;
        }
    };

    return (

        <div style={{ width: '100%' }}>
            {loadList()}
        </div>
    )

}



const CommentList = ({ data, pageReLoad, setPageReLoad, commentRegisterFlag, setCommentRegisterFlag }) => {
    console.log(data)
    const [isDropMenuOpen, setIsDropMenuOpen] = useState(false)
    const token = sessionStorage.getItem('accessToken')


    const toggleDropMenu = (e) => {
        e.stopPropagation(); // 이벤트 캡처링 방지
        setIsDropMenuOpen(prevState => !prevState);
    }
    const toggleDropMenuDown = (e) => {
        e.stopPropagation(); // 이벤트 캡처링 방지
        setIsDropMenuOpen(false);
    }
    const commentManagementCheck = () => {
        return (
            <>
                {data.commentManagement && <span className={style.settingIconWrapper} onClick={toggleDropMenu}>
                    <Icon_setting fill="#828282" /></span>}
            </>
        )
    }

    const deleteComment = () => {
        console.log(data.reviewId, "asd")
        const commentId = data.commentId
        axios.post(`${process.env.REACT_APP_APIURL}/api/auth/reviews/${commentId}/delete`, {}, {
            headers: {
                'Authorization': token
            }
        })
            .then(res => {
                console.log(res);
                setPageReLoad(!pageReLoad)
                setCommentRegisterFlag(!commentRegisterFlag)
            })
            .catch(error => {
                console.error('Error updating data: ', error);

            });
    }

    return (
        <>
            <li className={style.flexLine} onClick={toggleDropMenuDown}>
                <article className={style.nicknameAndDateWrapper}>
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
                        </ul>)}
                </article>

                <article className={style.contentWrapper}>
                    <span className={style.content}>{data.commentContent}</span>
                </article>

            </li>
        </>

    )

}