import * as React from 'react';
import { Box, IconButton, LinearProgress, Typography } from '@mui/material';
import { PlayArrow, Pause, Stop } from '@mui/icons-material';

export default function MusicPlayer() {
  const [playing, setPlaying] = React.useState(false);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleStop = () => {
    setPlaying(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Song Title</Typography>
        <LinearProgress variant="determinate" value={50} sx={{ width: '50rem', height: '0.5rem', mb: 4 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton size="large" onClick={handlePlayPause} sx={{ fontSize: '6rem', mx: 2 }}>
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton size="large" onClick={handleStop} sx={{ fontSize: '4rem', mx: 2 }}>
            <Stop />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
