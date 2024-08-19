import React from "react";
import Spinner from "../asset/gif/gif_loading.gif"

const Loading = () => {
    return(
        <div style={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '500px', width: '100%'}}>
            <img src={Spinner} alt="로딩" style={{width:"100px", height:"100px"}}/>
        </div>    
    )
}
export default Loading;
