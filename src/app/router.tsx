import { createHashRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/common/AppShell';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { ProductListPage } from '@/modules/products/pages/ProductListPage';
import { ProductDetailPage } from '@/modules/products/pages/ProductDetailPage';
import { AddProductPage } from '@/modules/products/pages/AddProductPage';
import { EditProductPage } from '@/modules/products/pages/EditProductPage';
import { DoctorListPage } from '@/modules/doctors/pages/DoctorListPage';
import { DoctorDetailPage } from '@/modules/doctors/pages/DoctorDetailPage';
import { AddDoctorPage } from '@/modules/doctors/pages/AddDoctorPage';
import { EditDoctorPage } from '@/modules/doctors/pages/EditDoctorPage';

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

      // Products Module
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/new', element: <AddProductPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'products/:id/edit', element: <EditProductPage /> },

      // Doctors / Clinics / Pharmacies Module
      { path: 'doctors', element: <DoctorListPage /> },
      { path: 'doctors/new', element: <AddDoctorPage /> },
      { path: 'doctors/:id', element: <DoctorDetailPage /> },
      { path: 'doctors/:id/edit', element: <EditDoctorPage /> },

      // Catch-all → redirect to Dashboard
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

