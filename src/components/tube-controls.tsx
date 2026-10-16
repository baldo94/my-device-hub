import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Camera, Check, Flame, Minus, Plus, Power, Save, Star, Sun, Thermometer, TrendingDown, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TubeSettings = { mode: "CCT" | "HSI" | "RGB" | "FX"; cct: number; gm: number; hue: number; saturation: number; red: number; green: number; blue: number; effect: string | null; favorite: boolean };
export type TubePreset = { settings: TubeSettings; brightness: number };
export const defaultTubeSettings: TubeSettings = { mode: "CCT", cct: 5600, gm: 0, hue: 150, saturation: 70, red: 120, green: 255, blue: 180, effect: null, favorite: false };
const effects = [ { name: "Paparazzi", Icon: Camera }, { name: "Vela", Icon: Flame }, { name: "Curva ascendente", Icon: TrendingUp }, { name: "Curva descendente", Icon: TrendingDown } ];

function Adjustment({ label, value, min, max, step = 1, unit = "", tone = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; tone?: string; onChange: (value: number) => void }) {
  const clamp = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  return <div className={`control-adjustment ${tone}`}>
    <div className="control-label"><label>{label}</label><output>{value.toLocaleString("es-ES")}<small>{unit}</small></output></div>
    <div className="control-slider-row">
      <Button variant="outline" size="icon" aria-label={`Disminuir ${label}`} title={`Disminuir ${label}`} disabled={value <= min} onClick={() => clamp(value - step)}><Minus /></Button>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e => clamp(Number(e.target.value))} />
      <Button variant="outline" size="icon" aria-label={`Aumentar ${label}`} title={`Aumentar ${label}`} disabled={value >= max} onClick={() => clamp(value + step)}><Plus /></Button>
    </div>
    <div className="control-range"><span>{min}{unit}</span><span>{max}{unit}</span></div>
  </div>;
}

export function TubeControls({ device, scope = "tube", settings, presets, onClose, onChange, onDeviceChange, onSave, onRecall }: {
  device: { name: string; room: string; brightness: number; on: boolean };
  scope?: "tube" | "group";
  settings: TubeSettings;
  presets: Partial<Record<1 | 2, TubePreset>>;
  onClose: () => void;
  onChange: (changes: Partial<TubeSettings>) => void;
  onDeviceChange: (changes: { brightness?: number; on?: boolean }) => void;
  onSave: (slot: 1 | 2) => void;
  onRecall: (preset: TubePreset) => void;
}) {
  const [slot, setSlot] = useState<1 | 2>(1);
  const [saved, setSaved] = useState(false);
  const change = (changes: Partial<TubeSettings>) => { setSaved(false); onChange(changes); };
  const deviceChange = (changes: { brightness?: number; on?: boolean }) => { setSaved(false); onDeviceChange(changes); };
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal>
    <Dialog.Overlay className="tube-control-overlay" />
    <Dialog.Content className="tube-control-window">
      <header className="tube-control-header"><div><Dialog.Title>{device.name}</Dialog.Title><Dialog.Description>{device.room} · {scope === "group" ? "Grupo LED demo" : "Tubo LED demo"}</Dialog.Description></div><Button variant="ghost" size="icon" aria-label="Cerrar controles" title="Cerrar" onClick={onClose}><X /></Button></header>
      <div className="control-modes" role="tablist" aria-label="Modo de iluminación">{(["CCT", "HSI", "RGB", "FX"] as const).map(mode => <Button key={mode} variant="ghost" role="tab" id={`mode-${mode}`} aria-controls="tube-mode-panel" aria-selected={settings.mode === mode} className={settings.mode === mode ? "mode-active" : ""} onClick={() => change({ mode })}>{mode}</Button>)}</div>
      <div className="tube-control-body">
        <section id="tube-mode-panel" role="tabpanel" aria-labelledby={`mode-${settings.mode}`} className="mode-panel">
          <div className="control-section-title"><Sun size={15} /><span>{settings.mode === "CCT" ? "Luz blanca" : settings.mode === "HSI" ? "Tono y saturación" : settings.mode === "RGB" ? "Mezcla de color" : "Efectos de luz"}</span><span className="control-live"><span className="status-dot" />{device.on ? "Encendido" : "Apagado"}</span></div>
          <Adjustment label="Brillo" value={device.brightness} min={0} max={100} unit="%" onChange={brightness => deviceChange({ brightness })} />
          {settings.mode === "CCT" && <><Adjustment label="CCT" value={settings.cct} min={2700} max={10000} step={100} unit=" K" tone="temperature-control" onChange={cct => change({ cct })} /><Adjustment label="GM" value={settings.gm} min={-100} max={100} tone="gm-control" onChange={gm => change({ gm })} /></>}
          {settings.mode === "HSI" && <><Adjustment label="Tono" value={settings.hue} min={0} max={360} unit="°" onChange={hue => change({ hue })} /><Adjustment label="Saturación" value={settings.saturation} min={0} max={100} unit="%" onChange={saturation => change({ saturation })} /></>}
          {settings.mode === "RGB" && <>{([['red', 'Rojo'], ['green', 'Verde'], ['blue', 'Azul']] as const).map(([key, label]) => <Adjustment key={key} label={label} value={settings[key]} min={0} max={255} onChange={value => change({ [key]: value })} />)}</>}
          {settings.mode === "FX" && <div className="active-effect"><Flame size={24} /><span>{settings.effect ?? "Sin efecto"}</span></div>}
        </section>
        <section className="tube-effects" aria-label="Efectos"><div className="control-section-title"><Thermometer size={15} /><span>Efectos</span></div><div className="tube-effect-grid">{effects.map(({ name, Icon }) => <Button key={name} variant="outline" className={`tube-effect ${settings.effect === name ? "effect-active" : ""}`} aria-pressed={settings.effect === name} onClick={() => change({ effect: settings.effect === name ? null : name })}><Icon /><span>{name}</span>{settings.effect === name && <Check className="effect-check" />}</Button>)}</div></section>
      </div>
      <footer className="tube-control-footer">
        <Button variant={device.on ? "default" : "outline"} size="icon" title={`${device.on ? "Apagar" : "Encender"} ${scope === "group" ? "grupo" : "tubo"}`} aria-label={`${device.on ? "Apagar" : "Encender"} ${scope === "group" ? "grupo" : "tubo"}`} aria-pressed={device.on} onClick={() => deviceChange({ on: !device.on })}><Power /></Button>
        <div className="preset-buttons" role="group" aria-label="Memorias">{([1, 2] as const).map(number => <Button key={number} variant={slot === number ? "secondary" : "ghost"} size="icon" aria-pressed={slot === number} aria-label={`Memoria ${number}`} title={`Memoria ${number}${presets[number] ? " · guardada" : " · vacía"}`} onClick={() => { setSlot(number); setSaved(false); const preset = presets[number]; if (preset) onRecall(preset); }}>{number}{presets[number] && <span className="preset-dot" />}</Button>)}</div>
        <Button variant="ghost" size="icon" className={settings.favorite ? "favorite-active" : ""} title="Favoritos" aria-label="Favoritos" aria-pressed={settings.favorite} onClick={() => change({ favorite: !settings.favorite })}><Star fill={settings.favorite ? "currentColor" : "none"} /></Button>
        <Button className="control-save" onClick={() => { onSave(slot); setSaved(true); }}>{saved ? <Check /> : <Save />}{saved ? "Guardado" : "Guardar"}</Button>
        <span className="control-save-status" role="status">{saved ? `Memoria ${slot} guardada en la demo` : `Memoria ${slot}`}</span>
      </footer>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}