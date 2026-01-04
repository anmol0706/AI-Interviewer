import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialCard = ({ testimonial, gradient }) => {
    return (
        <div className={`group glass-card p-4 sm:p-6 hover:border-${gradient}-500/30 transition-all duration-300 relative overflow-hidden h-full`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-${gradient}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

            <div className="relative flex flex-col h-full">
                {/* Quote Icon */}
                <Quote className={`w-6 h-6 sm:w-8 sm:h-8 text-${gradient}-500/20 mb-3 sm:mb-4`} />

                {/* Rating */}
                <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-xs sm:text-sm md:text-base text-dark-200 leading-relaxed mb-4 sm:mb-6 flex-grow">
                    "{testimonial.text}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 mt-auto">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${testimonial.avatarGradient} flex items-center justify-center text-white font-bold text-sm sm:text-base`}>
                        {testimonial.initials}
                    </div>
                    <div>
                        <h4 className="text-sm sm:text-base font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-xs text-dark-400">{testimonial.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
