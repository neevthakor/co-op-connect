'use client';

import { useState } from 'react';
import { MessageThread } from '@/components/shared/message-thread';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

const mockConversations = [
  { id: '1', bookingId: 'booking-1', workerId: 'worker-1', workerName: 'Raj Patel (Electrician)', lastMessage: 'I am on my way with the safety gear.', unread: 1 },
  { id: '2', bookingId: 'booking-2', workerId: 'worker-2', workerName: 'Arjun Sharma (Plumber)', lastMessage: 'The replacement pipe has been fitted.', unread: 0 },
];

export default function MessagesPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || 'current-user';

  const [activeConv, setActiveConv] = useState<any>(mockConversations[0]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'booking-1': [
      { id: 'm1', senderId: 'worker-1', senderName: 'Raj Patel', content: 'Namaste! I have accepted your AC inspection booking.', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'm2', senderId: currentUserId, senderName: 'Me', content: 'Thank you Raj. Please call when you reach Paldi gate.', createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: 'm3', senderId: 'worker-1', senderName: 'Raj Patel', content: 'I am on my way with the safety gear.', createdAt: new Date(Date.now() - 600000).toISOString() },
    ],
    'booking-2': [
      { id: 'm4', senderId: 'worker-2', senderName: 'Arjun Sharma', content: 'The replacement pipe has been fitted.', createdAt: new Date(Date.now() - 7200000).toISOString() },
    ],
  });

  const handleSendMessage = (content: string) => {
    if (!activeConv) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: session?.user?.name || 'Me',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [activeConv.bookingId]: [...(prev[activeConv.bookingId] || []), newMsg],
    }));
  };

  const activeMessages = activeConv ? messages[activeConv.bookingId] || [] : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full bg-background border-x">
      {/* Sidebar list */}
      <div className={`w-full md:w-80 border-r flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold tracking-tight">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={`p-4 flex gap-3 cursor-pointer hover:bg-muted/50 transition-colors border-b ${activeConv?.id === conv.id ? 'bg-muted' : ''}`}
            >
              <Avatar>
                <AvatarFallback>{conv.workerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-sm truncate">{conv.workerName}</h3>
                  {conv.unread > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className={`flex-1 flex-col ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-white">
              <button className="md:hidden p-2 -ml-2" onClick={() => setActiveConv(null)}>
                ←
              </button>
              <Avatar className="h-8 w-8">
                <AvatarFallback>{activeConv.workerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-sm">{activeConv.workerName}</h2>
                <p className="text-xs text-muted-foreground">Booking #{activeConv.bookingId}</p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <MessageThread 
                messages={activeMessages} 
                currentUserId={currentUserId}
                onSend={handleSendMessage}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
