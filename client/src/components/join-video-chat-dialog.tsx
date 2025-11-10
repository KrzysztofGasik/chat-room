import {
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItem,
  Typography,
  type DialogProps,
} from '@mui/material';

import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useSocketContext } from '../context/socket-context';
import { MemberInfo } from './chat-room/members-list';
import type { UserBasic } from '../types';
import { useAuthContext } from '../context/auth-context';
import { CloseRounded } from '@mui/icons-material';
import { isMobileDevice } from '../utils/device-detection';

type JoinVideoChatDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const JoinVideoChatDialog = ({
  open,
  onClose,
}: JoinVideoChatDialogProps) => {
  const handleClose: DialogProps['onClose'] = (_, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    onClose();
  };
  const { user } = useAuthContext();
  const { socket, onlineUsers } = useSocketContext();
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get(`/users`);
      return res.data;
    },
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  const onlineUsersList: UserBasic[] = (data ?? []).filter(
    (filteredUser: UserBasic) =>
      filteredUser.id !== user?.id && onlineUsers.has(filteredUser.id)
  );

  const isMobile = isMobileDevice();

  const handleCall = (targetUserId: string) => {
    socket?.emit('video_call_request', { targetUserId });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography>Join a video chat</Typography>
        <IconButton onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {isMobile && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Video chat is currently available on desktop devices only. Please
            use a desktop or laptop computer to join video calls.
          </Alert>
        )}
        {onlineUsersList && onlineUsersList.length > 0 ? (
          <>
            <Typography>Select user for call</Typography>
            {onlineUsersList.map((member: UserBasic) => (
              <ListItem key={member.id}>
                <MemberInfo
                  member={member}
                  isOnline={onlineUsers.has(member.id)}
                  showCallButton={!isMobile}
                  handleCall={handleCall}
                />
              </ListItem>
            ))}
          </>
        ) : (
          <Typography>No users online, try later</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
