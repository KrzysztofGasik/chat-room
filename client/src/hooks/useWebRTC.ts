import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

export const useWebRTC = (socket: Socket | undefined) => {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isCallIncoming, setIsCallIncoming] = useState<boolean>(false);
  const [callerId, setCallerId] = useState<string | null>(null);
  const targetUserIdRef = useRef<string | null>(null);

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      return stream;
    } catch (error) {
      throw error;
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.ontrack = (event) => {
      if (event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        const targetUserId = targetUserIdRef.current ?? callerId;
        if (!targetUserId) return;
        socket.emit('video_ice_candidate', {
          targetUserId: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsCallActive(true);
      } else if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'failed'
      ) {
        setIsCallActive(false);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const startCall = async (targetUserId: string) => {
    targetUserIdRef.current = targetUserId;
    try {
      const stream = await getLocalStream();
      const peerConnection = createPeerConnection();

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (!socket) return;
      socket.emit('video_call_offer', { targetUserId, offer });
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call', error);
      endCall();
      socket?.emit('video_call_end', { targetUserId });
    }
  };

  const rejectCall = () => {
    if (!callerId) return;
    if (!socket) return;
    if (!isCallIncoming) return;

    socket.emit('video_call_answer', { callerId, acceptCall: false });
    setCallerId(null);
    setIsCallIncoming(false);
  };

  const answerCall = () => {
    if (!callerId) return;
    if (!socket) return;
    if (!isCallIncoming) return;

    socket.emit('video_call_answer', { callerId, acceptCall: true });
    setIsCallIncoming(false);
  };

  const endCall = () => {
    // Update UI state immediately so dialog closes right away
    setIsCallActive(false);
    setIsCallIncoming(false);
    setCallerId(null);
    setLocalStream(undefined);
    setRemoteStream(undefined);

    const targetUserId = targetUserIdRef.current ?? callerId;
    if (targetUserId && socket) {
      socket.emit('video_call_end', { targetUserId });
    }

    const streamToStop = localStream;
    const pcToClose = peerConnectionRef.current;

    targetUserIdRef.current = null;
    peerConnectionRef.current = null;

    // Stop tracks and close connection (non-blocking)
    if (streamToStop) {
      streamToStop.getTracks().forEach((track) => track.stop());
    }
    if (pcToClose) {
      pcToClose.close();
    }
  };

  useEffect(() => {
    if (!socket) return;
    if (isCallActive || isCallIncoming) return;

    const handleIncomingCall = ({ callerId }: { callerId: string }) => {
      setCallerId(callerId);
      setIsCallIncoming(true);
    };

    const handleIncomingOffer = async ({
      callerId,
      offer,
    }: {
      callerId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      try {
        const stream = await getLocalStream();
        const peerConnection = createPeerConnection();

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
        const description = new RTCSessionDescription(offer);
        await peerConnection.setRemoteDescription(description);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('video_call_answer_sdp', { callerId, answer });
        setIsCallActive(true);
        setIsCallIncoming(false);
      } catch (error) {
        endCall();
      }
    };

    const handleIncomingAnswer = async ({
      calleeId,
      answer,
    }: {
      calleeId: string;
      answer: RTCSessionDescriptionInit;
    }): Promise<void> => {
      try {
        if (calleeId !== targetUserIdRef.current) {
          console.error('Answer from unexpected user');
          return;
        }
        const pc = peerConnectionRef.current;
        if (!pc) return;
        const description = new RTCSessionDescription(answer);
        await pc.setRemoteDescription(description);
      } catch (error) {
        console.error('Error during handling incoming call', error);
      }
    };

    const handleIceCandidate = async ({
      senderId,
      candidate,
    }: {
      senderId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      console.log(senderId);
      try {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        if (!candidate) return;
        const rtcIceCandidate = new RTCIceCandidate(candidate);
        await pc.addIceCandidate(rtcIceCandidate);
      } catch (error) {
        console.error('Error during handling ice candidate', error);
      }
    };

    const handleAcceptCall = async ({
      calleeId,
    }: {
      calleeId: string;
    }): Promise<void> => {
      if (!targetUserIdRef.current) {
        targetUserIdRef.current = calleeId;
      }
      try {
        const stream = await getLocalStream();
        if (!stream) return;
        const pr = createPeerConnection();
        peerConnectionRef.current = pr;

        stream.getTracks().forEach((track) => {
          pr.addTrack(track, stream);
        });
        const offer = await pr.createOffer();
        await pr.setLocalDescription(offer);
        if (!socket) return;
        socket.emit('video_call_offer', {
          targetUserId: targetUserIdRef.current,
          offer,
        });
      } catch (error) {
        console.error('Error during handling accept call', error);
        endCall();
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on('user_request_video_call', handleIncomingCall);
    socket.on('video_call_offer', handleIncomingOffer);
    socket.on('video_call_answer_sdp', handleIncomingAnswer);
    socket.on('video_ice_candidate', handleIceCandidate);
    socket.on('video_call_accepted', handleAcceptCall);
    socket.on('video_call_ended', handleCallEnded);

    return () => {
      socket.off('user_request_video_call', handleIncomingCall);
      socket.off('video_call_offer', handleIncomingOffer);
      socket.off('video_call_answer_sdp', handleIncomingAnswer);
      socket.off('video_ice_candidate', handleIceCandidate);
      socket.off('video_call_accepted', handleAcceptCall);
      socket.off('video_call_ended', handleCallEnded);
    };
  }, [socket, isCallActive, isCallIncoming]);

  return {
    localStream,
    remoteStream,
    isCallActive,
    isCallIncoming,
    callerId,
    startCall,
    rejectCall,
    answerCall,
    endCall,
  };
};
