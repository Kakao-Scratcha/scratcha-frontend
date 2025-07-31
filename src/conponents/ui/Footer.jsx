import React from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';

export default function Footer() {
    return (
        <footer className="w-full pt-12 pb-8 mt-12 font-[Noto_Sans_KR] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between gap-12">
                {/* 좌측: 이메일, 소셜 */}
                <div className="flex flex-col gap-4 min-w-[180px] text-left">
                    <span className="font-medium text-gray-900 dark:text-white">
                        hi@cursor.com
                    </span>
                    <SocialLinks />
                    <span className="text-xs mt-4 text-blue-600 dark:text-blue-400">
                        © 2025 Made by <span className="font-semibold">Anysphere</span>
                    </span>
                </div>
                {/* 중앙: 카테고리별 링크 */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-left">
                    <div>
                        <div className="font-semibold mb-2 text-gray-900 dark:text-white">
                            Product
                        </div>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                            <li><a href="#" className="hover:underline transition-colors">Home</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Features</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Enterprise</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Downloads</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Students</a></li>
                        </ul>
                    </div>
                    <div>
                        <div className="font-semibold mb-2 text-gray-900 dark:text-white">
                            Resources
                        </div>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                            <li><a href="#" className="hover:underline transition-colors">Docs</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Forum</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Changelog</a></li>
                        </ul>
                    </div>
                    <div>
                        <div className="font-semibold mb-2 text-gray-900 dark:text-white">
                            Company
                        </div>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                            <li><a href="#" className="hover:underline transition-colors">Anysphere</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Community</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Customers</a></li>
                        </ul>
                    </div>
                    <div>
                        <div className="font-semibold mb-2 text-gray-900 dark:text-white">
                            Support
                        </div>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                            <li><a href="#" className="hover:underline transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:underline transition-colors">Status</a></li>
                            <li><a href="#" className="hover:underline transition-colors">API</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
} 