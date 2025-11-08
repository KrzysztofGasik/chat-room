import {
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  type DialogProps,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSocketContext } from '../../context/socket-context';
import { useTypingBehavior } from '../../hooks/useTypingBehavior';
import SendIcon from '@mui/icons-material/Send';
import EmojiPicker from 'emoji-picker-react';
import { useState } from 'react';
import MoodIcon from '@mui/icons-material/Mood';
import { CloseRounded } from '@mui/icons-material';

export const MessageInput = ({ roomId }: { roomId: string | undefined }) => {
  const { handleTyping, stopTyping } = useTypingBehavior(roomId || '');
  const [showEmoji, setShowEmoji] = useState(false);
  const [_, setEmoji] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    getValues,
  } = useForm();
  const { socket } = useSocketContext();

  const onSubmit = handleSubmit((data) => {
    stopTyping();
    socket?.emit('send_message', { roomId, body: { content: data.message } });
    reset();
    setEmoji([]);
  });

  const handleClose: DialogProps['onClose'] = (_, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setShowEmoji(false);
  };

  return (
    <form onSubmit={onSubmit}>
      <TextField
        label="Your message"
        fullWidth
        sx={{ margin: '1rem 0' }}
        slotProps={{
          input: { sx: { color: 'var(--font-color)' } },
          inputLabel: { sx: { color: 'var(--font-color)' }, shrink: true },
        }}
        {...register('message', {
          required: true,
          onChange: (e) => {
            if (e.target.value.length === 0) {
              stopTyping();
            } else {
              handleTyping();
            }
          },
        })}
        autoComplete="off"
      />
      {errors.message && (
        <Typography color="error">Message cannot be empty</Typography>
      )}
      <Tooltip title="Select emoji" placement="top">
        <IconButton onClick={() => setShowEmoji((prev) => !prev)}>
          <MoodIcon sx={{ color: '#fed734' }} />
        </IconButton>
      </Tooltip>
      <Dialog
        open={showEmoji}
        fullWidth
        maxWidth="sm"
        onClose={handleClose}
        scroll="paper"
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
          },
        }}
        slotProps={{ paper: { sx: { mt: '50px' } } }}
        className="react-emoji-picker-dialog"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setShowEmoji(false)}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <EmojiPicker
          className="react-emoji-picker"
          onEmojiClick={({ emoji }) => {
            const currentMessage = getValues('message') || '';
            const newMessage = currentMessage + emoji;
            setValue('message', newMessage, { shouldValidate: true });
            setEmoji((prev) => [...prev, emoji]);
            handleTyping();
          }}
          searchDisabled
        />
      </Dialog>

      <Button
        type="submit"
        variant="contained"
        disabled={!watch('message')}
        endIcon={<SendIcon />}
      >
        Send
      </Button>
    </form>
  );
};
