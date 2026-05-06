import { useState, useCallback, useRef } from "react";

export type VoiceMode = "webrtc" | "ws-opus" | "none";

export function useMediaDevice() {
  const [mode, setMode] = useState<VoiceMode>("none");
  const [muted, setMuted] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const checkSupport = useCallback(async (): Promise<VoiceMode> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return "none";

      const pc = new RTCPeerConnection();
      pc.close();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());

      try { new AudioContext(); } catch { /* ok */ }

      setMode("webrtc");
      return "webrtc";
    } catch {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMode("ws-opus");
        return "ws-opus";
      } catch {
        setMode("none");
        return "none";
      }
    }
  }, []);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicActive(true);
      return stream;
    } catch {
      return null;
    }
  }, []);

  const stopMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMicActive(false);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !muted;
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !newMuted;
    });
    setMuted(newMuted);
  }, [muted]);

  return { mode, muted, micActive, checkSupport, startMic, stopMic, toggleMute };
}
