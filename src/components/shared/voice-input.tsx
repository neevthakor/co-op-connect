"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [recognition, setRecognition] = useState<any>(null);

  const handleResult = useCallback((text: string) => {
    if (onResult) onResult(text);
    if (onTranscription) onTranscription(text);
  }, [onResult, onTranscription]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        setRecognition(reco);
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (recognition) {
      recognition.lang = language;
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const text = result[0].transcript;
        
        setTranscript(text);
        
        if (result.isFinal) {
          handleResult(text);
          setIsRecording(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    }
  }, [recognition, language, handleResult]);

  const toggleRecording = () => {
    if (!isSupported) {
      alert("Voice input is not supported in this browser. Please use Chrome/Edge or type your request.");
      return;
    }

    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognition?.start();
      setIsRecording(true);
    }
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
