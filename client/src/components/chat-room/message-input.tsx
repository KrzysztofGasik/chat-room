import { Button, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSocketContext } from '../../context/socket-context';
import { useTypingBehavior } from '../../hooks/useTypingBehavior';

export const MessageInput = ({ roomId }: { roomId: string }) => {
  const { handleTyping, stopTyping } = useTypingBehavior(roomId);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();
  const { socket } = useSocketContext();

  const onSubmit = handleSubmit((data) => {
    stopTyping();
    socket?.emit('send_message', { roomId, body: { content: data.message } });
    reset();
  });

  return (
    <form onSubmit={onSubmit}>
      <TextField
        label="Your message"
        fullWidth
        sx={{ margin: '1rem 0' }}
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
      />
      {errors.message && (
        <Typography color="error">Message cannot be empty</Typography>
      )}
      <Button type="submit" variant="contained" disabled={!watch('message')}>
        Send
      </Button>
    </form>
  );
};
