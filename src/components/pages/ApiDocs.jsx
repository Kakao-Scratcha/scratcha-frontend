import React, { useEffect } from 'react';
import Card from '../ui/Card';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';

export default function ApiDocs() {
    useEffect(() => {
        Prism.highlightAll();
    }, []);

    return (
        <div className="min-h-screen theme-layout">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Scratcha SDK 문서
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        React 애플리케이션을 위한 Scratcha SDK입니다. 캔버스 기반 이미지 처리, 캡차 시스템, API 통신 기능을 제공합니다.
                    </p>
                </div>

                {/* Quick Start Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        빠른 시작
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="p-8">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                1. 설치
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                npm을 사용하여 Scratcha SDK를 설치하세요.
                            </p>
                            <div>
                                <pre className="text-sm rounded-lg">
                                    <code className="language-bash">
                                        npm install scratcha-sdk
                                    </code>
                                </pre>
                            </div>
                        </Card>

                        <Card className="p-8">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                2. 기본 사용법
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                실제 API를 사용하여 캡차 검증을 구현하세요.
                            </p>
                            <div>
                                <pre className="text-sm rounded-lg">
                                    <code className="language-jsx">
                                        {`import { ScratchaWidget } from "scratcha-sdk";

<ScratchaWidget
  apiKey="your-api-key"
  endpoint="https://api.your-domain.com"
  mode="normal"
  onSuccess={(result) => {
    // 성공 처리
  }}
  onError={(error) => {
    // 에러 처리
  }}
/>`}
                                    </code>
                                </pre>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Installation & Usage */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        설치 및 사용법
                    </h2>

                    {/* Installation */}
                    <Card className="p-8 mb-8">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            📦 설치
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <pre className="text-sm rounded-lg">
                                    <code className="language-bash">
                                        npm install scratcha-sdk
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </Card>

                    {/* Basic Usage */}
                    <Card className="p-8 mb-8">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            🎯 기본 사용법
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    실제 API 사용
                                </h4>
                                <div>
                                    <pre className="text-sm rounded-lg">
                                        <code className="language-jsx">
                                            {`import React from "react";
import { ScratchaWidget } from "scratcha-sdk";

function App() {
  const handleSuccess = (result) => {
    console.log("성공:", result);
    // API 응답 구조: result.result.selectedAnswer
    alert(\`성공! 선택한 답안: \${result.result.selectedAnswer}\`);
  };

  const handleError = (error) => {
    console.error("오류:", error);
    alert(\`오류: \${error.message || "알 수 없는 오류"}\`);
  };

  return (
    <ScratchaWidget
      apiKey="your-api-key"
      endpoint="https://api.your-domain.com"
      mode="normal"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}`}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Props */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        🔧 Props
                    </h2>

                    <Card className="p-8">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            ScratchaWidget Props
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Prop</th>
                                        <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">타입</th>
                                        <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">기본값</th>
                                        <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">설명</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-mono">apiKey</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">string</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">-</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">API 인증 키</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-mono">endpoint</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">string</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">-</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">API 엔드포인트 URL</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-mono">mode</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">'demo' {'|'} 'normal'</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">'normal'</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">데모 모드 또는 실제 API 모드</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-mono">onSuccess</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">(result: any) =&gt; void</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">-</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">성공 시 콜백</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-mono">onError</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">(error: any) =&gt; void</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">-</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">오류 시 콜백</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>



                {/* Features */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        🚀 주요 기능
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">🎨</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">캔버스 기반 이미지 처리</h3>
                            <p className="text-gray-600 dark:text-gray-300">스크래치 기능이 있는 캔버스 컴포넌트</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">🔐</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">캡차 시스템</h3>
                            <p className="text-gray-600 dark:text-gray-300">이미지 기반 캡차 및 정답 검증</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">🌐</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">API 통신</h3>
                            <p className="text-gray-600 dark:text-gray-300">캡차 문제 요청 및 정답 검증</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">🧪</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">데모 모드</h3>
                            <p className="text-gray-600 dark:text-gray-300">내부 데이터로 테스트 가능</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">📱</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">반응형 UI</h3>
                            <p className="text-gray-600 dark:text-gray-300">순수 CSS 기반 모던한 디자인</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">🔗</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">CORS 지원</h3>
                            <p className="text-gray-600 dark:text-gray-300">외부 이미지 로딩 지원</p>
                        </Card>
                    </div>
                </div>
            </div >
        </div >
    );
}
