"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: { [index: number]: { transcript: string; }; isFinal?: boolean; };
  };
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): ISpeechRecognition };
    webkitSpeechRecognition: { new(): ISpeechRecognition };
  }
}


interface VoiceInputProps {
  onResult?: (text: string) => void;
  onTranscription?: (text: string) => void;
  language?: "en-IN" | "hi-IN" | "gu-IN";
  className?: string;
}

export function VoiceInput({ onResult, onTranscription, language = "en-IN", className }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const handleResult = useCallback((text: string) => {
    if (onResult) onResult(text);
    if (onTranscription) onTranscription(text);
  }, [onResult, onTranscription]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!isSupported) {
      alert("Voice input is not supported in this browser. Please use Chrome/Edge or type your request.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const reco = new SpeechRecognition();
    reco.continuous = false;
    reco.interimResults = true;
    reco.lang = language;
    recognitionRef.current = reco;

    reco.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      
      setTranscript(text);
      
      if (result.isFinal) {
        handleResult(text);
        setIsRecording(false);
      }
    };

    reco.onerror = (event: { error: string }) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    reco.onend = () => {
      setIsRecording(false);
    };

    setTranscript("");
    reco.start();
    setIsRecording(true);
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={toggleRecording}
        className={cn("rounded-full transition-all", isRecording && "animate-pulse")}
        title={isRecording ? "Stop Listening" : "Start Voice Input"}
      >
        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      {isRecording && (
        <span className="text-xs text-red-500 font-medium animate-pulse">
          Listening ({language})...
        </span>
      )}
    </div>
  );
}
