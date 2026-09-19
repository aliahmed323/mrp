import { createHashRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/common/AppShell';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';

// Products
import { ProductListPage } from '@/modules/products/pages/ProductListPage';
import { ProductDetailPage } from '@/modules/products/pages/ProductDetailPage';
import { AddProductPage } from '@/modules/products/pages/AddProductPage';
import { EditProductPage } from '@/modules/products/pages/EditProductPage';

// Doctors
import { DoctorListPage } from '@/modules/doctors/pages/DoctorListPage';
import { DoctorDetailPage } from '@/modules/doctors/pages/DoctorDetailPage';
import { AddDoctorPage } from '@/modules/doctors/pages/AddDoctorPage';
import { EditDoctorPage } from '@/modules/doctors/pages/EditDoctorPage';

// Pharmacies
import { PharmacyListPage } from '@/modules/pharmacies/pages/PharmacyListPage';
import { PharmacyDetailPage } from '@/modules/pharmacies/pages/PharmacyDetailPage';
import { AddPharmacyPage } from '@/modules/pharmacies/pages/AddPharmacyPage';
import { EditPharmacyPage } from '@/modules/pharmacies/pages/EditPharmacyPage';

// Clinics
import { ClinicListPage } from '@/modules/clinics/pages/ClinicListPage';
import { ClinicDetailPage } from '@/modules/clinics/pages/ClinicDetailPage';
import { AddClinicPage } from '@/modules/clinics/pages/AddClinicPage';
import { EditClinicPage } from '@/modules/clinics/pages/EditClinicPage';

// Visits (Quick Entry)
import { QuickEntryPage } from '@/modules/visits/pages/QuickEntryPage';
import { VisitListPage } from '@/modules/visits/pages/VisitListPage';
import { VisitDetailPage } from '@/modules/visits/pages/VisitDetailPage';

// Orders
import { OrderListPage } from '@/modules/orders/pages/OrderListPage';
import { OrderDetailPage } from '@/modules/orders/pages/OrderDetailPage';
import { AddOrderPage } from '@/modules/orders/pages/AddOrderPage';
import { EditOrderPage } from '@/modules/orders/pages/EditOrderPage';

// Reports
import { ReportsPage } from '@/modules/reports/pages/ReportsPage';

// ============================================================
// Application Router
// Uses HashRouter for 100% compatibility with GitHub Pages static hosting
// ============================================================

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      // Dashboard
      { index: true, element: <DashboardPage /> },

      // Products
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/new', element: <AddProductPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'products/:id/edit', element: <EditProductPage /> },

      // Doctors
      { path: 'doctors', element: <DoctorListPage /> },
      { path: 'doctors/new', element: <AddDoctorPage /> },
      { path: 'doctors/:id', element: <DoctorDetailPage /> },
      { path: 'doctors/:id/edit', element: <EditDoctorPage /> },

      // Pharmacies
      { path: 'pharmacies', element: <PharmacyListPage /> },
      { path: 'pharmacies/new', element: <AddPharmacyPage /> },
      { path: 'pharmacies/:id', element: <PharmacyDetailPage /> },
      { path: 'pharmacies/:id/edit', element: <EditPharmacyPage /> },

      // Clinics
      { path: 'clinics', element: <ClinicListPage /> },
      { path: 'clinics/new', element: <AddClinicPage /> },
      { path: 'clinics/:id', element: <ClinicDetailPage /> },
      { path: 'clinics/:id/edit', element: <EditClinicPage /> },

      // Visits & Quick Entry
      { path: 'quick-entry', element: <QuickEntryPage /> },
      { path: 'visits', element: <VisitListPage /> },
      { path: 'visits/:id', element: <VisitDetailPage /> },

      // Orders
      { path: 'orders', element: <OrderListPage /> },
      { path: 'orders/new', element: <AddOrderPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'orders/:id/edit', element: <EditOrderPage /> },

      // Reports
      { path: 'reports', element: <ReportsPage /> },

      // Catch-all → redirect to Dashboard
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
