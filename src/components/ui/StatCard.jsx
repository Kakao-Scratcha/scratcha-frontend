import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const StatCard = ({ title, data, loading, className = "" }) => {
    const { currentCount = 0, rate = 0 } = data || {};

    const renderRateIcon = () => {
        if (rate > 0) {
            return (
                <>
                    <svg className="w-6 h-6 theme-success" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4l8 16H4L12 4z" />
                    </svg>
                    <span className="text-lg md:text-xl font-bold theme-success">+{Math.ceil(rate)}%</span>
                </>
            );
        } else if (rate < 0) {
            return (
                <>
                    <svg className="w-6 h-6 theme-error" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 20l-8-16h16l-8 16z" />
                    </svg>
                    <span className="text-lg md:text-xl font-bold theme-error">{Math.ceil(rate)}%</span>
                </>
            );
        } else {
            return (
                <>
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="2" rx="1" />
                    </svg>
                    <span className="text-lg md:text-xl font-bold text-yellow-500">0%</span>
                </>
            );
        }
    };

    return (
        <div className={`p-5 rounded-lg theme-card text-center ${className}`}>
            <h3 className="text-base md:text-lg font-semibold theme-text-primary mb-1">{title}</h3>
            {loading ? (
                <div className="flex justify-center items-center h-20">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    <p className="text-4xl md:text-5xl font-bold theme-blue-accent">
                        {currentCount.toLocaleString()}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 justify-center">
                        {renderRateIcon()}
                    </div>
                </>
            )}
        </div>
    );
};

export default StatCard;