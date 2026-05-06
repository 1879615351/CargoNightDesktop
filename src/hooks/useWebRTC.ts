import { useRef, useCallback } from "react";
import type { VoiceMode } from "./useMediaDevice";

interface PeerInfo {
  user_id: string;
  pc: RTCPeerConnection;
}

export function useWebRTC(
  roomId: string | undefined,
  _userId: string,
  _mode: VoiceMode,
  signalSend: (data: unknown) => void,
  _onSignaling: ((data: unknown) => void) | undefined
) {
  const peersRef = useRef<Map<string, PeerInfo>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = useCallback(async (targetUserId: string): Promise<RTCPeerConnection> => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalSend({
          type: "ice_candidate",
          room_id: roomId,
          target_user_id: targetUserId,
          candidate: JSON.stringify(e.candidate),
        });
      }
    };

    pc.ontrack = (e) => {
      const audio = new Audio();
      audio.srcObject = e.streams[0];
      audio.play().catch(() => {});
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signalSend({
      type: "sdp_offer",
      room_id: roomId,
      target_user_id: targetUserId,
      sdp: JSON.stringify(pc.localDescription),
    });

    return pc;
  }, [roomId, signalSend]);

  const handleSignaling = useCallback(async (data: Record<string, unknown>) => {
    const targetId = data.sender_user_id as string | undefined;
    if (!targetId) return;

    let pc = peersRef.current.get(targetId)?.pc;

    if (!pc && (data.type === "sdp_offer")) {
      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          signalSend({
            type: "ice_candidate",
            room_id: roomId,
            target_user_id: targetId,
            candidate: JSON.stringify(e.candidate),
          });
        }
      };

      pc.ontrack = (e) => {
        const audio = new Audio();
        audio.srcObject = e.streams[0];
        audio.play().catch(() => {});
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (pc) pc.addTrack(track, localStreamRef.current!);
        });
      }

      peersRef.current.set(targetId, { user_id: targetId, pc });
    }

    if (!pc) return;

    const sdp = data.sdp as string | undefined;
    const candidate = data.candidate as string | undefined;

    if (sdp) {
      const desc = JSON.parse(sdp);
      if (data.type === "sdp_offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(desc));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signalSend({
          type: "sdp_answer",
          room_id: roomId,
          target_user_id: targetId,
          sdp: JSON.stringify(pc.localDescription),
        });
      } else if (data.type === "sdp_answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(desc));
      }
    }

    if (candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
    }
  }, [roomId, signalSend]);

  const setLocalStream = useCallback((stream: MediaStream) => {
    localStreamRef.current = stream;
    peersRef.current.forEach(({ pc }) => {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    });
  }, []);

  const closeAll = useCallback(() => {
    peersRef.current.forEach(({ pc }) => pc.close());
    peersRef.current.clear();
  }, []);

  return { createPeerConnection, handleSignaling, setLocalStream, closeAll };
}
