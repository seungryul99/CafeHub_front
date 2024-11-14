import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import style from "./Comment.module.css";
import Loading from "./loading";
import { ReactComponent as Icon_setting } from "../asset/icon/icon_setting.svg";
import ModalComponent from './modalComponent';

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

    const handleSubmit = async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setModalIsOpen(true); // 모달 열기
            return;
        }

        if (comment.trim() !== '') {
            const data = {
                commentContent: comment
            }
            axios.post(`${process.env.REACT_APP_APIURL}/api/auth/reviews/${reviewId}/comment`, data, {
                headers: {
                    'Authorization': token
                }
            })
                .then(res => {
                    setComment('');
                    setCommentCnt(commentCnt + 1); // 댓글 수 증가
                    setCommentRegisterFlag(!commentRegisterFlag);
                    setCurrentPage(0);
                    setPageReLoad(!pageReLoad);
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
    );
};

const GetComment = ({ props, commentRegisterFlag, setCommentRegisterFlag, currentPage, setCurrentPage, pageReLoad, setPageReLoad, setCommentCnt }) => {
    const [ref, inView] = useInView();
    const [isLast, setIsLast] = useState(false);
    const [dataList, setDataList] = useState([]);
    const token = localStorage.getItem('accessToken');

    const pageLoad = (currentPage) => {
        const config = token ? {
            headers: {
                'Authorization': token
            }
        } : {};

        axios.get(`${process.env.REACT_APP_APIURL}/api/optional-auth/reviews/${props.reviewId}/comments/${currentPage}`, config)
            .then(response => {
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

    const deleteComment = () => {
        const commentId = data.commentId;
        const reviewId = data.reviewId;

        axios.delete(`${process.env.REACT_APP_APIURL}/api/auth/review/${reviewId}/comment/${commentId}`, {
            headers: {
                'Authorization': token
            }
        })
            .then(res => {
                // 댓글 삭제 후 댓글 수 감소
                setCommentCnt(prevCount => prevCount - 1); // 댓글 수 감소
                setDataList((prevDataList) => prevDataList.filter(comment => comment.commentId !== commentId));
                setPageReLoad(!pageReLoad);
                setCommentRegisterFlag(!commentRegisterFlag);
            })
            .catch(error => {
                console.error('Error deleting comment: ', error);
            });
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
