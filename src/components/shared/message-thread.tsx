"use client";

import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string | Date;
  isSystem?: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onSend: (content: string) => void;
  className?: string;
}

export function MessageThread({ messages, currentUserId, onSend, className }: MessageThreadProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background border rounded-lg overflow-hidden", className)}>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId;
          const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
            >
              <div className={cn("flex max-w-[80%] gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                {!isMe && (
                  <div className="w-8 shrink-0">
                    {showAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.senderAvatar} />
                        <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                
                <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  {showAvatar && !isMe && (
                    <span className="text-xs text-muted-foreground ml-1 mb-1">{msg.senderName}</span>
                  )}
                  <div 
                    className={cn(
                      "px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words",
                      isMe 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                    {formatDateTime(new Date(msg.createdAt)).split(',')[1]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-3 bg-background border-t">
        <div className="flex items-end gap-2 bg-muted/50 rounded-lg p-2 border">
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground rounded-full">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 p-2 py-2.5 text-sm"
            rows={1}
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim()}
            size="icon" 
            className="shrink-0 h-8 w-8 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
