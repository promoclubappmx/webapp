import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import InactiveModule from './components/InactiveModule';

const LoyaltyPointsSystem = lazy(() => import('./pages/loyalty-points-system'));
const LoyaltyProgramEditPage = lazy(() => import('./pages/loyalty-points-system/LoyaltyProgramEditPage'));
const CatalogoRecompensasPage = lazy(() => import('./pages/loyalty-points-system/CatalogoRecompensasPage'));
const NuevaRecompensaPage = lazy(() => import('./pages/loyalty-points-system/NuevaRecompensaPage'));
const DashboardOverview = lazy(() => import('./pages/dashboard-overview'));
const Login = lazy(() => import('./pages/login'));

const CouponsManagement = lazy(() => import('./pages/coupons-management'));
const NuevoCuponPromocionPage = lazy(() => import('./pages/coupons-management/NuevoCuponPromocionPage'));
const NuevoCuponRecuperacionPage = lazy(() => import('./pages/coupons-management/NuevoCuponRecuperacionPage'));
const BusinessListingsManagement = lazy(() => import('./pages/business-listings-management'));
const RewardsManagement = lazy(() => import('./pages/rewards-management'));
const PromotionsManagement = lazy(() => import('./pages/promotions-management'));
const NewPromotionPage = lazy(() => import('./pages/promotions-management/NewPromotionPage'));
const EditPromotionPage = lazy(() => import('./pages/promotions-management/EditPromotionPage'));
const CampaignsManagement = lazy(() => import('./pages/campaigns-management'));
const NewCampaignPage = lazy(() => import('./pages/campaigns-management/NewCampaignPage'));
const CampaignDashboardPage = lazy(() => import('./pages/campaign-dashboard'));
const CampaignCreationPage = lazy(() => import('./pages/campaign-creation'));
const AudienceBuilder = lazy(() => import('./pages/audience-builder'));
const Register = lazy(() => import('./pages/register'));
const Profile = lazy(() => import('./pages/profile'));

const CatalogManagement = lazy(() => import('./pages/catalog-management'));
const ProductForm = lazy(() => import('./pages/catalog-management/product-form'));
const NotificationsPage = lazy(() => import('./pages/notifications'));
const NotificationSettings = lazy(() => import('./pages/notification-settings'));

const PointOfSale = lazy(() => import('./pages/point-of-sale'));
const StaffManagement = lazy(() => import('./pages/staff-management'));
const InventoryManagement = lazy(() => import('./pages/inventory-management'));
const BusinessSettings = lazy(() => import('./pages/business-settings'));

const AlertSettings = lazy(() => import('./pages/alert-settings'));
const EngagementAutomation = lazy(() => import('./pages/engagement-automation'));
const AutomationEffectivenessDashboard = lazy(() => import('./pages/automation-effectiveness-dashboard'));
const StaffConfirmation = lazy(() => import('./pages/staff-confirmation'));
const StaffOnboarding = lazy(() => import('./pages/staff-onboarding'));
const FirstTimeExperience = lazy(() => import('./pages/first-time-experience'));
const Billing = lazy(() => import('./pages/billing'));
const PlanesFacturacion = lazy(() => import('./pages/planes-facturacion'));
const SuppliersManagement = lazy(() => import('./pages/suppliers'));
const SupplierProfileDetail = lazy(() => import('./pages/supplier-profile-detail'));
const SupplierFullForm = lazy(() => import('./pages/suppliers/SupplierFullForm'));
const PurchaseOrders = lazy(() => import('./pages/purchase-orders'));
const InventoryTransfers = lazy(() => import('./pages/inventory-transfers'));
const GoodsReceipt = lazy(() => import('./pages/goods-receipt'));
const GoodsReceiptDetail = lazy(() => import('./pages/goods-receipt/components/GoodsReceiptDetail'));
const MarketingCalendar = lazy(() => import('./pages/marketing-calendar'));
const AutomationFlowsDashboard = lazy(() => import('./pages/automation-flows-dashboard'));
const LifecycleFlowsBuilder = lazy(() => import('./pages/lifecycle-flows-builder'));
const VisualFlowEditor = lazy(() => import('./pages/visual-flow-editor'));
const IFTTTRulesManagement = lazy(() => import('./pages/ifttt-rules-management'));
const FlowTestingInterface = lazy(() => import('./pages/flow-testing-interface'));
const IFTTTRuleBuilder = lazy(() => import('./pages/ifttt-rule-builder'));
const CRMClientsList = lazy(() => import('./pages/crm-clients-list'));
const CustomerProfileDetail = lazy(() => import('./pages/customer-profile-detail'));
const CRMSegmentsManagement = lazy(() => import('./pages/crm-segments-management'));
const CheckInModule = lazy(() => import('./pages/check-in-module'));
const CheckInConfigPage = lazy(() => import('./pages/check-in-module/CheckInConfigPage'));
const EstablishmentsPortfolio = lazy(() => import('./pages/establishments-portfolio'));
const CatalogSettings = lazy(() => import('./pages/catalog-settings'));
const BusinessListingWizard = lazy(() => import('./pages/business-listing-wizard'));

const FeaturedItemsAndUpsellManagement = lazy(() => import('./pages/featured-items-and-upsell-management'));
const ReviewsManagementDashboard = lazy(() => import('./pages/reviews-management-dashboard'));
const ReviewRequestsManagement = lazy(() => import('./pages/review-requests-management'));
const NPSManagement = lazy(() => import('./pages/nps-management'));
const SurveysManagement = lazy(() => import('./pages/surveys-management'));
const SurveysBenchmark = lazy(() => import('./pages/surveys-benchmark'));

const GeofencingModule = lazy(() => import('./pages/geofencing'));

const AnalyticsModule = lazy(() => import('./pages/analytics-and-reports'));
const KpiPorTipo = lazy(() => import('./pages/kpi-por-tipo'));
const VipLevelsManagement = lazy(() => import('./pages/vip-levels-management'));
const VIPLevelsWizardPage = lazy(() => import('./pages/vip-levels-management/VIPLevelsWizardPage'));
const SurprisesManagement = lazy(() => import('./pages/surprises-management'));
const NuevaSorpresaPage = lazy(() => import('./pages/surprises-management/NuevaSorpresaPage'));
const PunchCardsManagement = lazy(() => import('./pages/punch-cards-management'));
const NewPunchCardPage = lazy(() => import('./pages/punch-cards-management/NewPunchCardPage'));
const VisitStreaksManagement = lazy(() => import('./pages/visit-streaks-management'));
const VisitStreaksWizardPage = lazy(() => import('./pages/visit-streaks-management/VisitStreaksWizardPage'));
const AchievementsManagement = lazy(() => import('./pages/achievements-management'));
const AchievementsWizardPage = lazy(() => import('./pages/achievements-management/AchievementsWizardPage'));
const ManualValidations = lazy(() => import('./pages/manual-validations'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
  </div>
);

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
export default Routes;