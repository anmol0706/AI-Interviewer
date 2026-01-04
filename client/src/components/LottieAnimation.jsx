import React from 'react';
import Lottie from 'lottie-react';

const LottieAnimation = ({ animationData, width = 300, height = 300, className = '' }) => {
    return (
        <div className={className} style={{ width, height }}>
            <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default LottieAnimation;
