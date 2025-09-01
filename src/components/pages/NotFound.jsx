import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center relative theme-layout">
            <div className="text-center px-4">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold mb-4 theme-blue-accent">
                        404
                    </h1>
                    <h2 className="text-3xl font-semibold mb-4 theme-text-primary">
                        페이지를 찾을 수 없습니다
                    </h2>
                    <p className="text-lg mb-8 theme-text-secondary">
                        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 theme-button-primary"
                    >
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;