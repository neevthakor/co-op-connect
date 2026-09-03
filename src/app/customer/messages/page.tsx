'use client';

import { useState, useEffect, useMemo } from 'react';
import { MessageThread } from '@/components/shared/message-thread';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || 'current-user';

  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  // Group messages by bookingId or otherUserId
  const conversations = useMemo(() => {
    const convMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.senderId === currentUserId ? msg.recipient : msg.sender;
      if (!otherUser) return;
      const key = msg.bookingId || otherUser.id;
      
      if (!convMap.has(key)) {
        convMap.set(key, {
          id: key,
          bookingId: msg.bookingId,
          otherUserId: otherUser.id,
          otherUserName: otherUser.name || 'Unknown User',
          otherUserAvatar: otherUser.avatar,
          lastMessage: msg.content,
          unread: !msg.readAt && msg.recipientId === currentUserId ? 1 : 0,
          messages: [msg],
        });
      } else {
        const conv = convMap.get(key);
        conv.messages.push(msg);
        if (!msg.readAt && msg.recipientId === currentUserId) {
          conv.unread += 1;
        }
      }
    });

    return Array.from(convMap.values()).map(c => ({
      ...c,
      messages: c.messages.reverse()
    }));
  }, [messages, currentUserId]);

  useEffect(() => {
    if (conversations.length > 0 && !activeConv) {
      setActiveConv(conversations[0]);
    }
  }, [conversations, activeConv]);

  const handleSendMessage = async (content: string) => {
    if (!activeConv) return;
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: session?.user?.name || 'Me',
      sender: { id: currentUserId, name: session?.user?.name || 'Me' },
      recipientId: activeConv.otherUserId,
      content,
      bookingId: activeConv.bookingId,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [newMsg, ...prev]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: activeConv.otherUserId,
          bookingId: activeConv.bookingId,
          content
        })
      });
      if (!res.ok) throw new Error('Failed to send');
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== newMsg.id));
    }
  };

  const activeMessages = activeConv ? conversations.find(c => c.id === activeConv.id)?.messages || [] : [];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full bg-background border-x p-4">
        <Skeleton className="w-80 h-full hidden md:block mr-4" />
        <Skeleton className="flex-1 h-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full bg-background border-x">
      <div className={`w-full md:w-80 border-r flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold tracking-tight">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-muted/50 transition-colors border-b ${activeConv?.id === conv.id ? 'bg-muted' : ''}`}
              >
                <Avatar>
                  <AvatarImage src={conv.otherUserAvatar} />
                  <AvatarFallback>{conv.otherUserName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-sm truncate">{conv.otherUserName}</h3>
                    {conv.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex-col ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-card z-10">
              <button className="md:hidden p-2 -ml-2" onClick={() => setActiveConv(null)}>
                ←
              </button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={activeConv.otherUserAvatar} />
                <AvatarFallback>{activeConv.otherUserName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-sm">{activeConv.otherUserName}</h2>
                {activeConv.bookingId && <p className="text-xs text-muted-foreground">Booking #{activeConv.bookingId.slice(-6)}</p>}
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <MessageThread 
                messages={activeMessages.map((m: any) => ({
                  id: m.id,
                  senderId: m.senderId,
                  senderName: m.sender?.name || 'User',
                  content: m.content,
                  createdAt: m.createdAt,
                }))} 
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
