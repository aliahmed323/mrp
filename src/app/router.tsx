import { createHashRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/common/AppShell';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { ProductListPage } from '@/modules/products/pages/ProductListPage';
import { ProductDetailPage } from '@/modules/products/pages/ProductDetailPage';
import { AddProductPage } from '@/modules/products/pages/AddProductPage';
import { EditProductPage } from '@/modules/products/pages/EditProductPage';

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

      // Catch-all → redirect to Dashboard
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

