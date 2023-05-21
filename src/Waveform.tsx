import React, { useEffect, useRef, useState } from 'react';

function precomputeWaveformData(audioBuffer: { getChannelData: (arg0: number) => any; }) {
    const data = audioBuffer.getChannelData(0);
    const dataLength = data.length;

    const waveformData: { min: number; max: number; }[] = [];

    let index = 0;
    while (index < dataLength) {
        let min = 1.0;
        let max = -1.0;
        const endIndex = Math.min(index + 1024, dataLength);
        for (let j = index; j < endIndex; j++) {
            const datum = data[j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        waveformData.push({
            min: min,
            max: max
        });
        index = endIndex;
    }

    return waveformData;
}

function drawWaveform(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, waveformData: string | any[], startTime: number, endTime: number, audioBufferDuration: number, isMuted: boolean) {
    // const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);

    const startIndex = Math.floor((startTime / audioBufferDuration) * waveformData.length);
    const endIndex = Math.ceil((endTime / audioBufferDuration) * waveformData.length);
    const visibleData = waveformData.slice(startIndex, endIndex);

    const amp = height / 2;
    const xScale = width / visibleData.length;

    context.fillStyle =  isMuted ? 'grey' : 'black';
    context.beginPath();
    for (let i = 0; i < visibleData.length; i++) {
        const min = visibleData[i].min;
        const max = visibleData[i].max;
        const x = i * xScale;
        context.fillRect(x, (1 + min) * amp, xScale, Math.max(1, (max - min) * amp));
    }
}

function Waveform({ audioBuffer, onClick, progress, visibleDuration, isMuted }: {
    audioBuffer: AudioBuffer,
    onClick: () => void,
    progress: number,
    visibleDuration: number,
    isMuted: boolean
  }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const width = 500;
    const height = 100;

    const [waveformData, setWaveformData] = useState<{ min: number; max: number; }[] | null>(null);
    const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  
    useEffect(() => {
        if (canvasRef.current && audioBuffer) {
            const precomputedData = precomputeWaveformData(audioBuffer);
            setWaveformData(precomputedData);
            setCanvasContext(canvasRef.current.getContext("2d"));
        }
    }, [canvasRef, audioBuffer]);

    useEffect(() => {
        if (canvasRef.current && waveformData && canvasContext) {
            const startTime = progress * audioBuffer.duration;
            const endTime = Math.min(audioBuffer.duration, startTime + visibleDuration);
            drawWaveform(canvasContext, canvasRef.current, waveformData, startTime, endTime, audioBuffer.duration, isMuted);
        }
    }, [canvasContext, canvasRef, waveformData, audioBuffer, progress, visibleDuration, isMuted]);

    return (
        <div className="waveform" onClick={onClick}>
            <canvas ref={canvasRef} width={width} height={height} />
        </div>
    );
}

export default Waveform;