import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import MainPage from './components/pages/MainPage';
import Dashboard from './components/Dashboard';
import Signin from './components/pages/Signin';
import Signup from './components/pages/Signup';
import Overview from './components/pages/Overview';
import Pricing from './components/pages/Pricing';
import Demo from './components/pages/Demo';
import ApiDocs from './components/pages/ApiDocs';
import Contact from './components/pages/Contact';
import DashboardOverview from './components/pages/DashboardOverview';
import DashboardSettings from './components/pages/DashboardSettings';
import DashboardUsage from './components/pages/DashboardUsage';
import DashboardBilling from './components/pages/DashboardBilling';
import DashboardApp from './components/pages/DashboardApp';
import NotFound from './components/pages/NotFound';

import CheckoutPage from './components/tosspayments/Checkout';
import SuccessPage from './components/tosspayments/Success';
import FailPage from './components/tosspayments/Fail';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path="overview" element={<Overview />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="demo" element={<Demo />} />
            <Route path="api-docs" element={<ApiDocs />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="usage" element={<DashboardUsage />} />
            <Route path="billing" element={<DashboardBilling />} />
            <Route path="app" element={<DashboardApp />} />
          </Route>
          {/* 결제 관련 페이지들 - 독립적인 라우트 */}
          <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
          <Route path="fail" element={<ProtectedRoute><FailPage /></ProtectedRoute>} />
          <Route path="signin" element={<Signin />} />
          <Route path="signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;