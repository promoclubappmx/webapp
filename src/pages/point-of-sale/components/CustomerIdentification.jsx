import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CustomerIdentification = ({ currentCustomer, onCustomerIdentified, onClearCustomer }) => {
  const [identificationType, setIdentificationType] = useState('qr'); // 'qr', 'barcode', 'phone', 'email'
  const [searchValue, setSearchValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock customers database
  const mockCustomers = [
    {
      id: 'customer1',
      qrCode: 'QR-CUST-001',
      barcode: 'BC-001',
      phone: '+34612345678',
      email: 'maria.garcia@email.com',
      fullName: 'María García',
      loyaltyPoints: 1250,
      tier: 'gold',
      totalPurchases: 450.50,
      totalVisits: 15
    },
    {
      id: 'customer2',
      qrCode: 'QR-CUST-002',
      barcode: 'BC-002',
      phone: '+34623456789',
      email: 'juan.martinez@email.com',
      fullName: 'Juan Martínez',
      loyaltyPoints: 580,
      tier: 'silver',
      totalPurchases: 230.75,
      totalVisits: 8
    },
    {
      id: 'customer3',
      qrCode: 'QR-CUST-003',
      barcode: 'BC-003',
      phone: '+34634567890',
      email: 'ana.lopez@email.com',
      fullName: 'Ana López',
      loyaltyPoints: 2340,
      tier: 'platinum',
      totalPurchases: 890.25,
      totalVisits: 28
    }
  ];

  const handleSearch = () => {
    if (!searchValue?.trim()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      let customer = null;

      if (identificationType === 'phone') {
        customer = mockCustomers?.find(c => c?.phone === searchValue);
      } else if (identificationType === 'email') {
        customer = mockCustomers?.find(c => c?.email?.toLowerCase() === searchValue?.toLowerCase());
      } else if (identificationType === 'qr') {
        customer = mockCustomers?.find(c => c?.qrCode === searchValue);
      } else if (identificationType === 'barcode') {
        customer = mockCustomers?.find(c => c?.barcode === searchValue);
      }

      if (customer) {
        onCustomerIdentified(customer);
        setSearchValue('');
      } else {
        alert('Cliente no encontrado');
      }

      setIsLoading(false);
    }, 500);
  };

  const handleScan = () => {
    setIsScanning(true);

    // Simulate QR/Barcode scan
    setTimeout(() => {
      const mockScanResult = identificationType === 'qr' ? 'QR-CUST-001' : 'BC-001';
      setSearchValue(mockScanResult);
      setIsScanning(false);

      // Auto-search after scan
      setTimeout(() => {
        let customer = mockCustomers?.find(c =>
          identificationType === 'qr' ? c?.qrCode === mockScanResult : c?.barcode === mockScanResult
        );
        if (customer) {
          onCustomerIdentified(customer);
          setSearchValue('');
        }
      }, 300);
    }, 2000);
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'text-orange-600 bg-orange-100',
      silver: 'text-gray-600 bg-gray-100',
      gold: 'text-yellow-600 bg-yellow-100',
      platinum: 'text-purple-600 bg-purple-100'
    };
    return colors?.[tier] || 'text-gray-600 bg-gray-100';
  };

  const getTierIcon = (tier) => {
    const icons = {
      bronze: 'Medal',
      silver: 'Award',
      gold: 'Crown',
      platinum: 'Gem'
    };
    return icons?.[tier] || 'User';
  };

  if (currentCustomer) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{currentCustomer?.fullName}</h3>
              <p className="text-sm text-muted-foreground">{currentCustomer?.email}</p>
              <p className="text-sm text-muted-foreground">{currentCustomer?.phone}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCustomer}
            iconName="X"
          >
            Cambiar Cliente
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={getTierIcon(currentCustomer?.tier)} size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Nivel</span>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getTierColor(currentCustomer?.tier)}`}>
              {currentCustomer?.tier}
            </span>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Star" size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Puntos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{currentCustomer?.loyaltyPoints?.toLocaleString()}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Euro" size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Compras</span>
            </div>
            <p className="text-2xl font-bold text-foreground">€{currentCustomer?.totalPurchases?.toFixed(2)}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Visitas</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{currentCustomer?.totalVisits}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="UserSearch" size={24} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Identificación de Cliente</h2>
      </div>

      {/* Identification Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Button
          variant={identificationType === 'qr' ? 'default' : 'outline'}
          onClick={() => setIdentificationType('qr')}
          iconName="QrCode"
          className="w-full"
        >
          QR Code
        </Button>
        <Button
          variant={identificationType === 'barcode' ? 'default' : 'outline'}
          onClick={() => setIdentificationType('barcode')}
          iconName="Barcode"
          className="w-full"
        >
          Código de Barras
        </Button>
        <Button
          variant={identificationType === 'phone' ? 'default' : 'outline'}
          onClick={() => setIdentificationType('phone')}
          iconName="Phone"
          className="w-full"
        >
          Teléfono
        </Button>
        <Button
          variant={identificationType === 'email' ? 'default' : 'outline'}
          onClick={() => setIdentificationType('email')}
          iconName="Mail"
          className="w-full"
        >
          Email
        </Button>
      </div>

      {/* Scanner/Input Area */}
      {(identificationType === 'qr' || identificationType === 'barcode') && !isScanning && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder={`Ingresa el ${identificationType === 'qr' ? 'código QR' : 'código de barras'} o escanea`}
              value={searchValue}
              onChange={(e) => setSearchValue(e?.target?.value)}
              onKeyPress={(e) => e?.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleScan}
              iconName="Camera"
              variant="outline"
            >
              Escanear
            </Button>
            <Button
              onClick={handleSearch}
              iconName="Search"
              loading={isLoading}
              disabled={!searchValue?.trim()}
            >
              Buscar
            </Button>
          </div>
        </div>
      )}

      {(identificationType === 'phone' || identificationType === 'email') && (
        <div className="flex gap-3">
          <Input
            type={identificationType === 'email' ? 'email' : 'tel'}
            placeholder={identificationType === 'phone' ? 'Ingresa el número de teléfono' : 'Ingresa el email'}
            value={searchValue}
            onChange={(e) => setSearchValue(e?.target?.value)}
            onKeyPress={(e) => e?.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            iconName="Search"
            loading={isLoading}
            disabled={!searchValue?.trim()}
          >
            Buscar
          </Button>
        </div>
      )}

      {/* Scanning Animation */}
      {isScanning && (
        <div className="bg-muted/50 border border-border rounded-lg p-12 text-center">
          <Icon name="Camera" size={64} className="text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium text-foreground mb-2">Escaneando...</p>
          <p className="text-sm text-muted-foreground">Apunta la cámara al {identificationType === 'qr' ? 'código QR' : 'código de barras'}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScanning(false)}
            className="mt-4"
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Quick Access Customers */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-3">Clientes Recientes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mockCustomers?.slice(0, 3)?.map(customer => (
            <button
              key={customer?.id}
              onClick={() => onCustomerIdentified(customer)}
              className="bg-muted/50 hover:bg-muted border border-border rounded-lg p-3 text-left transition-colors"
            >
              <p className="font-medium text-foreground text-sm">{customer?.fullName}</p>
              <p className="text-xs text-muted-foreground">{customer?.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getTierColor(customer?.tier)}`}>
                  {customer?.tier}
                </span>
                <span className="text-xs text-muted-foreground">{customer?.loyaltyPoints} pts</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerIdentification;