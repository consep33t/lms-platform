import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, CreditCard, Sparkles, ArrowLeft, Tag } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/context/FeedbackContext'

export default function CheckoutPage() {
  usePageTitle('Checkout Pembelian Modul')
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const { success, info } = useToast()

  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [paymentGateway, setPaymentGateway] = useState('midtrans')
  
  const basePrice = 500000
  
  const handleCalculateDiscount = () => {
    if (couponCode.toUpperCase() === 'DISC50') {
      setDiscount(50000)
      success('Kupon Berhasil Dipasang!', 'Diskon potongan Rp 50.000 telah diaplikasikan.')
    } else if (couponCode.trim()) {
      setDiscount(0)
      info('Kupon Tidak Valid', 'Kode promo tidak ditemukan atau masa berlakunya telah habis.')
    }
  }

  const handleCheckout = () => {
    success('Memproses Pembayaran...', `Menghubungkan ke gateway pembayaran ${paymentGateway === 'midtrans' ? 'Midtrans Snap' : 'Stripe Checkout'}.`)
    setTimeout(() => {
      navigate('/orders')
    }, 1200)
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-page-in">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Checkout Pembelian Modul
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Konfirmasi pesanan dan pilih metode pembayaran resmi yang aman.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Ringkasan Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">ID Modul</span>
                <span className="font-mono font-medium">{moduleId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">Nama Modul</span>
                <span className="font-semibold text-foreground">Akselerasi Fullstack Enterprise</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">Harga Normal</span>
                <span className="font-medium text-foreground">Rp {basePrice.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="pt-2 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kode Promo / Voucher
                </label>
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value)}
                    className="rounded-xl uppercase font-mono"
                    placeholder="Contoh: DISC50"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleCalculateDiscount}
                    className="rounded-xl shrink-0"
                  >
                    Gunakan
                  </Button>
                </div>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  <span>Potongan Diskon</span>
                  <span>-Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              
              <div className="border-t border-border pt-4 mt-2 flex justify-between items-center">
                <span className="font-bold text-base text-foreground">Total Tagihan</span>
                <span className="text-xl font-extrabold text-primary">
                  Rp {(basePrice - discount).toLocaleString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Metode Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label 
                  onClick={() => setPaymentGateway('midtrans')}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentGateway === 'midtrans' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/50'}`}
                >
                  <input 
                    type="radio" 
                    name="gateway" 
                    value="midtrans"
                    checked={paymentGateway === 'midtrans'}
                    onChange={() => setPaymentGateway('midtrans')}
                    className="text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-semibold text-sm text-foreground">Midtrans Payment Gateway</div>
                    <div className="text-xs text-muted-foreground mt-0.5">QRIS, GoPay, OVO, ShopeePay, Virtual Account BCA/Mandiri/BRI</div>
                  </div>
                </label>

                <label 
                  onClick={() => setPaymentGateway('stripe')}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentGateway === 'stripe' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/50'}`}
                >
                  <input 
                    type="radio" 
                    name="gateway" 
                    value="stripe"
                    checked={paymentGateway === 'stripe'}
                    onChange={() => setPaymentGateway('stripe')}
                    className="text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-semibold text-sm text-foreground">Stripe Global Checkout</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Kartu Kredit / Debit Visa, Mastercard, AMEX & Apple Pay</div>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Transaksi dienkripsi 256-bit SSL dengan perlindungan anti-fraud.</span>
              </div>

              <Button 
                type="button"
                onClick={handleCheckout}
                className="w-full rounded-xl h-11 text-base font-bold shadow-md active-press mt-2"
              >
                Bayar Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
