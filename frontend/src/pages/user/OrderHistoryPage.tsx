import React from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Receipt, Download, CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/context/FeedbackContext'

const mockOrders = [
  { id: 'ORD-2026-0815', moduleName: 'Arsitektur Jaringan Enterprise & Microservices', date: '2026-08-15', amount: 450000, status: 'Paid', gateway: 'Midtrans QRIS' },
  { id: 'ORD-2026-0816', moduleName: 'Fullstack React TypeScript Modern', date: '2026-08-16', amount: 300000, status: 'Pending', gateway: 'Virtual Account BCA' },
  { id: 'ORD-2026-0810', moduleName: 'DevOps & Kubernetes Cloud Orchestration', date: '2026-08-10', amount: 500000, status: 'Paid', gateway: 'Stripe Card' },
]

export default function OrderHistoryPage() {
  usePageTitle('Riwayat Pesanan & Tagihan')
  const { success } = useToast()

  const handleDownloadInvoice = (orderId: string) => {
    success('Invoice Diunduh', `File invoice untuk transaksi #${orderId} telah disiapkan.`)
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-page-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Riwayat Pesanan & Tagihan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar transaksi pembelian modul pembelajaran, status verifikasi, dan faktur resmi.
          </p>
        </div>
        
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">ID Transaksi</th>
                  <th className="p-4">Modul Pembelajaran</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Metode & Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Faktur / Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-foreground">{order.id}</td>
                    <td className="p-4 font-semibold text-foreground">{order.moduleName}</td>
                    <td className="p-4 text-muted-foreground text-xs">{order.date}</td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">Rp {order.amount.toLocaleString('id-ID')}</div>
                      <div className="text-xs text-muted-foreground">{order.gateway}</div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={order.status === 'Paid' ? 'default' : order.status === 'Pending' ? 'secondary' : 'destructive'}
                        className="rounded-lg text-xs"
                      >
                        {order.status === 'Paid' ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Lunas</span>
                        ) : order.status === 'Pending' ? (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" /> Menunggu</span>
                        ) : (
                          <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-rose-500" /> Gagal</span>
                        )}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="gap-1.5 rounded-xl text-xs hover:bg-muted"
                      >
                        <Download className="h-3.5 w-3.5" /> Unduh Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
