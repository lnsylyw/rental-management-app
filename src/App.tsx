import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { NotificationProvider } from './contexts/notification-context';
import NotificationToastContainer from './components/notification/notification-toast-container';
import LoginPage from './pages/login-page';
import RegisterPage from './pages/register-page';
import DashboardPage from './pages/dashboard-page';
import PropertyListPage from './pages/property/property-list-page';
import PropertyDetailPage from './pages/property/property-detail-page';
import PropertyFormPage from './pages/property/property-form-page';
import TenantListPage from './pages/tenant/tenant-list-page';
import TenantDetailPage from './pages/tenant/tenant-detail-page';
import TenantFormPage from './pages/tenant/tenant-form-page';
import FinancePage from './pages/finance/finance-page';
import TransactionFormPage from './pages/finance/transaction-form-page';
import MaintenancePage from './pages/maintenance/maintenance-page';
import MaintenanceDetailPage from './pages/maintenance/maintenance-detail-page';
import MaintenanceFormPage from './pages/maintenance/maintenance-form-page';
import SettingsPage from './pages/settings/settings-page';
import NotificationPage from './pages/notification/notification-page';
import ParkingPage from './pages/parking/parking-page';
import ParkingFormPage from './pages/parking/parking-form-page';
import ParkingDetailPage from './pages/parking/parking-detail-page';
import ContractPage from './pages/contract/contract-page';
import ContractDetailPage from './pages/contract/contract-detail-page';
import ContractFormPage from './pages/contract/contract-form-page';

// 带有动画的路由容器
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/property" element={<PropertyListPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/property/add" element={<PropertyFormPage />} />
        <Route path="/property/:id/edit" element={<PropertyFormPage />} />
        <Route path="/tenant" element={<TenantListPage />} />
        <Route path="/tenant/:id" element={<TenantDetailPage />} />
        <Route path="/tenant/add" element={<TenantFormPage />} />
        <Route path="/tenant/:id/edit" element={<TenantFormPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/finance/add" element={<TransactionFormPage />} />
        <Route path="/finance/:id" element={<TransactionFormPage />} />
        <Route path="/finance/:id/edit" element={<TransactionFormPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
        <Route path="/maintenance/add" element={<MaintenanceFormPage />} />
        <Route path="/maintenance/:id/edit" element={<MaintenanceFormPage />} />
        <Route path="/parking" element={<ParkingPage />} />
        <Route path="/parking/add" element={<ParkingFormPage />} />
        <Route path="/parking/:id" element={<ParkingDetailPage />} />
        <Route path="/parking/:id/edit" element={<ParkingFormPage />} />
        <Route path="/contracts" element={<ContractPage />} />
        <Route path="/contracts/add" element={<ContractFormPage />} />
        <Route path="/contracts/edit/:id" element={<ContractFormPage />} />
        <Route path="/contracts/:id" element={<ContractDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rental-app-theme">
      <NotificationProvider>
        <Router>
          <AnimatedRoutes />
          <NotificationToastContainer />
        </Router>
        <Toaster />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;