import { useCallback, useRef, useState } from "react";

type SR = any;

export function useSpeech(lang: string) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SR | null>(null);

  const start = useCallback(
    (onResult: (text: string) => void, onError?: (e: string) => void) => {
      const W = window as any;
      const SpeechRecognition = W.SpeechRecognition || W.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        onError?.("Speech recognition not supported (use Chrome)");
        return;
      }
      const rec = new SpeechRecognition();
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      let finalText = "";
      rec.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        }
      };
      rec.onerror = (e: any) => {
        setListening(false);
        onError?.(e.error || "speech error");
      };
      rec.onend = () => {
        setListening(false);
        if (finalText.trim()) onResult(finalText.trim());
      };
      rec.start();
      recRef.current = rec;
      setListening(true);
    },
    [lang]
  );

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop };
}
