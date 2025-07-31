import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './ui/Header';
import Footer from './ui/Footer';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col font-[Noto_Sans_KR] bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
} 