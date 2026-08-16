import React, { createContext, useContext, useEffect, useState } from 'react';

export interface TenantBrand {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface TenantContextProps {
  brand: TenantBrand | null;
  loading: boolean;
  setBrand: (brand: TenantBrand) => void;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<TenantBrand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const stored = localStorage.getItem('tenant_brand');
        if (stored) {
          setBrand(JSON.parse(stored));
        } else {
          setBrand({ name: 'LMS Platform' });
        }
      } catch (err) {
        console.error('Failed to load tenant', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, []);

  useEffect(() => {
    if (brand) {
      if (brand.primaryColor) {
        // Need to set primary color variable. In shadcn usually we need HSL.
        // But the prompt says dynamically inject --primary and --secondary.
        document.documentElement.style.setProperty('--primary', brand.primaryColor);
      }
      if (brand.secondaryColor) {
        document.documentElement.style.setProperty('--secondary', brand.secondaryColor);
      }
      if (brand.name) {
        document.title = brand.name;
      }
    }
  }, [brand]);

  return (
    <TenantContext.Provider value={{ brand, loading, setBrand }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
