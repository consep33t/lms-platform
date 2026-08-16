import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Search, RefreshCw, Clock, Globe, Activity } from 'lucide-react'
import api from '@/lib/api'

interface AuditLogItem {
  id: number
  user_id: number | null
  action: string
  entity_type: string
  entity_id: number | null
  details: string | null
  ip_address: string | null
  created_at: string
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/audit-logs?limit=100')
      setLogs(res.data)
    } catch (err) {
      console.error('Failed to fetch audit logs', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.ip_address || '').toLowerCase().includes(search.toLowerCase())

    const matchesAction = filterAction === 'ALL' || log.action.toUpperCase().includes(filterAction)

    return matchesSearch && matchesAction
  })

  const getActionBadgeColor = (action: string) => {
    const upper = action.toUpperCase()
    if (upper.includes('CREATE') || upper.includes('REGISTER') || upper.includes('ISSUE')) {
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
    }
    if (upper.includes('DELETE') || upper.includes('REJECT') || upper.includes('REVOKE')) {
      return 'bg-destructive/15 text-destructive border-destructive/30'
    }
    if (upper.includes('UPDATE') || upper.includes('BROADCAST')) {
      return 'bg-blue-500/15 text-blue-600 border-blue-500/30'
    }
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" /> Log Audit & Integritas Sistem
              </h1>
              <p className="text-muted-foreground text-sm">
                Rekam jejak seluruh mutasi data, pembuatan token, penyiaran notifikasi, dan aktivitas administratif.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-1.5 self-start sm:self-center">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Log
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari aksi, detail, atau IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'BROADCAST'].map((act) => (
                <Button
                  key={act}
                  size="sm"
                  variant={filterAction === act ? 'default' : 'outline'}
                  onClick={() => setFilterAction(act)}
                  className="text-xs h-8 px-3 shrink-0"
                >
                  {act}
                </Button>
              ))}
            </div>
          </div>

          {/* Logs Table */}
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-xs text-muted-foreground">Memuat audit logs...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">Tidak ada log yang sesuai filter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/30 border-b font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Waktu</th>
                        <th className="p-3.5">Aksi</th>
                        <th className="p-3.5">Entitas</th>
                        <th className="p-3.5">Detail Aktivitas</th>
                        <th className="p-3.5">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(log.created_at).toLocaleString('id-ID', {
                                dateStyle: 'short',
                                timeStyle: 'medium',
                              })}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <Badge variant="outline" className={`font-mono text-[10px] font-bold ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </Badge>
                          </td>
                          <td className="p-3.5 font-semibold text-foreground whitespace-nowrap">
                            {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                          </td>
                          <td className="p-3.5 text-muted-foreground font-mono text-[11px] max-w-md truncate">
                            {log.details || '-'}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3 opacity-60" /> {log.ip_address || '127.0.0.1'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
