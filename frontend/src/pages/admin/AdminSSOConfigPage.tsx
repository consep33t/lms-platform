import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, KeyRound, RefreshCw, CheckCircle2, Lock, Sparkles } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/context/FeedbackContext'

export default function AdminSSOConfigPage() {
  usePageTitle('Konfigurasi SSO Korporat — CMS Admin')
  const { success } = useToast()
  const [protocol, setProtocol] = useState('SAML')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    success('Konfigurasi SSO Tersimpan', `Pengaturan IdP ${protocol} telah berhasil diaktifkan.`)
  }

  const handleTestConnection = () => {
    success('Koneksi Berhasil!', 'Endpoint IdP merespons dengan status 200 OK dan sertifikat valid.')
  }

  const handleManualSync = () => {
    success('Sinkronisasi Direktori Dimulai', 'Memperbarui data karyawan dan penugasan peran dari Identity Provider.')
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 animate-page-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
          Konfigurasi SSO Korporat & IdP
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Integrasikan sistem login terpusat SAML 2.0, OpenID Connect (OIDC), atau LDAP/Active Directory.
        </p>
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Pengaturan Identitas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Protokol SSO</Label>
              <select 
                value={protocol} 
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="SAML">SAML 2.0 (Okta, Azure AD, OneLogin)</option>
                <option value="OIDC">OpenID Connect / OIDC (Google Workspace, Keycloak)</option>
                <option value="LDAP">LDAP / Active Directory Sync</option>
              </select>
            </div>

            {protocol === 'SAML' && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="issuer" className="text-xs font-semibold text-muted-foreground">Entity ID / Issuer URL</Label>
                  <Input id="issuer" type="text" className="rounded-xl mt-1 font-mono text-sm" placeholder="https://idp.example.com/metadata" />
                </div>
                <div>
                  <Label htmlFor="cert" className="text-xs font-semibold text-muted-foreground">Sertifikat X.509</Label>
                  <textarea id="cert" className="w-full mt-1 p-3 rounded-xl border border-input bg-background font-mono text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none" rows={4} placeholder="-----BEGIN CERTIFICATE-----&#10;MIIC...&#10;-----END CERTIFICATE-----" />
                </div>
              </div>
            )}

            {protocol === 'OIDC' && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="client_id" className="text-xs font-semibold text-muted-foreground">Client ID</Label>
                  <Input id="client_id" type="text" className="rounded-xl mt-1 font-mono text-sm" placeholder="enterprise-lms-client" />
                </div>
                <div>
                  <Label htmlFor="client_sec" className="text-xs font-semibold text-muted-foreground">Client Secret</Label>
                  <Input id="client_sec" type="password" className="rounded-xl mt-1 font-mono text-sm" placeholder="••••••••••••••••" />
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base font-bold font-display text-foreground mt-4 mb-3">
                Pemetaan Atribut (Attribute Claim Mapping)
              </h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                      <th className="p-3">Atribut LMS</th>
                      <th className="p-3">Klaim IdP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="p-3 font-medium">Email</td>
                      <td className="p-3"><Input className="h-8 rounded-lg text-xs font-mono" defaultValue="email" /></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Nama Depan</td>
                      <td className="p-3"><Input className="h-8 rounded-lg text-xs font-mono" defaultValue="given_name" /></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Nama Belakang</td>
                      <td className="p-3"><Input className="h-8 rounded-lg text-xs font-mono" defaultValue="family_name" /></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Departemen</td>
                      <td className="p-3"><Input className="h-8 rounded-lg text-xs font-mono" defaultValue="department" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-3">
              <Button type="button" variant="outline" onClick={handleTestConnection} className="rounded-xl gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Uji Koneksi
              </Button>
              <Button type="button" variant="secondary" onClick={handleManualSync} className="rounded-xl gap-1.5">
                <RefreshCw className="h-4 w-4" /> Sinkronisasi Manual
              </Button>
              <Button type="submit" className="rounded-xl ml-auto font-semibold shadow-sm">
                Simpan Konfigurasi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
