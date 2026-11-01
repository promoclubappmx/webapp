import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NewPromotionPage from './NewPromotionPage';

// Mock data to simulate loading a promotion by ID
const MOCK_PROMOTIONS = [
  {
    id: '1',
    title: 'Descuento de Verano 2024',
    description: 'Disfruta de un 25% de descuento en todos nuestros platos principales.',
    promoType: 'standard',
    discountType: 'percentage',
    discountValue: 25,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    status: 'active',
    targetAudience: 'all',
    visibility: 'public',
    catalogItemIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
  },
  {
    id: 'adv-1',
    title: 'Flash Deal Tarde — 40% OFF',
    description: 'Promoción ultra-corta para llenar horas muertas de la tarde',
    promoType: 'flash_deal',
    discountType: 'percentage',
    discountValue: 40,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'active',
    targetAudience: 'all',
    visibility: 'push_only',
    flashDuration: 45,
    pushRadius: 2,
    catalogItemIds: []
  }
];

const EditPromotionPage = () => {
  const { id } = useParams();
  const [promotionData, setPromotionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching promotion data
    const found = MOCK_PROMOTIONS?.find(p => String(p?.id) === String(id));
    setPromotionData(found || { id });
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Cargando promoción...</p>
        </div>
      </div>
    );
  }

  return <NewPromotionPage initialData={promotionData} isEdit={true} />;
};

export default EditPromotionPage;
