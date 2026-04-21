import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./src/layout/Layout";
import { DashboardPage } from "./src/page/DashboardPage";
import { IngredientsPage } from "./src/page/IngredientsPage";
import { StockHistoryPage } from "./src/page/StockHistoryPage";
import { WasteManagementPage } from "./src/page/WasteManagementPage";
import { ProductWizardPage } from "./src/page/ProductWizardPage";
import { ProductList } from "./src/page/ProductList";
import { ProductDetailsPage } from "./src/page/ProductDetailsPage";
import { SalesPage } from "./src/page/SalesPage";
import { SalesHistoryPage } from "./src/page/SalesHistoryPage";
import { KitchenDisplayPage } from "./src/page/KitchenDisplayPage";
import { SettingsPage } from "./src/page/SettingsPage";
import { LoginPage } from "./src/page/LoginPage";
import { RegisterPage } from "./src/page/RegisterPage";
import { ReportsPage } from "./src/page/ReportsPage";
import { AuditLogsPage } from "./src/page/AuditLogsPage";
import { SectorAnalyticsPage } from "./src/page/SectorAnalyticsPage";
import { SectorManagementPage } from "./src/page/SectorManagementPage";
import { BarcodeGeneratorPage } from "./src/page/BarcodeGeneratorPage";
import { authService } from "./src/services/authService";

// Fix: Converted ProtectedRoute to React.FC and made children optional to satisfy potential missing property checks in the routing tree.
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!authService.isLicenseValid()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center font-['Noto_Sans']">
        <div className="bg-white rounded-[40px] p-12 max-w-md shadow-2xl">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Assinatura Expirada
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            Sua licença do PluxSales expirou. Regularize seu pagamento para
            continuar acessando sua inteligência de vendas.
          </p>
          <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">
            Regularizar Agora
          </button>
          <button
            onClick={() => authService.logout()}
            className="mt-4 text-slate-400 font-bold text-xs uppercase"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="sales-history" element={<SalesHistoryPage />} />
          <Route path="kitchen" element={<KitchenDisplayPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="ingredients" element={<IngredientsPage />} />
          <Route path="ingredients/history" element={<StockHistoryPage />} />
          <Route path="inventory/waste" element={<WasteManagementPage />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="products/edit/:id" element={<ProductWizardPage />} />
          <Route path="products/new" element={<ProductWizardPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="sectors" element={<SectorAnalyticsPage />} />
          <Route path="sectors/manage" element={<SectorManagementPage />} />
          <Route path="labels" element={<BarcodeGeneratorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
