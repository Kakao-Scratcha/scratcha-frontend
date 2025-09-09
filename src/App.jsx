import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NotFound from './components/pages/NotFound';

// 메인 페이지만 즉시 로드 (LCP 최적화)
import MainPage from './components/pages/MainPage';

// 로그인 전 페이지들 - 지연 로드 (코드 스플리팅)
const Overview = lazy(() => import('./components/pages/Overview'));
const Pricing = lazy(() => import('./components/pages/Pricing'));
const Demo = lazy(() => import('./components/pages/Demo'));
const ApiDocs = lazy(() => import('./components/pages/ApiDocs'));
const Contact = lazy(() => import('./components/pages/Contact'));
const Signin = lazy(() => import('./components/pages/Signin'));
const Signup = lazy(() => import('./components/pages/Signup'));

// 대시보드 페이지들 - 지연 로드 (큰 파일들)
const DashboardOverview = lazy(() => import('./components/pages/DashboardOverview'));
const DashboardApp = lazy(() => import('./components/pages/DashboardApp'));
const DashboardUsage = lazy(() => import('./components/pages/DashboardUsage'));
const DashboardBilling = lazy(() => import('./components/pages/DashboardBilling'));
const DashboardSettings = lazy(() => import('./components/pages/DashboardSettings'));

// 결제 페이지들 - 지연 로드
const CheckoutPage = lazy(() => import('./components/tosspayments/Checkout'));
const SuccessPage = lazy(() => import('./components/tosspayments/Success'));
const FailPage = lazy(() => import('./components/tosspayments/Fail'));

// 로딩 컴포넌트
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">페이지를 불러오는 중...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path="overview" element={
              <Suspense fallback={<PageLoader />}>
                <Overview />
              </Suspense>
            } />
            <Route path="pricing" element={
              <Suspense fallback={<PageLoader />}>
                <Pricing />
              </Suspense>
            } />
            <Route path="demo" element={
              <Suspense fallback={<PageLoader />}>
                <Demo />
              </Suspense>
            } />
            <Route path="api-docs" element={
              <Suspense fallback={<PageLoader />}>
                <ApiDocs />
              </Suspense>
            } />
            <Route path="contact" element={
              <Suspense fallback={<PageLoader />}>
                <Contact />
              </Suspense>
            } />
          </Route>
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={
              <Suspense fallback={<PageLoader />}>
                <DashboardOverview />
              </Suspense>
            } />
            <Route path="app" element={
              <Suspense fallback={<PageLoader />}>
                <DashboardApp />
              </Suspense>
            } />
            <Route path="usage" element={
              <Suspense fallback={<PageLoader />}>
                <DashboardUsage />
              </Suspense>
            } />
            <Route path="billing" element={
              <Suspense fallback={<PageLoader />}>
                <DashboardBilling />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<PageLoader />}>
                <DashboardSettings />
              </Suspense>
            } />
          </Route>
          {/* 결제 관련 페이지들 - 지연 로드 */}
          <Route path="checkout" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <CheckoutPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="success" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <SuccessPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="fail" element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <FailPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="signin" element={
            <Suspense fallback={<PageLoader />}>
              <Signin />
            </Suspense>
          } />
          <Route path="signup" element={
            <Suspense fallback={<PageLoader />}>
              <Signup />
            </Suspense>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;