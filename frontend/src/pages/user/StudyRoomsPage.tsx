import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, Hash } from 'lucide-react';
import { LiveStudyRoomModal } from '@/components/study/LiveStudyRoomModal';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function StudyRoomsPage() {
  usePageTitle('Ruang Belajar Live & Diskusi');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoom, setActiveRoom] = useState<{id: string, name: string} | null>(null);

  const rooms = [
    { id: '1', name: 'Diskusi React & TypeScript', participants: 12, tags: ['React', 'Frontend'] },
    { id: '2', name: 'Persiapan Ujian Backend', participants: 8, tags: ['Backend', 'NodeJS'] },
    { id: '3', name: 'Belajar Fundamental UI/UX', participants: 25, tags: ['Design', 'UI/UX'] },
  ];

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ruang Belajar Live</h1>
            <p className="text-muted-foreground mt-1">Bergabung dengan diskusi realtime dan belajar bersama komunitas.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Buat Ruang Baru
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            className="pl-10 h-12 text-base rounded-xl" 
            placeholder="Cari topik diskusi atau nama ruang..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <Card key={room.id} className="hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                    <Users className="h-4 w-4" />
                    {room.participants}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{room.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2 mt-2">
                  {room.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 font-medium">
                      <Hash className="h-3 w-3" /> {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => setActiveRoom({ id: room.id, name: room.name })}
                >
                  Gabung Diskusi
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Tidak ada ruang belajar yang sesuai dengan pencarian Anda.
          </div>
        )}

        <LiveStudyRoomModal 
          isOpen={!!activeRoom}
          roomId={activeRoom?.id || ''}
          roomName={activeRoom?.name || ''}
          onClose={() => setActiveRoom(null)}
        />
      </div>
    </PageLayout>
  );
}
