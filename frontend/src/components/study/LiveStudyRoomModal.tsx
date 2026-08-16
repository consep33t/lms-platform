import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
}

interface Participant {
  id: string;
  name: string;
}

interface LiveStudyRoomModalProps {
  roomId: string;
  roomName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveStudyRoomModal: React.FC<LiveStudyRoomModalProps> = ({ roomId, roomName, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'System', text: `Welcome to ${roomName}!`, isMe: false }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  const participants: Participant[] = [
    { id: '1', name: 'You' },
    { id: '2', name: 'Alex' },
    { id: '3', name: 'Sarah' }
  ];

  if (!isOpen) return null;

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        sender: 'You',
        text: newMessage,
        isMe: true
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden animate-in zoom-in duration-200">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/10 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-bold">Peserta ({participants.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-card">
            <div>
              <h2 className="font-bold text-lg">{roomName}</h2>
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender}</span>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.isMe ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-card flex gap-2">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ketik pesan..."
              className="flex-1"
            />
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" /> Kirim
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
