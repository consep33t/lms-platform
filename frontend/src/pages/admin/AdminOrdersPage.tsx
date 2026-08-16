import React, { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, ShoppingCart, Tag, Plus, CheckCircle2, Clock, XCircle, X } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/context/FeedbackContext'

const mockOrders = [
  { id: 'ORD-001', user: 'Alice Maharani', moduleName: 'Arsitektur Jaringan Enterprise & Microservices', amount: 450000, status: 'Paid' },
  { id: 'ORD-002', user: 'Bob Pratama', moduleName: 'Fullstack React TypeScript Modern', amount: 300000, status: 'Pending' },
  { id: 'ORD-003', user: 'Citra Dewi', moduleName: 'DevOps & Kubernetes Orchestration', amount: 500000, status: 'Paid' },
]

export default function AdminOrdersPage() {
  usePageTitle('Manajemen Transaksi & Pendapatan — CMS Admin')
  const { success } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode) return
    success('Kupon Berhasil Dibuat!', `Kode kupon ${couponCode.toUpperCase()} telah aktif.`)
    setIsModalOpen(false)
    setCouponCode('')
    setDiscountAmount('')
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-page-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground">
            Transaksi & Pendapatan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau arus kas penjualan modul, verifikasi transaksi, dan kelola kupon diskon.
          </p>
        </div>
        <Button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 rounded-xl shadow-sm active-press"
        >
          <Plus className="h-4 w-4" /> Buat Kupon Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-6 rounded-2xl border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Pendapatan</p>
              <h3 className="text-2xl font-bold font-display text-foreground mt-0.5">Rp 12.500.000</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaksi Hari Ini</p>
              <h3 className="text-2xl font-bold font-display text-foreground mt-0.5">24 Pesanan</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kupon Promo Aktif</p>
              <h3 className="text-2xl font-bold font-display text-foreground mt-0.5">5 Kupon</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display text-foreground">Transaksi Terbaru</h2>
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">ID Order</th>
                  <th className="p-4">Peserta</th>
                  <th className="p-4">Modul Pembelajaran</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-foreground">{order.id}</td>
                    <td className="p-4 font-medium text-foreground">{order.user}</td>
                    <td className="p-4 text-muted-foreground">{order.moduleName}</td>
                    <td className="p-4 font-bold text-foreground">Rp {order.amount.toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <Badge
                        variant={order.status === 'Paid' ? 'default' : 'secondary'}
                        className="rounded-lg text-xs"
                      >
                        {order.status === 'Paid' ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Selesai</span>
                        ) : (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" /> Pending</span>
                        )}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl p-6 space-y-5 animate-scale-in z-10">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold font-display text-foreground">Buat Kupon Diskon Baru</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <Label htmlFor="coupon_code" className="text-xs font-semibold text-muted-foreground">Kode Kupon</Label>
                <Input
                  id="coupon_code"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="rounded-xl uppercase font-mono mt-1"
                  placeholder="Contoh: MERDEKA50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount_val" className="text-xs font-semibold text-muted-foreground">Nominal Diskon (Rp)</Label>
                <Input
                  id="discount_val"
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="rounded-xl font-mono mt-1"
                  placeholder="Contoh: 50000"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                  Batal
                </Button>
                <Button type="submit" className="rounded-xl font-semibold shadow-sm">
                  Simpan Kupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
