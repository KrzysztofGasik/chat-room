import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { useSocketContext } from '../context/socket-context';
import { useWebRTC } from '../hooks/useWebRTC';
import { useEffect, useRef } from 'react';
import CallIcon from '@mui/icons-material/Call';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { isMobileDevice } from '../utils/device-detection';

export const VideoChatComponent = () => {
  const { socket } = useSocketContext();
  const {
    answerCall,
    rejectCall,
    endCall,
    localStream,
    remoteStream,
    isCallActive,
    isCallIncoming,
  } = useWebRTC(socket);

  const localStreamRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<HTMLVideoElement>(null);
  const isOpen = isCallActive || isCallIncoming;
  const isMobile = isMobileDevice();

  const setLocalVideoRef = (element: HTMLVideoElement | null) => {
    localStreamRef.current = element;
    if (element && localStream) {
      element.srcObject = localStream;
    }
  };

  const setRemoteVideoRef = (element: HTMLVideoElement | null) => {
    remoteStreamRef.current = element;
    if (element && remoteStream) {
      element.srcObject = remoteStream;
    }
  };

  useEffect(() => {
    if (localStreamRef.current && localStream) {
      localStreamRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStreamRef.current && remoteStream) {
      remoteStreamRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <Dialog open={isOpen} fullWidth maxWidth="sm">
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          alignItems: 'center',
        }}
      >
        {isMobile && isCallIncoming && (
          <Alert severity="warning" sx={{ width: '100%' }}>
            Video chat is not available on mobile devices. Please use a desktop
            or laptop to accept video calls.
          </Alert>
        )}
        <video
          ref={setLocalVideoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            maxWidth: '400px',
            maxHeight: '300px',
            backgroundColor: '#000',
          }}
          controls
        />
        <video
          ref={setRemoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '100%', maxWidth: '400px', backgroundColor: '#000' }}
          controls
        />
      </DialogContent>
      <DialogActions>
        {isCallIncoming && (
          <>
            <Button
              onClick={rejectCall}
              variant="contained"
              endIcon={
                <PhoneDisabledIcon sx={{ color: 'var(--font-color)' }} />
              }
            >
              Reject call
            </Button>
            <Button
              onClick={answerCall}
              variant="contained"
              disabled={isMobile}
              endIcon={<CallIcon sx={{ color: 'var(--font-color)' }} />}
            >
              Accept call
            </Button>
          </>
        )}
        {isCallActive && (
          <Button
            onClick={endCall}
            variant="contained"
            endIcon={<CallEndIcon sx={{ color: 'var(--font-color)' }} />}
          >
            End call
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
