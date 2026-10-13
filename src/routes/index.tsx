import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, BatteryFull, Bluetooth, Check, ChevronRight, File, Folder, Home, Layers, Lightbulb, Plus, Power, Radio, Search, SlidersHorizontal, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import tubeImage from "@/assets/led-tube.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Luma · Mis dispositivos LED" },
    { name: "description", content: "Organiza tus tubos LED, ajusta su iluminación y reúne tus dispositivos en grupos." },
    { property: "og:title", content: "Luma · Mis dispositivos LED" },
    { property: "og:description", content: "Todos tus tubos LED en un solo espacio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

type Device = { id: number; name: string; room: string; on: boolean; brightness: number; color: string; battery: number };
const initialDevices: Device[] = [
  { id: 1, name: "Tubo LED 01", room: "Estudio", on: true, brightness: 80, color: "mint", battery: 92 },
  { id: 2, name: "Tubo LED 02", room: "Estudio", on: true, brightness: 65, color: "peach", battery: 85 },
  { id: 3, name: "Tubo LED 03", room: "Salón", on: true, brightness: 100, color: "ice", battery: 100 },
  { id: 4, name: "Tubo LED 04", room: "Salón", on: false, brightness: 50, color: "mint", battery: 76 },
];

function Index() {
  const [devices, setDevices] = useState(initialDevices);
  const [tab, setTab] = useState("devices");
  const [view, setView] = useState("home");
  const [modal, setModal] = useState<"device" | "group" | null>(null);
  const [name, setName] = useState("");
  const [groups, setGroups] = useState([{ name: "Estudio", ids: [1, 2] }, { name: "Salón", ids: [3, 4] }]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: number; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = devices.filter(d => d.on).length;
  const update = (id: number, changes: Partial<Device>) => setDevices(ds => ds.map(d => d.id === id ? { ...d, ...changes } : d));
  const openModal = (kind: "device" | "group") => { setModal(kind); setName(""); setSelected([]); };
  const add = () => {
    if (!name.trim()) return;
    if (modal === "device") setDevices(ds => [...ds, { id: Date.now(), name: name.trim(), room: "Sin grupo", on: true, brightness: 80, color: "mint", battery: 100 }]);
    else { setGroups(gs => [...gs, { name: name.trim(), ids: selected }]); setTab("groups"); }
    setModal(null);
  };

  return <div className="app-shell">
    <header className="topbar">
      <a className="wordmark" href="/" aria-label="Luma inicio">luma<span className="brand-dot" /></a>
      <div className="workspace-label"><span className="status-dot" /> Mi espacio <span className="demo-label">DEMO</span></div>
      <div className="avatar" title="Mi espacio">M</div>
    </header>

    <main className="main-content">
      <div className="page-heading">
        <div><div className="eyebrow">TU LUZ, A TU MANERA</div><h1>{view === "files" ? "Mis archivos" : "Tu iluminación."}</h1><p>{view === "files" ? "Tus escenas y archivos, en un solo lugar." : "Todo conectado. Todo bajo tu control."}</p></div>
        <div className="connection-summary"><Bluetooth size={17} /><span><strong>{devices.length} dispositivos</strong><small>conectados en la demo</small></span><span className="status-dot" /></div>
      </div>

      {view === "home" ? <>
        <div className="section-toolbar">
          <div className="tabs" role="tablist" aria-label="Iluminación">
            <Button variant="ghost" role="tab" aria-selected={tab === "devices"} className={`tab ${tab === "devices" ? "selected" : ""}`} onClick={() => setTab("devices")}><Lightbulb />Mis dispositivos<span className="tab-count">{devices.length.toString().padStart(2, "0")}</span></Button>
            <Button variant="ghost" role="tab" aria-selected={tab === "groups"} className={`tab ${tab === "groups" ? "selected" : ""}`} onClick={() => setTab("groups")}><Layers />Grupos<span className="tab-count">{groups.length.toString().padStart(2, "0")}</span></Button>
          </div>
          <div className="toolbar-actions">
            <Button variant="ghost" size="icon" title="Buscar dispositivos" aria-label="Buscar dispositivos" onClick={() => setSearchOpen(s => !s)}><Search /></Button>
            <Button size="icon" className="add-button" title={tab === "groups" ? "Añadir grupo" : "Añadir dispositivo"} aria-label={tab === "groups" ? "Añadir grupo" : "Añadir dispositivo"} onClick={() => openModal(tab === "groups" ? "group" : "device")}><Plus /></Button>
          </div>
        </div>
        {searchOpen && <input autoFocus className="text-input search-input" aria-label="Buscar" placeholder="Buscar por nombre o espacio…" value={search} onChange={e => setSearch(e.target.value)} />}
        <div className="section-meta"><span>{tab === "devices" ? "DISPOSITIVOS CONECTADOS" : "TUS GRUPOS"}</span><span><span className="status-dot" />{active} encendidos</span></div>
        {tab === "devices" ? <div className="device-grid">
          {devices.filter(d => `${d.name} ${d.room}`.toLowerCase().includes(search.toLowerCase())).map(device => <article className={`device-card ${device.on ? "" : "device-off"}`} key={device.id}>
            <div className="card-top"><span className="device-status"><span className="status-dot" />Conectado</span><span className="battery"><BatteryFull size={17} />{device.battery}%</span></div>
            <div className={`tube-visual tube-${device.color}`}><img src={tubeImage} alt={`Tubo de luz ${device.name}`} width={1024} height={1024} loading="lazy" /></div>
            <div className="device-title-row"><div><h2>{device.name}</h2><span className="room-label">{device.room} <span>·</span> RGB · 1 m</span></div><Button variant="ghost" size="icon" className={`power-button ${device.on ? "is-on" : ""}`} aria-label={`${device.on ? "Apagar" : "Encender"} ${device.name}`} title={device.on ? "Apagar" : "Encender"} onClick={() => update(device.id, { on: !device.on })}><Power /></Button></div>
            <div className="brightness-label"><span><Sun size={14} />Brillo</span><span>{device.on ? device.brightness : 0}<small>%</small></span></div>
            <input className="brightness-slider" aria-label={`Brillo ${device.name}`} type="range" min="0" max="100" value={device.brightness} disabled={!device.on} onChange={e => update(device.id, { brightness: Number(e.target.value) })} />
            <div className="card-bottom"><div className="color-swatches">{["mint", "peach", "ice"].map(color => <Button key={color} variant="ghost" size="icon" className={`swatch swatch-${color} ${device.color === color ? "chosen" : ""}`} title={{ mint: "Menta", peach: "Coral", ice: "Azul hielo" }[color]} aria-label={`${color} ${device.name}`} onClick={() => update(device.id, { color })}>{device.color === color && <Check />}</Button>)}</div><span className="mode-label">Color fijo <ChevronRight size={13} /></span></div>
          </article>)}
          <Button variant="ghost" className="add-device-card" onClick={() => openModal("device")}><span className="add-circle"><Plus size={22} /></span><span>Añadir dispositivo</span><small>Una nueva luz para tu espacio</small></Button>
        </div> : <div className="group-grid">{groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase())).map((group, i) => <article className="group-card" key={`${group.name}-${i}`}><div className="group-icon"><Layers /></div><h2>{group.name}</h2><p>{group.ids.length} tubos LED</p><div className="group-members">{devices.filter(d => group.ids.includes(d.id)).map(d => <span key={d.id}>{d.name}</span>)}</div><Button variant="secondary" onClick={() => { const on = !devices.some(d => group.ids.includes(d.id) && d.on); setDevices(ds => ds.map(d => group.ids.includes(d.id) ? { ...d, on } : d)); }}><Power />{devices.some(d => group.ids.includes(d.id) && d.on) ? "Apagar grupo" : "Encender grupo"}</Button></article>)}<Button variant="ghost" className="add-device-card" onClick={() => openModal("group")}><span className="add-circle"><Plus /></span>Añadir grupo</Button></div>}
        <div className="bottom-summary"><span><Radio size={15} />Tu espacio está sincronizado</span><Button variant="ghost" className="all-off" onClick={() => setDevices(ds => ds.map(d => ({ ...d, on: active === 0 })))}><Power />{active ? "Apagar todo" : "Encender todo"}<ArrowUpRight /></Button></div>
      </> : <section className="files-section"><div className="files-heading"><h2>Biblioteca <span className="tab-count">{files.length}</span></h2><Button onClick={() => inputRef.current?.click()}><Plus />Importar archivo</Button></div><input type="file" multiple hidden ref={inputRef} onChange={e => { setFiles(fs => [...fs, ...Array.from(e.target.files ?? []).map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))]); e.target.value = ""; }} />{files.length ? files.map((file, i) => <div className="file-row" key={i}><File /><div><strong>{file.name}</strong><small>{Math.max(1, Math.round(file.size / 1024))} KB</small></div><Button variant="ghost" size="icon" asChild><a href={file.url} download={file.name} aria-label={`Descargar ${file.name}`}><ArrowDownToLine /></a></Button></div>) : <div className="empty-files"><Folder size={44} /><h3>Tu biblioteca está lista</h3><p>Aún no hay archivos.</p></div>}</section>}
    </main>

    <footer className="bottom-nav"><div className="nav-inner"><div className="nav-brand">LUMA <span>LIGHT CONTROL</span></div><nav aria-label="Navegación principal"><Button variant="ghost" className={`nav-item ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}><Home /><span>Inicio</span></Button><Button variant="ghost" className={`nav-item ${view === "files" ? "active" : ""}`} onClick={() => setView("files")}><Folder /><span>Archivos</span></Button></nav><span className="footer-status"><span className="status-dot" />Espacio demo</span></div></footer>

    {modal && <div className="modal-overlay" onClick={() => setModal(null)}><section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="add-modal" onClick={e => e.stopPropagation()}><div className="modal-heading"><h2 id="modal-title">{modal === "device" ? "Añadir dispositivo demo" : "Crear grupo"}</h2><Button variant="ghost" size="icon" aria-label="Cerrar" onClick={() => setModal(null)}><X /></Button></div><p>{modal === "device" ? "Este tubo es una simulación, no una conexión física." : "Reúne tus tubos en un mismo espacio."}</p><label htmlFor="element-name">Nombre</label><input id="element-name" autoFocus className="text-input" placeholder={modal === "device" ? "Tubo LED 05" : "Nombre del grupo"} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }} />{modal === "group" && <div className="group-options">{devices.map(d => <label key={d.id}><input type="checkbox" checked={selected.includes(d.id)} onChange={e => setSelected(ids => e.target.checked ? [...ids, d.id] : ids.filter(id => id !== d.id))} />{d.name}</label>)}</div>}<Button className="w-full" disabled={!name.trim() || (modal === "group" && !selected.length)} onClick={add}><Plus />{modal === "device" ? "Añadir tubo" : "Crear grupo"}</Button></section></div>}
  </div>;
}
