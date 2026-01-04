import React from 'react';

const GDGLogo = ({ className = "w-8 h-8", ...props }) => {
    return (
        <svg
            viewBox="0 0 100 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <g strokeLinecap="round" strokeLinejoin="round">
                {/* Black Outlines (Background) */}
                <g stroke="#000" strokeWidth="22">
                    <path d="M42 16 L18 35 L42 54" />
                    <path d="M58 16 L82 35 L58 54" />
                </g>

                {/* Colored Segments */}
                <g strokeWidth="16">
                    {/* Left Chevron */}
                    <path d="M42 16 L18 35" stroke="#EA4335" /> {/* Red */}
                    <path d="M18 35 L42 54" stroke="#4285F4" /> {/* Blue */}

                    {/* Right Chevron */}
                    <path d="M58 16 L82 35" stroke="#34A853" /> {/* Green */}
                    <path d="M82 35 L58 54" stroke="#FBBC04" /> {/* Yellow */}
                </g>
            </g>
        </svg>
    );
};

export default GDGLogo;
