import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FastForward, ListMusic, ZoomIn, ZoomOut, Pause, Play, Rewind, Shuffle, SkipBack, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Song = { name: string; size: number; url: string };
const BARS = 600;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export const isAudio = (name: string) => /\.(mp3|wav|m4a|aac|ogg|flac|opus|webm)$/i.test(name);

export function SongPlayer({ songs, index, onSelect, onClose }: { songs: Song[]; index: number; onSelect: (i: number) => void; onClose: () => void }) {
  const song = songs[index]!;
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [zoom, setZoom] = useState(1);
  const scroller = useRef<HTMLDivElement>(null);
  const [peaks, setPeaks] = useState<number[]>([]);

  useEffect(() => {
    setLoopA(null); setLoopB(null); setTime(0); setPeaks([]);
    let cancelled = false;
    fetch(song.url).then(r => r.arrayBuffer()).then(buf => new AudioContext().decodeAudioData(buf)).then(data => {
      const ch = data.getChannelData(0); const size = Math.floor(ch.length / BARS); const out: number[] = [];
      for (let i = 0; i < BARS; i++) { let max = 0; for (let j = i * size; j < (i + 1) * size; j += 50) max = Math.max(max, Math.abs(ch[j] ?? 0)); out.push(max); }
      const top = Math.max(...out, 0.01); if (!cancelled) setPeaks(out.map(p => p / top));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [song.url]);

  const seek = (t: number) => { if (audio.current) audio.current.currentTime = Math.max(0, Math.min(duration || 0, t)); };
  const next = () => onSelect(shuffle && songs.length > 1 ? (index + 1 + Math.floor(Math.random() * (songs.length - 1))) % songs.length : (index + 1) % songs.length);
  const prev = () => (time > 3 ? seek(0) : onSelect((index - 1 + songs.length) % songs.length));
  const toggle = () => { const a = audio.current; if (!a) return; if (a.paused) void a.play(); else a.pause(); };
  const onTime = () => {
    const a = audio.current; if (!a) return;
    if (loopA !== null && loopB !== null && a.currentTime >= loopB) a.currentTime = loopA;
    setTime(a.currentTime);
  };
  useEffect(() => { const el = scroller.current; if (!el || !duration) return; const x = (time / duration) * el.scrollWidth; if (x < el.scrollLeft || x > el.scrollLeft + el.clientWidth - 20) el.scrollLeft = x - el.clientWidth / 3; }, [time, duration, zoom]);
  const pct = (t: number | null) => (t === null || !duration ? 0 : (t / duration) * 100);
  const upNext = songs[(index + 1) % songs.length]!;

  return <Dialog.Root open onOpenChange={o => { if (!o) onClose(); }}><Dialog.Portal>
    <Dialog.Overlay className="tube-control-overlay" />
    <Dialog.Content className="tube-control-window song-player">
      <audio ref={audio} src={song.url} autoPlay onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} onTimeUpdate={onTime} onEnded={next} />
      <header className="tube-control-header"><div><Dialog.Title className="song-title">{song.name}</Dialog.Title><Dialog.Description>Reproductor</Dialog.Description></div><Button variant="ghost" size="icon" aria-label="Cerrar reproductor" onClick={onClose}><X /></Button></header>
      <div className="song-loop-row"><strong>Bucle</strong>
        <Button size="icon" variant={loopA !== null ? "default" : "outline"} aria-label="Marcar punto A" onClick={() => { setLoopA(time); if (loopB !== null && loopB <= time) setLoopB(null); }}>A</Button>
        <Button size="icon" variant={loopB !== null ? "default" : "outline"} aria-label="Marcar punto B" disabled={loopA === null} onClick={() => { if (loopA !== null && time > loopA) setLoopB(time); }}>B</Button>
        <span className="song-loop-info">{loopA !== null ? `${fmt(loopA)}${loopB !== null ? ` – ${fmt(loopB)}` : ""}` : "Sin bucle"}</span>
        <Button size="icon" variant="ghost" aria-label="Quitar bucle" disabled={loopA === null} onClick={() => { setLoopA(null); setLoopB(null); }}><X /></Button>
      </div>
      <div className="song-zoom"><Button size="icon" variant="outline" aria-label="Alejar" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z / 2))}><ZoomOut /></Button><span>{zoom}×</span><Button size="icon" variant="outline" aria-label="Acercar" disabled={zoom >= 16} onClick={() => setZoom(z => Math.min(16, z * 2))}><ZoomIn /></Button></div>
      <div className="song-wave-scroll" ref={scroller}><div className="song-wave" style={{ width: `${zoom * 100}%` }} onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * duration); }}>
        {(peaks.length ? peaks : Array.from({ length: BARS }, () => 0.08)).map((p, i) => <span key={i} className={i / BARS * 100 <= pct(time) ? "played" : ""} style={{ height: `${Math.max(4, p * 100)}%` }} />)}
        {loopA !== null && loopB !== null && <span className="song-loop-zone" style={{ left: `${pct(loopA)}%`, width: `${pct(loopB) - pct(loopA)}%` }} />}
        {loopA !== null && <span className="song-marker" style={{ left: `${pct(loopA)}%` }}><b>A</b></span>}
        {loopB !== null && <span className="song-marker" style={{ left: `${pct(loopB)}%` }}><b>B</b></span>}
        <span className="song-playhead" style={{ left: `${pct(time)}%` }} />
      </div></div>
      <div className="song-progress"><span>{fmt(time)}</span><input aria-label="Posición" type="range" min={0} max={duration || 0} step={0.1} value={time} onChange={e => seek(Number(e.target.value))} /><span>{fmt(duration)}</span></div>
      <div className="song-transport">
        <Button size="icon" variant={shuffle ? "default" : "ghost"} aria-label="Aleatorio" aria-pressed={shuffle} onClick={() => setShuffle(s => !s)}><Shuffle /></Button>
        <Button size="icon" variant="ghost" aria-label="Anterior" onClick={prev}><SkipBack /></Button>
        <Button size="icon" variant="ghost" aria-label="Retroceder 10 segundos" onClick={() => seek(time - 10)}><Rewind /></Button>
        <Button size="icon" className="song-play" aria-label={playing ? "Pausar" : "Reproducir"} onClick={toggle}>{playing ? <Pause /> : <Play />}</Button>
        <Button size="icon" variant="ghost" aria-label="Avanzar 10 segundos" onClick={() => seek(time + 10)}><FastForward /></Button>
        <Button size="icon" variant="ghost" aria-label="Siguiente" onClick={next}><SkipForward /></Button>
        <ListMusic className="song-queue-icon" />
      </div>
      {songs.length > 1 && <Button variant="ghost" className="song-next" onClick={next}><ListMusic />A continuación: {upNext.name}</Button>}
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}
