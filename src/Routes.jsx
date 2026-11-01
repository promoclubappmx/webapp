import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import LoyaltyPointsSystem from './pages/loyalty-points-system';
import LoyaltyProgramEditPage from './pages/loyalty-points-system/LoyaltyProgramEditPage';
import CatalogoRecompensasPage from './pages/loyalty-points-system/CatalogoRecompensasPage';
import NuevaRecompensaPage from './pages/loyalty-points-system/NuevaRecompensaPage';
import DashboardOverview from './pages/dashboard-overview';
import Login from './pages/login';

import CouponsManagement from './pages/coupons-management';
import NuevoCuponPromocionPage from './pages/coupons-management/NuevoCuponPromocionPage';
import NuevoCuponRecuperacionPage from './pages/coupons-management/NuevoCuponRecuperacionPage';
import BusinessListingsManagement from './pages/business-listings-management';
import RewardsManagement from './pages/rewards-management';
import PromotionsManagement from './pages/promotions-management';
import NewPromotionPage from './pages/promotions-management/NewPromotionPage';
import EditPromotionPage from './pages/promotions-management/EditPromotionPage';
import CampaignsManagement from './pages/campaigns-management';
import NewCampaignPage from './pages/campaigns-management/NewCampaignPage';
import CampaignDashboardPage from './pages/campaign-dashboard';
import CampaignCreationPage from './pages/campaign-creation';
import AudienceBuilder from './pages/audience-builder';
import Register from './pages/register';
import Profile from './pages/profile';

import CatalogManagement from './pages/catalog-management';
import ProductForm from './pages/catalog-management/product-form';
import NotificationsPage from './pages/notifications';
import NotificationSettings from './pages/notification-settings';

import PointOfSale from './pages/point-of-sale';
import StaffManagement from './pages/staff-management';
import InventoryManagement from './pages/inventory-management';
import BusinessSettings from './pages/business-settings';

import AlertSettings from './pages/alert-settings';
import EngagementAutomation from './pages/engagement-automation';
import AutomationEffectivenessDashboard from './pages/automation-effectiveness-dashboard';
import StaffConfirmation from './pages/staff-confirmation';
import StaffOnboarding from './pages/staff-onboarding';
import FirstTimeExperience from './pages/first-time-experience';
import Billing from './pages/billing';
import PlanesFacturacion from './pages/planes-facturacion';
import SuppliersManagement from './pages/suppliers';
import SupplierProfileDetail from './pages/supplier-profile-detail';
import SupplierFullForm from './pages/suppliers/SupplierFullForm';
import PurchaseOrders from './pages/purchase-orders';
import InventoryTransfers from './pages/inventory-transfers';
import GoodsReceipt from './pages/goods-receipt';
import GoodsReceiptDetail from './pages/goods-receipt/components/GoodsReceiptDetail';
import MarketingCalendar from './pages/marketing-calendar';
import AutomationFlowsDashboard from './pages/automation-flows-dashboard';
import LifecycleFlowsBuilder from './pages/lifecycle-flows-builder';
import VisualFlowEditor from './pages/visual-flow-editor';
import IFTTTRulesManagement from './pages/ifttt-rules-management';
import FlowTestingInterface from './pages/flow-testing-interface';
import IFTTTRuleBuilder from './pages/ifttt-rule-builder';
import CRMClientsList from './pages/crm-clients-list';
import CustomerProfileDetail from './pages/customer-profile-detail';
import CRMSegmentsManagement from './pages/crm-segments-management';
import CheckInModule from './pages/check-in-module';
import CheckInConfigPage from './pages/check-in-module/CheckInConfigPage';
import EstablishmentsPortfolio from './pages/establishments-portfolio';
import CatalogSettings from './pages/catalog-settings';
import BusinessListingWizard from './pages/business-listing-wizard';

import FeaturedItemsAndUpsellManagement from './pages/featured-items-and-upsell-management';
import ReviewsManagementDashboard from './pages/reviews-management-dashboard';
import ReviewRequestsManagement from './pages/review-requests-management';
import NPSManagement from './pages/nps-management';
import SurveysManagement from './pages/surveys-management';
import SurveysBenchmark from './pages/surveys-benchmark';

import GeofencingModule from './pages/geofencing';

