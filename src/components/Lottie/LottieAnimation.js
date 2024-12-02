// LottieAnimation.js
import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../../assets/lotties/animation.json';

const LottieAnimation = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div style={{ cursor: 'default' }}>
            <Lottie
                options={defaultOptions}
                height={320}
                width={300}
                style={{ cursor: 'default' }}
            />
        </div>
    );
};

export default LottieAnimation;