import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface WaveformVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  theme?: 'quran' | 'adhan' | 'neutral';
  height?: number;
  barWidth?: number;
  barGap?: number;
}

export default function WaveformVisualizer({
  audioElement,
  isPlaying,
  theme = 'quran',
  height = 50,
  barWidth = 4,
  barGap = 2
}: WaveformVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Pre-generate a static/organic waveform pattern (symmetric and looking like actual audio)
  const [waveHeights] = useState(() => {
    const barsCount = 50;
    const heights: number[] = [];
    for (let i = 0; i < barsCount; i++) {
      // Create a nice envelope shape (low at ends, higher in the middle with some noise)
      const x = i / (barsCount - 1);
      const envelope = Math.sin(x * Math.PI); // Sine envelope
      const noise = 0.3 + 0.7 * Math.random();
      const h = Math.max(0.1, envelope * noise);
      heights.push(h);
    }
    return heights;
  });

  // Track the audio playhead progress
  useEffect(() => {
    if (!audioElement) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      if (audioElement.duration) {
        setProgress(audioElement.currentTime / audioElement.duration);
      }
    };

    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('seeking', updateProgress);
    audioElement.addEventListener('seeked', updateProgress);

    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('seeking', updateProgress);
      audioElement.removeEventListener('seeked', updateProgress);
    };
  }, [audioElement]);

  // Handle D3 rendering and real-time oscillations while playing
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const width = containerRef.current?.clientWidth || 320;
    const padding = 10;
    const usableWidth = width - padding * 2;

    const svg = d3.select(svgElement)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none');

    // Setup color gradients based on theme
    const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
    
    // Gradient for the played (active) part
    defs.select('#active-gradient').remove();
    const activeGrad = defs.append('linearGradient')
      .attr('id', 'active-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    // Gradient for the unplayed (inactive) part
    defs.select('#inactive-gradient').remove();
    const inactiveGrad = defs.append('linearGradient')
      .attr('id', 'inactive-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    if (theme === 'quran') {
      activeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#a855f7'); // Purple-500
      activeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#ec4899'); // Pink-500

      inactiveGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3b0764'); // Deep purple
      inactiveGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1e1b4b'); // Deep indigo
    } else if (theme === 'adhan') {
      activeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b'); // Amber-500
      activeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f97316'); // Orange-500

      inactiveGrad.append('stop').attr('offset', '0%').attr('stop-color', '#451a03'); // Deep brown/amber
      inactiveGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1c1917'); // Dark slate
    } else {
      activeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981'); // Emerald-500
      activeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4'); // Cyan-500

      inactiveGrad.append('stop').attr('offset', '0%').attr('stop-color', '#064e3b'); // Dark green
      inactiveGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0f172a'); // Slate
    }

    // Number of bars we can fit
    const totalBars = waveHeights.length;
    const scaleX = d3.scaleLinear()
      .domain([0, totalBars - 1])
      .range([padding, width - padding]);

    const scaleY = d3.scaleLinear()
      .domain([0, 1])
      .range([0, height - 6]); // Leave margin for rounded caps

    // Render group
    let g = svg.select('g.bars-group');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'bars-group');
    }

    // Update function to redraw/oscillate bars
    const drawWave = (timeProgress: number, isOscillating: boolean, timeSeed: number) => {
      const barsData = waveHeights.map((h, i) => {
        let displayHeight = h;
        if (isOscillating) {
          // Add a beautiful waving effect based on time and index
          const oscillation = Math.sin(timeSeed * 0.08 + i * 0.4) * 0.15 + 
                              Math.cos(timeSeed * 0.12 - i * 0.25) * 0.1;
          displayHeight = Math.max(0.08, Math.min(1, h + oscillation));
        }
        
        const isPlayed = (i / totalBars) <= timeProgress;
        return {
          index: i,
          height: scaleY(displayHeight),
          isPlayed
        };
      });

      const bars = g.selectAll<SVGRectElement, typeof barsData[0]>('rect')
        .data(barsData, d => d.index.toString());

      // ENTER
      bars.enter()
        .append('rect')
        .attr('x', d => scaleX(d.index) - barWidth / 2)
        .attr('width', barWidth)
        .attr('rx', barWidth / 2)
        .attr('ry', barWidth / 2)
        .merge(bars as any)
        .attr('y', d => (height - d.height) / 2)
        .attr('height', d => d.height)
        .attr('fill', d => d.isPlayed ? 'url(#active-gradient)' : 'url(#inactive-gradient)')
        .attr('opacity', d => d.isPlayed ? 1 : 0.4)
        .style('cursor', 'pointer');

      bars.exit().remove();
    };

    // Animation Loop
    let lastTime = 0;
    const tick = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const progressRatio = audioElement && audioElement.duration ? (audioElement.currentTime / audioElement.duration) : progress;
      
      drawWave(progressRatio, isPlaying, timestamp / 20);
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(tick);
    } else {
      // Draw static frame
      drawWave(progress, false, 0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveHeights, progress, isPlaying, theme, height, barWidth, audioElement]);

  // Handle Seek/Scrubbing on click of the waveform
  const handleSeek = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!audioElement || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Convert to percentage
    const seekPercentage = Math.max(0, Math.min(1, clickX / width));
    
    if (audioElement.duration && isFinite(audioElement.duration)) {
      audioElement.currentTime = seekPercentage * audioElement.duration;
      setProgress(seekPercentage);
    }
  };

  return (
    <div ref={containerRef} className="w-full relative flex flex-col justify-center select-none py-1">
      <svg
        ref={svgRef}
        onClick={handleSeek}
        className="overflow-visible transition-opacity duration-300 active:brightness-110"
        style={{ touchAction: 'none' }}
      />
      {audioElement && (
        <div className="absolute right-2 bottom-[-14px] flex items-center gap-1.5 pointer-events-none">
          <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">
            {audioElement.currentTime ? formatTime(audioElement.currentTime) : '00:00'}
          </span>
          <span className="text-[8px] font-mono text-slate-600 font-bold">/</span>
          <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">
            {audioElement.duration && isFinite(audioElement.duration) ? formatTime(audioElement.duration) : '00:00'}
          </span>
        </div>
      )}
    </div>
  );
}

// Utility to format seconds to MM:SS
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
