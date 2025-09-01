import React from 'react';
import Card from '../ui/Card';

export default function ApiDocs() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        API 문서
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Scratcha API를 사용하여 캡차 검증을 쉽게 통합하세요.
                        간단하고 강력한 REST API로 빠르게 시작할 수 있습니다.
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
                                1. API 키 발급
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                대시보드에서 API 키를 생성하고 발급받으세요.
                            </p>
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                <code className="text-sm text-gray-800 dark:text-gray-200">
                                    curl -X POST https://api.scratcha.cloud/v1/keys
                                </code>
                            </div>
                        </Card>

                        <Card className="p-8">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                2. 캡차 검증 요청
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                이미지와 함께 검증 요청을 보내세요.
                            </p>
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                <code className="text-sm text-gray-800 dark:text-gray-200">
                                    curl -X POST https://api.scratcha.cloud/v1/verify
                                </code>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* API Endpoints */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        API 엔드포인트
                    </h2>

                    {/* Authentication */}
                    <Card className="p-8 mb-8">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            인증
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            모든 API 요청에는 Authorization 헤더에 API 키를 포함해야 합니다.
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <code className="text-sm text-gray-800 dark:text-gray-200">
                                Authorization: Bearer YOUR_API_KEY
                            </code>
                        </div>
                    </Card>

                    {/* Verify Endpoint */}
                    <Card className="p-8 mb-8">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            캡차 검증
                        </h3>
                        <div className="mb-6">
                            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                                POST /v1/verify
                            </span>
                            <p className="text-gray-600 dark:text-gray-300">
                                이미지 파일을 업로드하여 캡차를 검증합니다.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    요청 예시
                                </h4>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                    <pre className="text-sm text-gray-800 dark:text-gray-200">
                                        {`curl -X POST https://api.scratcha.cloud/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@captcha.png" \\
  -F "options={\\"noise_level\\": \\"medium\\"}"`}
                                    </pre>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    응답 예시
                                </h4>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                    <pre className="text-sm text-gray-800 dark:text-gray-200">
                                        {`{
  "success": true,
  "result": "ABC123",
  "confidence": 0.95,
  "processing_time": 1.2,
  "request_id": "req_123456789"
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Usage Stats */}
                    <Card className="p-8 mb-8">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            사용량 통계
                        </h3>
                        <div className="mb-6">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                                GET /v1/stats
                            </span>
                            <p className="text-gray-600 dark:text-gray-300">
                                API 키별 사용량 통계를 조회합니다.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    요청 예시
                                </h4>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                    <pre className="text-sm text-gray-800 dark:text-gray-200">
                                        {`curl -X GET https://api.scratcha.cloud/v1/stats \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                                    </pre>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    응답 예시
                                </h4>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                    <pre className="text-sm text-gray-800 dark:text-gray-200">
                                        {`{
  "success": true,
  "data": {
    "total_requests": 1250,
    "successful_requests": 1180,
    "failed_requests": 70,
    "tokens_used": 25000,
    "current_period": "2024-01"
  }
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Error Codes */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        오류 코드
                    </h2>
                    <Card className="p-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">코드</th>
                                        <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">설명</th>
                                        <th className="py-3 px-4 font-semibold text-gray-900 dark:text-white">해결 방법</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 px-4 text-red-600 dark:text-red-400 font-mono">400</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">잘못된 요청</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">요청 형식을 확인하세요</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 px-4 text-red-600 dark:text-red-400 font-mono">401</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">인증 실패</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">API 키를 확인하세요</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 px-4 text-red-600 dark:text-red-400 font-mono">429</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">요청 한도 초과</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">요청 빈도를 줄이세요</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-red-600 dark:text-red-400 font-mono">500</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">서버 오류</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">잠시 후 다시 시도하세요</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* SDKs */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        SDK & 라이브러리
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">🐍</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Python</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">pip install scratcha-python</p>
                            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">문서 보기</a>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">☕</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Java</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">Maven Central</p>
                            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">문서 보기</a>
                        </Card>
                        <Card className="p-6 text-center">
                            <div className="text-4xl mb-4">🟨</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">JavaScript</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">npm install scratcha-js</p>
                            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">문서 보기</a>
                        </Card>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Card className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <h2 className="text-3xl font-bold mb-4">지금 시작하세요</h2>
                        <p className="text-xl mb-6 opacity-90">
                            무료 계정으로 API를 테스트하고 캡차 검증을 통합해보세요.
                        </p>
                        <div className="space-x-4">
                            <a
                                href="/demo"
                                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                데모 보기
                            </a>
                            <a
                                href="/contact"
                                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                            >
                                문의하기
                            </a>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
