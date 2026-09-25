import { createHashRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/common/AppShell';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';

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

// Products
import { ProductListPage } from '@/modules/products/pages/ProductListPage';
import { ProductDetailPage } from '@/modules/products/pages/ProductDetailPage';
import { AddProductPage } from '@/modules/products/pages/AddProductPage';
import { EditProductPage } from '@/modules/products/pages/EditProductPage';

// Visits
import { QuickEntryPage } from '@/modules/visits/pages/QuickEntryPage';
import { EditVisitPage } from '@/modules/visits/pages/EditVisitPage';
import { VisitListPage } from '@/modules/visits/pages/VisitListPage';
import { VisitDetailPage } from '@/modules/visits/pages/VisitDetailPage';

// Orders
import { OrderListPage } from '@/modules/orders/pages/OrderListPage';
import { OrderDetailPage } from '@/modules/orders/pages/OrderDetailPage';
import { AddOrderPage } from '@/modules/orders/pages/AddOrderPage';
import { EditOrderPage } from '@/modules/orders/pages/EditOrderPage';

// Other Modules
import { ReportsPage } from '@/modules/reports/pages/ReportsPage';
import { SettingsPage } from '@/modules/settings/pages/SettingsPage';

// New Modules
import { CompoundListPage } from '@/modules/compounds/pages/CompoundListPage';
import { CompoundDetailPage } from '@/modules/compounds/pages/CompoundDetailPage';
import { AddCompoundPage } from '@/modules/compounds/pages/AddCompoundPage';
import { EditCompoundPage } from '@/modules/compounds/pages/EditCompoundPage';
import { PlanningPage } from '@/modules/planning/pages/PlanningPage';
import { PlanBuilderPage } from '@/modules/planning/pages/PlanBuilderPage';
import { PointCenterListPage } from '@/modules/pointCenters/pages/PointCenterListPage';
import { PointCenterFormPage } from '@/modules/pointCenters/pages/PointCenterFormPage';

// Zones
import { ZoneListPage } from '@/modules/zones/pages/ZoneListPage';
import { ZoneDetailPage } from '@/modules/zones/pages/ZoneDetailPage';
import { AddZonePage } from '@/modules/zones/pages/AddZonePage';
import { EditZonePage } from '@/modules/zones/pages/EditZonePage';

// Legacy Clinics
import { ClinicListPage } from '@/modules/clinics/pages/ClinicListPage';
import { ClinicDetailPage } from '@/modules/clinics/pages/ClinicDetailPage';
import { AddClinicPage } from '@/modules/clinics/pages/AddClinicPage';
import { EditClinicPage } from '@/modules/clinics/pages/EditClinicPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      
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
      
      // Products
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/new', element: <AddProductPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'products/:id/edit', element: <EditProductPage /> },
      
      // Visits & Quick Entry
      { path: 'quick-entry', element: <QuickEntryPage /> },
      { path: 'visits', element: <VisitListPage /> },
      { path: 'visits/:id', element: <VisitDetailPage /> },
      { path: 'visits/:id/edit', element: <EditVisitPage /> },
      
      // Orders
      { path: 'orders', element: <OrderListPage /> },
      { path: 'orders/new', element: <AddOrderPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'orders/:id/edit', element: <EditOrderPage /> },
      
      // Compounds (NEW)
      { path: 'compounds', element: <CompoundListPage /> },
      { path: 'compounds/new', element: <AddCompoundPage /> },
      { path: 'compounds/:id', element: <CompoundDetailPage /> },
      { path: 'compounds/:id/edit', element: <EditCompoundPage /> },

      // Point Centers (NEW)
      { path: 'point-centers', element: <PointCenterListPage /> },
      { path: 'point-centers/new', element: <PointCenterFormPage /> },
      { path: 'point-centers/:id/edit', element: <PointCenterFormPage /> },
      
      // Planning (NEW)
      { path: 'planning', element: <PlanningPage /> },
      { path: 'planning/build', element: <PlanBuilderPage /> },

      // Zones (NEW)
      { path: 'zones', element: <ZoneListPage /> },
      { path: 'zones/new', element: <AddZonePage /> },
      { path: 'zones/:id', element: <ZoneDetailPage /> },
      { path: 'zones/:id/edit', element: <EditZonePage /> },

      // Legacy Clinics
      { path: 'clinics', element: <ClinicListPage /> },
      { path: 'clinics/new', element: <AddClinicPage /> },
      { path: 'clinics/:id', element: <ClinicDetailPage /> },
      { path: 'clinics/:id/edit', element: <EditClinicPage /> },
      
      // Other
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      
      // Catch-all
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
