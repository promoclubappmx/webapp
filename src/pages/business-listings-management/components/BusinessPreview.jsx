import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const BusinessPreview = ({ formData, isDarkMode, setIsDarkMode, isMobileView, setIsMobileView }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = formData?.images || [];
  const videos = formData?.videos || [];
  const operatingHours = formData?.operatingHours || {};

  const getCurrentStatus = () => {
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']?.[now?.getDay()];
    const currentTime = `${now?.getHours()?.toString()?.padStart(2, '0')}:${now?.getMinutes()?.toString()?.padStart(2, '0')}`;
    
    const todayHours = operatingHours?.[currentDay];
    if (!todayHours || !todayHours?.isOpen) return { isOpen: false, text: 'Cerrado' };
    if (todayHours?.is24Hours) return { isOpen: true, text: 'Abierto 24h' };
    
    const isCurrentlyOpen = currentTime >= todayHours?.openTime && currentTime <= todayHours?.closeTime;
    return {
      isOpen: isCurrentlyOpen,
      text: isCurrentlyOpen ? `Abierto hasta ${todayHours?.closeTime}` : `Cerrado - Abre a las ${todayHours?.openTime}`
    };
  };

  const status = getCurrentStatus();

  const formatOperatingHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    return days?.map((day, index) => {
      const hours = operatingHours?.[day];
      return {
        day: dayNames?.[index],
        hours: hours?.isOpen 
          ? hours?.is24Hours 
            ? '24h' 
            : `${hours?.openTime} - ${hours?.closeTime}`
          : 'Cerrado'
      };
    });
  };

  const previewClasses = `
    ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
    ${isMobileView ? 'max-w-sm' : 'max-w-4xl'}
    transition-all duration-300 rounded-lg border shadow-lg overflow-hidden
  `;

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <h3 className="text-lg font-semibold text-foreground">Vista Previa</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={isMobileView ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsMobileView(true)}
            iconName="Smartphone"
          />
          <Button
            variant={!isMobileView ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsMobileView(false)}
            iconName="Monitor"
          />
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant={isDarkMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            iconName={isDarkMode ? 'Sun' : 'Moon'}
          />
        </div>
      </div>
      {/* Preview Content */}
      <div className="flex justify-center">
        <div className={previewClasses}>
          {/* Header Image */}
          {images?.length > 0 && (
            <div className="relative h-48 md:h-64 overflow-hidden">
              <Image
                src={images?.[activeImageIndex]?.url || images?.[0]?.url}
                alt={formData?.businessName || 'Business'}
                className="w-full h-full object-cover"
              />
              
              {images?.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(prev => prev > 0 ? prev - 1 : images?.length - 1)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(prev => prev < images?.length - 1 ? prev + 1 : 0)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <Icon name="ChevronRight" size={16} />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images?.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-6">
            {/* Business Info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {formData?.businessName || 'Nombre del Negocio'}
              </h1>
              
              <div className="flex items-center space-x-4 text-sm mb-3">
                <span className={`flex items-center ${status?.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  <Icon name="Clock" size={16} className="mr-1" />
                  {status?.text}
                </span>
                
                {formData?.category && (
                  <span className="text-gray-500">
                    {formData?.category}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4">
                {formData?.description || 'Descripción del negocio aparecerá aquí...'}
              </p>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {formData?.phone && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Phone" size={16} />
                    <span>{formData?.phone}</span>
                  </div>
                )}
                
                {formData?.email && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={16} />
                    <span>{formData?.email}</span>
                  </div>
                )}
                
                {formData?.website && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Globe" size={16} />
                    <span className="text-blue-600">{formData?.website}</span>
                  </div>
                )}
                
                {formData?.address && (
                  <div className="flex items-center space-x-2">
                    <Icon name="MapPin" size={16} />
                    <span>{formData?.address}, {formData?.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            {Object.keys(operatingHours)?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Icon name="Clock" size={20} className="mr-2" />
                  Horarios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formatOperatingHours()?.map((day, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="font-medium">{day?.day}</span>
                      <span className={day?.hours === 'Cerrado' ? 'text-red-600' : ''}>{day?.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {formData?.amenities && formData?.amenities?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Icon name="Star" size={20} className="mr-2" />
                  Servicios
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData?.amenities?.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Icon name="Video" size={20} className="mr-2" />
                  Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos?.slice(0, 2)?.map((video) => (
                    <div key={video?.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={video?.thumbnail}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {formData?.latitude && formData?.longitude && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Icon name="MapPin" size={20} className="mr-2" />
                  Ubicación
                </h3>
                <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    title="Business Location"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${formData?.latitude},${formData?.longitude}&z=16&output=embed`}
                  />
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors">
                <Icon name="MessageCircle" size={20} />
                <span>WhatsApp</span>
              </button>
              
              <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors">
                <Icon name="Phone" size={20} />
                <span>Llamar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPreview;