import * as React from 'react';
import { Box, IconButton, LinearProgress, Typography, Slider } from '@mui/material';
import { PlayArrow, Pause, Stop, VolumeUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import logo from './stem441-high-resolution-logo-black-on-transparent-background.png'

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function MusicPlayer({ id }) {
  const [playing, setPlaying] = React.useState(false);
  const [audioSrc, setAudioSrc] = React.useState(null);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(0.5);

  React.useEffect(() => {
    // Fetch the audio zip file and extract the audio file
    fetch(`${process.env.REACT_APP_API_URL}/getAudioZip?id=${id}`)
      .then((response) => response.blob())
      .then((blob) => {
        const zip = new JSZip();
        return zip.loadAsync(blob);
      })
      .then((zip) => {
        const audioBlob = zip.file('audio.mp3').async('blob');
        console.log(audioBlob);
        return audioBlob;
      })
      .then((audioBlob) => {
        setAudioSrc(URL.createObjectURL(audioBlob));
      })
      .catch((error) => {
        console.error('Error loading audio:', error);
      });
  }, [id]);

  const handlePlayPause = () => {
    const audio = document.getElementById('audio');
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
    setAudioCurrentTime(audio.currentTime);
  };

  const handleStop = () => {
    const audio = document.getElementById('audio');
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
  };

  const handleTimeUpdate = () => {
    const audio = document.getElementById('audio');
    setAudioCurrentTime(audio.currentTime);
  };

  const handleDurationChange = () => {
    const audio = document.getElementById('audio');
    setAudioDuration(audio.duration);
  };

  const handleVolumeChange = (event, newValue) => {
    const audio = document.getElementById('audio');
    audio.volume = newValue;
    setVolume(newValue);
  };

  const handleLinearProgressClick = (event) => {
    const audio = document.getElementById('audio');
    const boundingClientRect = event.currentTarget.getBoundingClientRect();
    const progressWidth = boundingClientRect.width;
    const clickX = event.clientX - boundingClientRect.left;
    const progressFraction = clickX / progressWidth;
    const newCurrentTime = progressFraction * audio.duration;
    audio.currentTime = newCurrentTime;
    setAudioCurrentTime(newCurrentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = document.getElementById('audio');
    audio.volume = volume; // set the volume to the current value of the volume state
  };


  return (
    <Box sx={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Box sx={{ position: 'absolute', top: '1rem', left: '1rem', '&:hover img': { transform: 'scale(1.1)' } }}>
        <Link to="/">
          <img src={logo} alt="Stem441 Logo" style={{ width: '10rem', height: 'auto' }} />
        </Link>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Song Title</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '30rem' }}>
  <Typography variant="caption">
    {formatTime(audioCurrentTime)}
  </Typography>
  <LinearProgress variant="determinate" value={audioCurrentTime / audioDuration * 100} sx={{
    width: '100%', height: '0.5rem', mx: '1rem', "&:hover": { cursor: 'pointer' }
  }} onClick={handleLinearProgressClick} />
  <Typography variant="caption">
    {formatTime(audioDuration)}
  </Typography>
</Box>
        <audio id="audio" src={audioSrc} onTimeUpdate={handleTimeUpdate} onDurationChange={handleDurationChange} onLoadedMetadata={handleLoadedMetadata} />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton size="large" onClick={handlePlayPause} sx={{ fontSize: '6rem', mx: 2 }}>
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton size="large" onClick={handleStop} sx={{ fontSize: '4rem', mx: 2 }}>
            <Stop />
          </IconButton>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ml: 4 }}>
            <IconButton size="small">
              <VolumeUp />
            </IconButton>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              sx={{
                width: '5rem',
                '& .MuiSlider-thumb': {
                  width: '1rem',
                  height: '1rem',
                },
              }}
              aria-labelledby="volume-slider"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
