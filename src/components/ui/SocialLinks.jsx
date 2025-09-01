import React from 'react';

export default function SocialLinks() {
    return (
        <div className="flex gap-3 text-xl theme-text-tertiary">
            {/* Notion */}
            <a
                href="https://www.notion.so/sniperfactory1/AIaaS-1-2-_Scratcha-223d8844b387806182def2031225d565"
                aria-label="Notion"
                className="transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src="/src/assets/images/nt_favicon.ico"
                    alt="Notion"
                    className="w-5 h-5"
                />
            </a>

            {/* GitHub */}
            <a
                href="https://github.com/Kakao-Scratcha"
                aria-label="GitHub"
                className="transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src="/src/assets/images/gh_favicon.svg"
                    alt="GitHub"
                    className="w-5 h-5"
                />
            </a>

            {/* SniperFactory */}
            <a
                href="https://sniperfactory.com/"
                aria-label="SniperFactory"
                className="transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    src="/src/assets/images/sp_favicon.ico"
                    alt="SniperFactory"
                    className="w-5 h-5"
                />
            </a>
        </div>
    );
} 