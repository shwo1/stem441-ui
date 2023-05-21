import * as React from 'react';
import { Box, IconButton, LinearProgress, Typography, Slider } from '@mui/material';
import { PlayArrow, Pause, Stop, VolumeUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import logo from './stem441-high-resolution-logo-black-on-transparent-background.png';
import Waveform from './Waveform';

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function MusicPlayer({ id }: { id: string }) {
  const [playing, setPlaying] = React.useState(false);
  const [audioSrcs, setAudioSrcs] = React.useState<string[]>([]);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(0.5);
  const [mutedTracks, setMutedTracks] = React.useState([false, false, false, false]);
  const audioRefs = React.useRef([
    React.createRef<HTMLAudioElement>(),
    React.createRef<HTMLAudioElement>(),
    React.createRef<HTMLAudioElement>(),
    React.createRef<HTMLAudioElement>()
  ]);
  const [audioBuffers, setAudioBuffers] = React.useState<AudioBuffer[]>([]);
  const [audioContext, setAudioContext] = React.useState<AudioContext | null>(null);

  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/getAudioZip?id=${id}`)
      .then((response) => response.blob())
      .then((blob) => {
        const zip = new JSZip();
        return zip.loadAsync(blob);
      })
      .then((zip) => {
        const trackPromises = ['drums.wav', 'bass.wav', 'other.wav', 'vocals.wav'].map((track) => {
          return zip.file(track)?.async('blob');
        });
        return Promise.all(trackPromises);
      })
      .then((audioBlobs) => {
        // Create audio URLs from blobs
        const audioURLs: string[] = audioBlobs
          .filter((audioBlob) => audioBlob !== undefined) // Filter out undefined values
          .map((audioBlob) => audioBlob ? URL.createObjectURL(audioBlob) : ''); // Provide fallback value for undefined blobs
        setAudioSrcs(audioURLs);
        console.log(audioURLs);
      })
      .catch((error) => {
        console.error('Error loading audio:', error);
      });
  }, [id]);

  const handlePlayPause = () => {
    if (audioContext === null) {
      const newAudioContext = new window.AudioContext();
      setAudioContext(newAudioContext);

      const bufferPromises = audioSrcs.map((audioSrc) =>
        fetch(audioSrc)
          .then((response) => response.arrayBuffer())
          .then((buffer) => newAudioContext.decodeAudioData(buffer))
      );

      Promise.all(bufferPromises)
        .then((buffers) => {
          Promise.resolve(setAudioBuffers(buffers)).then(() => {
            audioRefs.current.forEach((audioRef) => {
              if (playing) {
                audioRef.current?.pause();
              } else {
                audioRef.current?.play();
              }
            });
          });

        })
        .catch((error) => {
          console.error('Error decoding audio data:', error);
        });
    } else {
      audioRefs.current.forEach((audioRef) => {
        if (playing) {
          audioRef.current?.pause();
        } else {
          audioRef.current?.play();
        }
      });
    }
    setPlaying(!playing);
  };

  const handleStop = () => {
    audioRefs.current.forEach((audioRef) => {
      if (audioRef.current !== null) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });
    setPlaying(false);
  };

  const handleTimeUpdate = () => {
    const currentTime = audioRefs.current[0].current?.currentTime ?? 0;
    setAudioCurrentTime(currentTime);
  };

  const handleVolumeChange = (event: Event, value: number | number[], activeThumb: number) => {
    audioRefs.current.forEach((audioRef) => {
      if (audioRef.current !== null) {
        audioRef.current.volume = Array.isArray(value) ? value[activeThumb] : value;
      }
    });
    setVolume(Array.isArray(value) ? value[activeThumb] : value);
  };

  const handleLinearProgressClick = (event: { currentTarget: { getBoundingClientRect: () => any; }; clientX: number; }) => {
    const boundingClientRect = event.currentTarget.getBoundingClientRect();
    const progressWidth = boundingClientRect.width;
    const clickX = event.clientX - boundingClientRect.left;
    const progressFraction = clickX / progressWidth;
    const newCurrentTime = progressFraction * audioDuration;

    audioRefs.current.forEach((audioRef) => {
      if (audioRef.current !== null) {
        audioRef.current.currentTime = newCurrentTime;
      }
    });

    setAudioCurrentTime(newCurrentTime);
  };

  const handleLoadedMetadata = () => {
    audioRefs.current.forEach((audioRef) => {
      if (audioRef.current !== null) {
        audioRef.current.volume = volume;
      }
    });

    const audio = audioRefs.current[0].current;
    if (audio !== null && !isNaN(audio.duration)) {
      setAudioDuration(audio.duration);
    }
  };

  const handleTrackToggle = (index: number) => {
    setMutedTracks((prevMutedTracks) => {
      const newMutedTracks = [...prevMutedTracks];
      newMutedTracks[index] = !newMutedTracks[index];
      return newMutedTracks;
    });

    const audio = audioRefs.current[index].current;
    if (audio !== null) {
      audio.muted = !audio.muted;
    }
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
        {audioSrcs.map((src, index) => (
          <audio
            key={index}
            ref={audioRefs.current[index]}
            src={src}
            onTimeUpdate={index === 0 ? handleTimeUpdate : () => {}}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ))}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          {audioBuffers.map((audioBuffer, index) => (
            <Box key={index} sx={{
              display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              color: mutedTracks[index] ? 'grey' : 'black'
            }}>
              <span style={{ marginRight: '1rem', fontFamily: 'Copperplate, fantasy' }}>{['Drums', 'Bass', 'Other', 'Vocals'][index]}</span>
              <Waveform
                audioBuffer={audioBuffer}
                onClick={() => handleTrackToggle(index)}
                progress={audioCurrentTime / audioDuration}
                visibleDuration={5} // Set the visible duration of the waveform to 5 seconds
                isMuted={mutedTracks[index]}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
