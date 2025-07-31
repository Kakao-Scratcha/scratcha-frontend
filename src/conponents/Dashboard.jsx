import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './dashboard/Sidebar';
import DashboardHeader from './dashboard/DashboardHeader';

export default function Dashboard() {
    return (
        <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-900">
                    <Outlet />
                </main>
            </div>
        </div>
    );
} 