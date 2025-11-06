import {
  Avatar,
  Badge,
  Box,
  Card,
  ListItem,
  Typography,
  type SxProps,
} from '@mui/material';
import type { UserBasic } from '../../types';
import { useSocketContext } from '../../context/socket-context';

type MembersListProps = {
  members: Array<{ user: UserBasic }> | undefined;
  sx: SxProps;
};

export const MembersList = ({ members, sx }: MembersListProps) => {
  const { onlineUsers } = useSocketContext();
  return (
    <Card sx={sx}>
      {members?.map((member) => (
        <ListItem key={member.user.id}>
          <MemberInfo
            member={member.user}
            isOnline={onlineUsers.has(member.user.id)}
          />
        </ListItem>
      ))}
    </Card>
  );
};

const MemberInfo = ({
  member,
  isOnline,
}: {
  member: UserBasic;
  isOnline: boolean;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      <Badge
        variant="dot"
        color={`${isOnline ? 'success' : 'error'}`}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          '& .MuiBadge-dot': {
            height: 10,
            minWidth: 10,
            borderRadius: 10,
          },
        }}
      >
        <Avatar src={`${member.avatar}`} />
      </Badge>
      <Typography sx={{ ml: 1 }}>{member.username}</Typography>
    </Box>
  );
};
