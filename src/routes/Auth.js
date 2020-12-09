import React from 'react';
import {firebaseInstance, authService} from 'fbase';
import {Button} from '@material-ui/core';
import {IoLogoGoogle} from 'react-icons/io5';

const Auth = () => {
    const onGooleClick = async () => {
        const provider = new firebaseInstance.auth.GoogleAuthProvider();
        await authService.signInWithPopup(provider);
    }

    return(
        <Button 
            variant="outlined" 
            onClick={onGooleClick} 
            fullWidth> 
            <IoLogoGoogle/> &nbsp; 구글아이디로 로그인
        </Button>
    )
}

export default Auth;