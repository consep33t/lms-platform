import React, { useState, useEffect } from 'react';
import { useTenant, TenantBrand } from '@/context/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/context/FeedbackContext';

export default function TenantManagementPage() {
  usePageTitle('Manajemen Multi-Tenancy & Branding — CMS Admin');
  const { success } = useToast();
  const { brand, setBrand } = useTenant();
  const [formData, setFormData] = useState<TenantBrand>({
    name: 'LMS Platform',
    primaryColor: '',
    secondaryColor: '',
    logoUrl: ''
  });

  useEffect(() => {
    if (brand) {
      setFormData(brand);
    }
  }, [brand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setBrand(formData);
    localStorage.setItem('tenant_brand', JSON.stringify(formData));
    success('Branding Tenant Berhasil Diperbarui!', 'Pengaturan warna, logo, dan identitas tenant telah disimpan.');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Tenant Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
            />
          </div>
          
          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl || ''}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="primaryColor">Primary Color (CSS value)</Label>
            <Input
              id="primaryColor"
              name="primaryColor"
              value={formData.primaryColor || ''}
              onChange={handleChange}
              placeholder="e.g. 222.2 47.4% 11.2% (for HSL) or #ff0000"
            />
          </div>

          <div>
            <Label htmlFor="secondaryColor">Secondary Color (CSS value)</Label>
            <Input
              id="secondaryColor"
              name="secondaryColor"
              value={formData.secondaryColor || ''}
              onChange={handleChange}
              placeholder="e.g. 210 40% 96.1% or #00ff00"
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </div>

        {/* Live Preview */}
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
          <div className="p-4 border rounded" style={{
            '--primary': formData.primaryColor,
            '--secondary': formData.secondaryColor
          } as React.CSSProperties}>
            <div className="flex items-center gap-4 mb-4">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
              ) : (
                <div className="h-10 w-10 bg-primary/20 rounded flex items-center justify-center font-bold text-primary">
                  {formData.name.charAt(0)}
                </div>
              )}
              <h3 className="text-lg font-bold text-primary">{formData.name}</h3>
            </div>
            
            <div className="space-y-2">
              <Button style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                Primary Button
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