import AnalyticsModule from './pages/analytics-and-reports';
import KpiPorTipo from './pages/kpi-por-tipo';
import VipLevelsManagement from './pages/vip-levels-management';
import VIPLevelsWizardPage from './pages/vip-levels-management/VIPLevelsWizardPage';
import SurprisesManagement from './pages/surprises-management';
import NuevaSorpresaPage from './pages/surprises-management/NuevaSorpresaPage';
import PunchCardsManagement from './pages/punch-cards-management';
import NewPunchCardPage from './pages/punch-cards-management/NewPunchCardPage';
import VisitStreaksManagement from './pages/visit-streaks-management';
import VisitStreaksWizardPage from './pages/visit-streaks-management/VisitStreaksWizardPage';
import AchievementsManagement from './pages/achievements-management';
import AchievementsWizardPage from './pages/achievements-management/AchievementsWizardPage';
import ManualValidations from './pages/manual-validations';
import InactiveModule from './components/InactiveModule';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/analytics" element={<AnalyticsModule />} />
        <Route path="/analytics-and-reports" element={<AnalyticsModule />} />
        <Route path="/loyalty-points-system" element={<LoyaltyPointsSystem />} />
        <Route path="/loyalty-points-system/edit" element={<LoyaltyProgramEditPage />} />
        <Route path="/loyalty-points-system/catalogo" element={<CatalogoRecompensasPage />} />
        <Route path="/loyalty-points-system/catalogo/nueva-recompensa" element={<NuevaRecompensaPage />} />
        <Route path="/dashboard-overview" element={<DashboardOverview />} />
        <Route path="/login" element={<Login />} />
        <Route path="/coupons-management" element={<CouponsManagement />} />
        <Route path="/coupons-management/new-promotion" element={<NuevoCuponPromocionPage />} />
        <Route path="/coupons-management/edit-promotion/:id" element={<NuevoCuponPromocionPage />} />
        <Route path="/coupons-management/new-recovery" element={<NuevoCuponRecuperacionPage />} />
        <Route path="/business-listings-management" element={<BusinessListingsManagement />} />
        <Route path="/establishments-portfolio" element={<EstablishmentsPortfolio />} />
        <Route path="/catalog-settings" element={<CatalogSettings />} />
        <Route path="/business-listing-wizard" element={<BusinessListingWizard />} />
        <Route path="/rewards-management" element={<RewardsManagement />} />
        <Route path="/promotions-management" element={<PromotionsManagement />} />
        <Route path="/promotions-management/new" element={<NewPromotionPage />} />
        <Route path="/promotions-management/edit/:id" element={<EditPromotionPage />} />
        <Route path="/campaigns-management" element={<CampaignsManagement />} />
        <Route path="/campaigns-management/new" element={<NewCampaignPage />} />
        <Route path="/campaigns-management/edit/:id" element={<NewCampaignPage />} />
        <Route path="/campaign-dashboard" element={<CampaignDashboardPage />} />
        <Route path="/campaign-dashboard/:id" element={<CampaignDashboardPage />} />
        <Route path="/campaign-creation" element={<CampaignCreationPage />} />
        <Route path="/campaign-creation/edit/:id" element={<CampaignCreationPage />} />
        <Route path="/audience-builder" element={<AudienceBuilder />} />
        <Route path="/catalog-management" element={<CatalogManagement />} />
        <Route path="/catalog-management/product/:id" element={<ProductForm />} />
        <Route path="/suppliers" element={<SuppliersManagement />} />
        <Route path="/supplier-profile-detail/:id" element={<SupplierProfileDetail />} />
        <Route path="/supplier-full-form/new" element={<SupplierFullForm />} />
        <Route path="/supplier-full-form/:id" element={<SupplierFullForm />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/inventory-transfers" element={<InventoryTransfers />} />
        <Route path="/goods-receipt" element={<GoodsReceipt />} />
        <Route path="/goods-receipt/receive/:orderId" element={<GoodsReceiptDetail />} />
        <Route path="/marketing-calendar" element={<MarketingCalendar />} />
        <Route path="/automation-flows-dashboard" element={<AutomationFlowsDashboard />} />
        <Route path="/lifecycle-flows-builder" element={<LifecycleFlowsBuilder />} />
        <Route path="/visual-flow-editor" element={<VisualFlowEditor />} />
        <Route path="/ifttt-rules-management" element={<IFTTTRulesManagement />} />
        <Route path="/flow-testing-interface" element={<FlowTestingInterface />} />
        <Route path="/ifttt-rule-builder" element={<IFTTTRuleBuilder />} />
        <Route path="/crm-clients-list" element={<CRMClientsList />} />
        <Route path="/customer-profile-detail" element={<CustomerProfileDetail />} />
        <Route path="/customer-profile-detail/:id" element={<CustomerProfileDetail />} />
        <Route path="/crm-segments-management" element={<CRMSegmentsManagement />} />
        <Route path="/check-in-methods-configuration" element={<Navigate to="/check-in-module" replace />} />
        <Route path="/check-in-rewards-management" element={<Navigate to="/check-in-module" replace />} />
        <Route path="/check-in-module" element={<CheckInModule />} />
        <Route path="/check-in-module/config" element={<CheckInConfigPage />} />
        <Route path="/check-in-anti-abuse-control" element={<Navigate to="/check-in-module" replace />} />
        <Route path="/vip-levels-management" element={<VipLevelsManagement />} />
        <Route path="/vip-levels-management/wizard" element={<VIPLevelsWizardPage />} />
        <Route path="/surprises-management" element={<SurprisesManagement />} />
        <Route path="/surprises-management/new" element={<NuevaSorpresaPage />} />
        <Route path="/surprises-management/edit/:id" element={<NuevaSorpresaPage />} />
        <Route path="/punch-cards-management" element={<PunchCardsManagement />} />
        <Route path="/punch-cards-management/new" element={<NewPunchCardPage />} />
        <Route path="/visit-streaks-management" element={<VisitStreaksManagement />} />
        <Route path="/visit-streaks-management/wizard" element={<VisitStreaksWizardPage />} />
        <Route path="/achievements-management" element={<AchievementsManagement />} />
        <Route path="/achievements-management/wizard" element={<AchievementsWizardPage />} />
        <Route path="/manual-validations" element={<ManualValidations />} />
        <Route path="/gift-cards-management" element={<InactiveModule moduleName="Tarjetas de Regalo" />} />
        <Route path="/gift-cards-management/new" element={<InactiveModule moduleName="Tarjetas de Regalo" />} />
        <Route path="/gift-cards-management/edit/:id" element={<InactiveModule moduleName="Tarjetas de Regalo" />} />
        <Route path="/gift-cards-dashboard" element={<InactiveModule moduleName="Tarjetas de Regalo" />} />
        <Route path="/gift-cards-management/prepaid" element={<InactiveModule moduleName="Tarjetas de Regalo" />} />
        <Route path="/gift-cards-management/prepaid/promo/new" element={<InactiveModule moduleName="Tarjetas de Regalo" />} />
        <Route path="/gift-cards-management/prepaid/promo/edit/:id" element={<InactiveModule moduleName="Tarjetas de Regalo" />} />
        <Route path="/point-of-sale" element={<PointOfSale />} />
        <Route path="/staff-management" element={<StaffManagement />} />
        <Route path="/staff-confirmation" element={<StaffConfirmation />} />
        <Route path="/staff-onboarding" element={<StaffOnboarding />} />
        <Route path="/first-time-experience" element={<FirstTimeExperience />} />
        <Route path="/inventory-management" element={<InventoryManagement />} />
        <Route path="/business-settings" element={<BusinessSettings />} />
        <Route path="/reservations-management" element={<InactiveModule moduleName="Reservaciones" />} />
        <Route path="/order-ahead-management" element={<InactiveModule moduleName="Order Ahead" />} />
        <Route path="/featured-items-and-upsell-management" element={<FeaturedItemsAndUpsellManagement />} />
        <Route path="/reviews-management-dashboard" element={<ReviewsManagementDashboard />} />
        <Route path="/reviews-management" element={<ReviewsManagementDashboard />} />
        <Route path="/review-requests-management" element={<ReviewRequestsManagement />} />
        <Route path="/nps-management" element={<NPSManagement />} />
        <Route path="/surveys-management" element={<SurveysManagement />} />
        <Route path="/surveys-benchmark" element={<SurveysBenchmark />} />
        <Route path="/geofence-config" element={<Navigate to="/geofencing" replace />} />
        <Route path="/geofence-notifications" element={<Navigate to="/geofencing" replace />} />
        <Route path="/geofence-activity" element={<Navigate to="/geofencing" replace />} />
        <Route path="/geofence-builder" element={<Navigate to="/geofencing" replace />} />
        <Route path="/geofence-simulator" element={<Navigate to="/geofencing" replace />} />
        <Route path="/geofencing" element={<GeofencingModule />} />
        <Route path="/membership-configuration" element={<InactiveModule moduleName="Membresías" />} />
        <Route path="/membership-subscribers" element={<InactiveModule moduleName="Membresías" />} />
        <Route path="/membership-config" element={<InactiveModule moduleName="Membresías" />} />
        <Route path="/membership-validate" element={<InactiveModule moduleName="Membresías" />} />
        <Route path="/membership-validation" element={<InactiveModule moduleName="Membresías" />} />
        <Route path="/kpi-por-tipo" element={<KpiPorTipo />} />
        <Route path="/alert-settings" element={<AlertSettings />} />
        <Route path="/engagement-automation" element={<EngagementAutomation />} />
        <Route path="/automation-effectiveness-dashboard" element={<AutomationEffectivenessDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Navigate to="/business-settings" replace />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notification" element={<NotificationsPage />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/planes-facturacion" element={<PlanesFacturacion />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
export default Routes;