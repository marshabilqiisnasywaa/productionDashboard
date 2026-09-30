import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RepairPage = "Preassembly" | "Rework" | "Warranty" | "Abnormal";
type Direction = "lower" | "higher";

const periods = ["2025", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "W36", "W37", "W38", "W39", "28/9", "29/9", "30/9", "1/10", "2/10"];
const wipActual = [14479, 12995, 11492, 6710, 4010, 3681, 3340, 3416, 3380, 3529, 3359, 2886, 2756, 2336, 2456, null, null, null];
const wipTargets = [6000, 5600, 5600, 5600, 3550, 3550, 3550, 3550, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800];
const inputRate = [1.29, 1.46, 1.39, 1.82, 1.99, 1.02, .98, .94, .69, .92, 1.03, 1.05, .72, .52, .8, 1.5, 1.43, 1];
const preassemblyRate = [97.5, 96.3, 96.8, 98.8, 98.8, 99.5, 99.7, 99.8, 99.8, 99.7, 100, 100, 100, 100, 100];
const qaRate = [99.6, 99.8, 99.2, 99.5, 99.4, 99.5, 99.9, 99.8, 99.7, 100, 100, 100, 100, 100, 100, 100];
const frameRate = [59.4, 47.3, 45, 50.6, 64, 67.9, 70, 85.8, 94.4, 100, 100, 100, 100, 100, 100, 100];
const lcdRate = [75.7, null, null, null, 75, 69, 78.8, 86.4, 100, 100, 100, 100, 100, 100, 100];

const kpiSeed = [
  { id: "wip", name: "WIP / Inventory Qty", value: 2456, display: "2,456", unit: "pcs", target: 2800, targetLabel: "2,800 pcs", direction: "lower" as Direction },
  { id: "input", name: "Input Rate", value: 1.18, display: "1.18%", unit: "", target: 1, targetLabel: "1.00%", direction: "lower" as Direction },
  { id: "assembly", name: "Assembly Output", value: 100, display: "100.0%", unit: "", target: 99, targetLabel: "99%", direction: "higher" as Direction },
  { id: "ng", name: "NG Production Rate", value: .98, display: "0.98%", unit: "", target: 1, targetLabel: "1.00%", direction: "lower" as Direction },
  { id: "qa", name: "QA Pass Rate", value: 100, display: "100.0%", unit: "", target: 99, targetLabel: "99%", direction: "higher" as Direction },
  { id: "frame", name: "Pass Rate Repair Frame", value: 100, display: "100.0%", unit: "", target: 80, targetLabel: "80%", direction: "higher" as Direction },
  { id: "lcd", name: "Pass Rate Repair LCD", value: 100, display: "100.0%", unit: "", target: 80, targetLabel: "80%", direction: "higher" as Direction },
];

const wipProcesses = [
  { process: "Judgement Area 528", target: 1000, model: "121528", values: [2017,1872,1397,505,1025,910,770,407,227,331,290,144,82,82,92] },
  { process: "Proses Repair Pre-assembly", target: 300, model: "121516 Top Cover", values: [324,277,157,173,84,20,90,0,0,81,52,18,39,39,39] },
  { process: "Proses Repair Pre-assembly", target: 500, model: "121516 Frame", values: [1290,1457,1457,1457,1712,2144,1964,2186,3002,3049,2834,2488,2288,1868,1979] },
  { process: "Proses Repair Pre-assembly", target: 500, model: "121516 LCD", values: [2874,1415,1415,1415,145,93,29,100,0,0,91,133,147,147,180] },
];

const ngRows = [
  { label: "Standar NG Rate", values: [1,1,1,1,1,1,1], percent: true, target: 1, lower: true },
  { label: "Actual NG Rate", values: [1.29,1.46,1.39,1.82,1.99,1.02,.98], percent: true, target: 1, lower: true },
  { label: "Total NGS", values: [38674,6960,8333,5183,5891,3920,3550] },
  { label: "Actual NG Rate (NGS)", values: [1.22,1.37,1.34,1.73,1.93,.98,.94], percent: true, target: 1, lower: true },
  { label: "Total NGP", values: [1984,486,322,271,212,148,173] },
  { label: "Actual NG Rate (NGP)", values: [.06,.1,.05,.09,.07,.04,.05], percent: true, target: 1, lower: true },
  { label: "TC Preassembly", values: [27493,9217,7612,3501,3225,1175,1165] },
  { label: "NG Proses Preassembly", values: [678,337,247,43,38,6,4] },
  { label: "Passrate", values: [97.5,96.3,96.8,98.8,98.8,99.5,99.7], percent: true, target: 99, lower: false },
];

const issueSeed = [
  { no: 1, date: "30 Sep 2025", problem: "LCD flicker after assembly", improvement: "Replace connector jig", plan: "03 Oct 2025", pic: "Yusriyadi", status: "Open" },
  { no: 2, date: "29 Sep 2025", problem: "Frame gap over tolerance", improvement: "Calibration and retraining", plan: "02 Oct 2025", pic: "Andri", status: "On Progress" },
  { no: 3, date: "28 Sep 2025", problem: "Top cover scratch", improvement: "Add protective film", plan: "30 Sep 2025", pic: "Rina", status: "Done" },
];

function Glyph({ name }: { name: "calendar" | "download" | "plus" | "trend" | "close" | "upload" | "search" | "alert" }) {
  const paths = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 19h16"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    trend: <><path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 16v4h16v-4"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5m0 3h.01"/></>,
  };
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const isOnTarget = (actual: number, target: number, direction: Direction) => direction === "lower" ? actual <= target : actual >= target;

function Sparkline({ success }: { success: boolean }) {
  return <svg className="repair-spark" viewBox="0 0 112 35" preserveAspectRatio="none"><path d="M1 28 8 25 15 27 22 18 29 21 36 15 43 18 50 11 57 14 64 8 71 13 78 6 85 10 92 5 99 9 111 3" fill="none" stroke={success ? "var(--success)" : "var(--danger)"} strokeWidth="2"/><path d="M1 34V28L8 25 15 27 22 18 29 21 36 15 43 18 50 11 57 14 64 8 71 13 78 6 85 10 92 5 99 9 111 3V34Z" fill={success ? "var(--success-soft)" : "var(--danger-soft)"}/></svg>;
}

type ChartDatum = { period: string; actual: number | null; target: number };

function RepairTooltip({ active, payload, label }: { active?: boolean; payload?: readonly { payload?: ChartDatum }[]; label?: string }) {
  if (!active || !payload?.[0]?.payload) return null;
  const point = payload[0].payload;
  return <div className="repair-tooltip"><strong>{label}</strong>{point.actual === null ? <p>Belum ada data</p> : <><div><span>Target</span><b>{point.target.toLocaleString()}</b></div><div><span>Actual</span><b>{point.actual.toLocaleString()}</b></div><div><span>Selisih</span><b>{(point.actual - point.target).toLocaleString()}</b></div></>}</div>;
}

function StatusDot(props: { cx?: number; cy?: number; payload?: ChartDatum; direction: Direction }) {
  if (props.cx === undefined || props.cy === undefined || props.payload?.actual == null) return <g />;
  const good = isOnTarget(props.payload.actual, props.payload.target, props.direction);
  return <circle cx={props.cx} cy={props.cy} r="4" fill={good ? "var(--success)" : "var(--danger)"} stroke="var(--card)" strokeWidth="2" />;
}

function MetricChart({ id, title, values, target, direction, domain, full = false }: {
  id: string; title: string; values: (number | null)[]; target: number | number[]; direction: Direction; domain?: [number, number]; full?: boolean;
}) {
  const [labels, setLabels] = useState(false);
  const data: ChartDatum[] = periods.map((period, index) => ({
    period,
    actual: values[index] ?? null,
    target: Array.isArray(target) ? (target[index] ?? target[target.length - 1]) : target,
  }));
  return <article id={`chart-${id}`} className={`repair-panel metric-chart ${full ? "wide" : ""}`}>
    <div className="repair-card-head"><div><h2>{title}</h2><p>Performa aktual terhadap target • 2025</p></div><label className="label-toggle"><input type="checkbox" checked={labels} onChange={(event) => setLabels(event.target.checked)}/><span/>Tampilkan label</label></div>
    <div className="line-chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 18, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false}/>
          <XAxis dataKey="period" axisLine={false} tickLine={false} tickMargin={10} interval="preserveStartEnd"/>
          <YAxis domain={domain ?? ["auto", "auto"]} axisLine={false} tickLine={false} width={45}/>
          <Tooltip content={<RepairTooltip/>} cursor={{ stroke: "var(--line)" }}/>
          <Legend/>
          <Line type="natural" dataKey="target" name="Target" stroke="var(--success)" strokeDasharray="5 5" dot={false} strokeWidth={2} connectNulls={false}/>
          <Line type="natural" dataKey="actual" name="Actual" stroke="var(--chart-1)" strokeWidth={2} connectNulls={false} dot={(props) => <StatusDot {...props} direction={direction}/>}>
            {labels && <LabelList dataKey="actual" position="top" className="repair-point-label"/>}
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="metric-chart-footer"><strong><Glyph name="trend"/> Trending down 12% vs last week</strong><span>Target and actual for the selected reporting period</span></div>
  </article>;
}

function WipTable() {
  return <div className="repair-table-scroll"><table className="repair-data-table wip-table"><thead><tr><th className="sticky-col">Proses</th><th>T</th>{periods.slice(0,15).map((period) => <th key={period}>{period}</th>)}</tr></thead><tbody>
    <tr><td className="sticky-col"><strong>Target WIP</strong></td><td>—</td>{wipTargets.slice(0,15).map((value,index) => <td key={index}>{value.toLocaleString()}</td>)}</tr>
    <tr><td className="sticky-col"><strong>Actual WIP</strong></td><td>—</td>{wipActual.slice(0,15).map((value,index) => <td className={value !== null && value <= wipTargets[index] ? "pass-cell" : "fail-cell"} key={index}>{value?.toLocaleString() ?? "—"}</td>)}</tr>
    {wipProcesses.map((row) => <tr key={row.model}><td className="sticky-col"><strong>{row.process}</strong><small>{row.model}</small></td><td>{row.target}</td>{row.values.map((value,index) => <td className={value > row.target ? "fail-cell" : "pass-cell"} key={index}>{value.toLocaleString()}</td>)}</tr>)}
  </tbody></table></div>;
}

function NgProductionCard() {
  const miniData = ["2026","Jan","Feb","Mar","Apr","Mei","Jun"].map((period,index) => ({ period, actual: ngRows[1].values[index], target: 1 }));
  return <article className="repair-panel wide ng-panel"><div className="repair-card-head"><div><h2>NG Production Rate</h2><p>Actual NG Rate compared with standard</p></div><span className="repair-status good">Target ≤ 1.00%</span></div>
    <div className="ng-mini-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={miniData}><CartesianGrid vertical={false}/><XAxis dataKey="period" axisLine={false} tickLine={false}/><YAxis domain={[0,2.1]} axisLine={false} tickLine={false}/><Tooltip/><Legend/><Line dataKey="target" stroke="var(--success)" strokeDasharray="5 5" dot={false}/><Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2}/></LineChart></ResponsiveContainer></div>
    <div className="repair-table-scroll"><table className="repair-data-table"><thead><tr><th className="sticky-col">Metric</th>{["2026","Jan","Feb","Mar","Apr","Mei","Jun"].map((p)=><th key={p}>{p}</th>)}</tr></thead><tbody>{ngRows.map((row)=><tr key={row.label}><td className="sticky-col"><strong>{row.label}</strong></td>{row.values.map((value,index)=>{const status = row.target === undefined ? "" : ((row.lower ? value <= row.target : value >= row.target) ? "pass-cell":"fail-cell"); return <td className={status} key={index}>{value.toLocaleString()}{row.percent ? "%" : ""}</td>})}</tr>)}</tbody></table></div>
  </article>;
}

function Header({ page, onInput }: { page: string; onInput: () => void }) {
  const [periodType,setPeriodType] = useState("Harian");
  const [exportOpen,setExportOpen] = useState(false);
  return <div className="repair-header"><div><div className="repair-eyebrow">REPAIR CENTER</div><div className="repair-title-row"><h1>{page}</h1><span className="pic-chip"><span>YU</span>PIC: Yusriyadi</span></div><p>Monitor performa repair dan quality secara real-time.</p></div><div className="repair-actions">
    <div className="period-tabs">{["Harian","Mingguan","Bulanan"].map((type)=><button className={periodType===type?"active":""} onClick={()=>setPeriodType(type)} key={type}>{type}</button>)}</div>
    <button className="repair-outline"><Glyph name="calendar"/>30 Sep 2025</button>
    <div className="export-wrap"><button className="repair-outline" onClick={()=>setExportOpen(!exportOpen)}><Glyph name="download"/>Export</button>{exportOpen&&<div><button>Excel (.xlsx)</button><button>PDF</button></div>}</div>
    <button className="repair-primary" onClick={onInput}><Glyph name="plus"/>Input Data</button>
  </div></div>;
}

function InputDialog({ onClose, onSave }: { onClose: () => void; onSave: (id: string, actual: number) => void }) {
  const [tab,setTab] = useState<"manual"|"import">("manual");
  const [selectedKpi,setSelectedKpi] = useState("wip");
  return <div className="repair-modal-backdrop" onMouseDown={onClose}><form className="repair-dialog" onMouseDown={(event)=>event.stopPropagation()} onSubmit={(event)=>{event.preventDefault();const data=new FormData(event.currentTarget);onSave(String(data.get("kpi")),Number(data.get("actual")));}}>
    <div className="repair-dialog-head"><div><h2>Input Data KPI</h2><p>Tambahkan data aktual untuk periode baru.</p></div><button type="button" onClick={onClose}><Glyph name="close"/></button></div>
    <div className="dialog-tabs"><button type="button" className={tab==="manual"?"active":""} onClick={()=>setTab("manual")}>Input Manual</button><button type="button" className={tab==="import"?"active":""} onClick={()=>setTab("import")}>Import Excel</button></div>
    {tab==="manual"?<div className="repair-form"><label>Pilih KPI<select name="kpi" value={selectedKpi} onChange={(event)=>setSelectedKpi(event.target.value)}>{kpiSeed.map((kpi)=><option value={kpi.id} key={kpi.id}>{kpi.name}</option>)}</select></label><div className="form-grid"><label>Periode<input type="date" required/></label><label>Tipe<select><option>Harian</option><option>Mingguan</option><option>Bulanan</option></select></label><label>Target<input name="target" type="number" step="any" required/></label><label>Actual<input name="actual" type="number" step="any" required/></label></div>{selectedKpi==="wip"&&<div className="form-grid detail-fields"><label>Judgement Area<input type="number"/></label><label>Top Cover<input type="number"/></label><label>Frame<input type="number"/></label><label>LCD<input type="number"/></label></div>}{selectedKpi==="ng"&&<div className="form-grid detail-fields"><label>Total NGS<input type="number"/></label><label>Total NGP<input type="number"/></label><label>TC Preassembly<input type="number"/></label><label>NG Proses<input type="number"/></label></div>}<label>Catatan<textarea rows={3} placeholder="Catatan PIC..."/></label></div>:<div className="repair-dropzone"><Glyph name="upload"/><strong>Drop file Excel atau CSV di sini</strong><span>.xlsx, .xls, atau .csv maksimal 10 MB</span><input type="file" accept=".xlsx,.xls,.csv"/><div className="import-preview"><span>Preview akan tampil setelah file dipilih</span></div></div>}
    <div className="repair-dialog-actions"><button type="button" className="repair-outline" onClick={onClose}>Batal</button><button className="repair-primary">{tab==="manual"?"Simpan":"Konfirmasi Import"}</button></div>
  </form></div>;
}

function KpiSheet({ kpi, onClose, onInput }: { kpi: typeof kpiSeed[number]; onClose: () => void; onInput: () => void }) {
  const good = isOnTarget(kpi.value,kpi.target,kpi.direction);
  return <><button className="repair-sheet-overlay" onClick={onClose}/><aside className="repair-sheet"><div className="repair-dialog-head"><div><p>DETAIL KPI</p><h2>{kpi.name}</h2></div><button onClick={onClose}><Glyph name="close"/></button></div><div className="sheet-value"><strong>{kpi.display}</strong><span className={`repair-status ${good?"good":"bad"}`}>{good?"On Target":"Off Target"}</span><p>Target: {kpi.targetLabel}</p></div><MetricChart id={`sheet-${kpi.id}`} title="Trend KPI" values={inputRate} target={kpi.target} direction={kpi.direction} full/><div className="sheet-notes"><h3>Catatan PIC</h3><p>Performa dipantau harian. Follow-up dilakukan pada setiap nilai yang berada di luar target.</p></div><div className="repair-dialog-actions"><button className="repair-outline"><Glyph name="upload"/>Import Excel</button><button className="repair-primary" onClick={onInput}>Input Actual</button></div></aside></>;
}

function QualityIssues() {
  const [dialog,setDialog] = useState(false);
  const [query,setQuery] = useState("");
  const [status,setStatus] = useState("All");
  const [selected,setSelected] = useState<(typeof issueSeed)[number]|null>(null);
  const filtered=issueSeed.filter((issue)=>(status==="All"||issue.status===status)&&issue.problem.toLowerCase().includes(query.toLowerCase()));
  return <article id="quality-issues" className="repair-panel wide quality-panel"><div className="repair-card-head"><div><h2>Quality Issue</h2><p>Daftar issue terbuka dan improvement plan</p></div><button className="repair-primary" onClick={()=>setDialog(true)}><Glyph name="plus"/>Tambah Issue</button></div><div className="issue-toolbar"><label><Glyph name="search"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari problem..."/></label><select value={status} onChange={(e)=>setStatus(e.target.value)}><option>All</option><option>Open</option><option>On Progress</option><option>Done</option></select></div><div className="repair-table-scroll"><table className="repair-data-table"><thead><tr><th>No</th><th>Tanggal</th><th>Problem</th><th>Improvement</th><th>Plan</th><th>PIC</th><th>Status</th><th>Attachment</th></tr></thead><tbody>{filtered.map((issue)=><tr key={issue.no} onClick={()=>setSelected(issue)}><td>{issue.no}</td><td>{issue.date}</td><td><strong>{issue.problem}</strong></td><td>{issue.improvement}</td><td>{issue.plan}</td><td>{issue.pic}</td><td><span className={`issue-status ${issue.status.toLowerCase().replace(" ","-")}`}>{issue.status}</span></td><td><button className="attachment-thumb"><Glyph name="alert"/></button></td></tr>)}</tbody></table></div>
    {dialog&&<div className="repair-modal-backdrop" onMouseDown={()=>setDialog(false)}><form className="repair-dialog" onMouseDown={(e)=>e.stopPropagation()} onSubmit={(e)=>{e.preventDefault();setDialog(false)}}><div className="repair-dialog-head"><div><h2>Tambah Quality Issue</h2><p>Lengkapi detail issue dan improvement.</p></div><button type="button" onClick={()=>setDialog(false)}><Glyph name="close"/></button></div><div className="repair-form"><label>Tanggal<input type="date" required/></label><label>Problem<textarea rows={3} required/></label><label>Improvement<textarea rows={3}/></label><div className="form-grid"><label>Due date<input type="date"/></label><label>PIC<select><option>Yusriyadi</option><option>Andri</option><option>Rina</option></select></label><label>Status<select><option>Open</option><option>On Progress</option><option>Done</option></select></label></div><label className="repair-dropzone"><Glyph name="upload"/><strong>Upload foto</strong><span>Drag & drop atau klik untuk pilih beberapa file</span><input type="file" multiple accept="image/*"/></label></div><div className="repair-dialog-actions"><button type="button" className="repair-outline" onClick={()=>setDialog(false)}>Batal</button><button className="repair-primary">Simpan Issue</button></div></form></div>}
    {selected&&<><button className="repair-sheet-overlay" onClick={()=>setSelected(null)}/><aside className="repair-sheet issue-sheet"><div className="repair-dialog-head"><div><p>QUALITY ISSUE #{selected.no}</p><h2>{selected.problem}</h2></div><button onClick={()=>setSelected(null)}><Glyph name="close"/></button></div><dl><dt>Status</dt><dd><span className={`issue-status ${selected.status.toLowerCase().replace(" ","-")}`}>{selected.status}</span></dd><dt>Improvement</dt><dd>{selected.improvement}</dd><dt>Plan</dt><dd>{selected.plan}</dd><dt>PIC</dt><dd>{selected.pic}</dd></dl><div className="repair-dialog-actions"><button className="danger-button">Hapus</button><button className="repair-primary">Edit</button></div></aside></>}
  </article>;
}

function Preassembly() {
  const [sheetKpi,setSheetKpi] = useState<typeof kpiSeed[number]|null>(null);
  const [inputOpen,setInputOpen] = useState(false);
  const [values,setValues] = useState<Record<string,number>>({});
  const [toast,setToast] = useState(false);
  const kpis=useMemo(()=>kpiSeed.map((kpi)=>values[kpi.id]===undefined?kpi:{...kpi,value:values[kpi.id],display:kpi.unit==="pcs"?values[kpi.id].toLocaleString():`${values[kpi.id].toFixed(2)}%`}),[values]);
  const save=(id:string,actual:number)=>{setValues((current)=>({...current,[id]:actual}));setInputOpen(false);setToast(true);window.setTimeout(()=>setToast(false),2600)};
  return <><Header page="Preassembly" onInput={()=>setInputOpen(true)}/><div className="repair-kpis">{kpis.map((kpi)=>{const good=isOnTarget(kpi.value,kpi.target,kpi.direction);return <button className="repair-kpi" key={kpi.id} onClick={()=>setSheetKpi(kpi)}><div className="repair-kpi-top"><span>{kpi.name}</span><span className={`repair-status ${good?"good":"bad"}`}>{good?"On Target":"Off Target"}</span></div><strong>{kpi.display} <small>{kpi.unit}</small></strong><p>Target: {kpi.targetLabel} <b className={good?"good-text":"bad-text"}>{good?"↓":"↑"} {Math.abs(kpi.value-kpi.target).toLocaleString()}</b></p><Sparkline success={good}/></button>})}<button className="repair-kpi issue-kpi" onClick={()=>document.getElementById("quality-issues")?.scrollIntoView({behavior:"smooth"})}><div className="repair-kpi-top"><span>Quality Issue</span><span className="repair-status bad">Needs action</span></div><strong>3 <small>Open</small></strong><p>2 due this week</p><Glyph name="alert"/></button></div>
    <div className="repair-charts"><div className="repair-panel wide wip-combo"><MetricChart id="wip" title="WIP / Inventory Qty" values={wipActual} target={wipTargets} direction="lower" full/><WipTable/></div><MetricChart id="input" title="Input Rate" values={inputRate} target={1} direction="lower" domain={[0,2.1]}/><MetricChart id="assembly" title="Passrate Preassembly" values={preassemblyRate} target={99} direction="higher" domain={[95,102]}/><MetricChart id="qa" title="QA Pass Rate" values={qaRate} target={99} direction="higher" domain={[95,101]}/><MetricChart id="frame" title="Pass Rate Repair Frame" values={frameRate} target={80} direction="higher" domain={[30,120]}/><MetricChart id="lcd" title="Pass Rate Repair LCD" values={lcdRate} target={80} direction="higher" domain={[50,120]}/><NgProductionCard/><QualityIssues/></div>
    {sheetKpi&&<KpiSheet kpi={sheetKpi} onClose={()=>setSheetKpi(null)} onInput={()=>setInputOpen(true)}/>}
    {inputOpen&&<InputDialog onClose={()=>setInputOpen(false)} onSave={save}/>}
    {toast&&<div className="repair-toast"><span>✓</span>Data berhasil disimpan</div>}
  </>;
}

function Rework() {
  const [dialog,setDialog]=useState(false);
  const planning=[{date:"28 Sep",model:"A5 Pro",plan:120,actual:126},{date:"29 Sep",model:"Reno 14",plan:100,actual:94},{date:"30 Sep",model:"A5 Pro",plan:130,actual:132},{date:"1 Oct",model:"Reno 14",plan:110,actual:101}];
  return <><Header page="Rework" onInput={()=>setDialog(true)}/><div className="repair-kpis two"><button className="repair-kpi"><div className="repair-kpi-top"><span>WIP Rework</span><span className="repair-status good">On Target</span></div><strong>1,284 <small>pcs</small></strong><p>Target: 1,500 pcs</p><Sparkline success/></button><button className="repair-kpi"><div className="repair-kpi-top"><span>Planning Harian</span><span className="repair-status good">Achieved</span></div><strong>102.4%</strong><p>Target: 100%</p><Sparkline success/></button></div><div className="repair-charts"><MetricChart id="rework" title="WIP Rework" values={wipActual.map((v)=>v===null?null:Math.round(v*.45))} target={1500} direction="lower" full/><article className="repair-panel wide"><div className="repair-card-head"><div><h2>Planning Harian</h2><p>Plan vs actual output per hari</p></div><button className="repair-primary" onClick={()=>setDialog(true)}><Glyph name="plus"/>Input Planning</button></div><div className="planning-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={planning}><CartesianGrid vertical={false}/><XAxis dataKey="date" axisLine={false} tickLine={false}/><Tooltip/><Legend/><Bar dataKey="plan" name="Plan" fill="var(--chart-1)" radius={6}/><Bar dataKey="actual" name="Actual" fill="var(--chart-2)" radius={6}/></BarChart></ResponsiveContainer></div><div className="repair-table-scroll"><table className="repair-data-table"><thead><tr><th>Tanggal</th><th>Model</th><th>Plan Qty</th><th>Actual Qty</th><th>Achievement</th><th>Status</th><th>Catatan</th></tr></thead><tbody>{planning.map((row)=><tr key={row.date}><td>{row.date}</td><td>{row.model}</td><td>{row.plan}</td><td>{row.actual}</td><td><div className="achievement"><i style={{width:`${Math.min(row.actual/row.plan*100,100)}%`}}/><span>{(row.actual/row.plan*100).toFixed(1)}%</span></div></td><td><span className={`repair-status ${row.actual>=row.plan?"good":"bad"}`}>{row.actual>=row.plan?"Achieved":"Behind"}</span></td><td>Monitoring</td></tr>)}</tbody></table></div></article></div>{dialog&&<InputDialog onClose={()=>setDialog(false)} onSave={()=>setDialog(false)}/>}</>;
}

function Warranty() {
  const [dialog,setDialog]=useState(false);
  const daily=[{day:"25 Sep",input:32,off:4},{day:"26 Sep",input:41,off:6},{day:"27 Sep",input:36,off:3},{day:"28 Sep",input:48,off:8},{day:"29 Sep",input:44,off:5},{day:"30 Sep",input:52,off:7}];
  return <><Header page="Warranty" onInput={()=>setDialog(true)}/><div className="repair-kpis two"><button className="repair-kpi"><div className="repair-kpi-top"><span>Input Unit Market</span><span className="repair-status good">Active</span></div><strong>52 <small>units</small></strong><p>Hari ini</p><Sparkline success/></button><button className="repair-kpi"><div className="repair-kpi-top"><span>Phone Off</span><span className="repair-status bad">7 units</span></div><strong>13.5%</strong><p>dari input market</p><Sparkline success={false}/></button></div><div className="repair-charts"><article className="repair-panel"><div className="repair-card-head"><div><h2>Input Unit Market</h2><p>Jumlah unit masuk harian</p></div><button className="repair-primary" onClick={()=>setDialog(true)}><Glyph name="plus"/>Input</button></div><div className="warranty-chart"><ResponsiveContainer><BarChart data={daily}><CartesianGrid vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="input" fill="var(--chart-1)" radius={6}/></BarChart></ResponsiveContainer></div></article><article className="repair-panel"><div className="repair-card-head"><div><h2>Phone Off</h2><p>Temuan phone off harian</p></div><button className="repair-primary" onClick={()=>setDialog(true)}><Glyph name="plus"/>Input</button></div><div className="warranty-chart"><ResponsiveContainer><LineChart data={daily}><CartesianGrid vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false}/><Tooltip/><Line dataKey="off" stroke="var(--chart-5)" strokeWidth={2}/></LineChart></ResponsiveContainer></div></article><article className="repair-panel wide"><div className="repair-card-head"><div><h2>Warranty recap</h2><p>Rekap unit berdasarkan tanggal dan model</p></div></div><div className="repair-table-scroll"><table className="repair-data-table"><thead><tr><th>Tanggal</th><th>Model</th><th>Input Unit Market</th><th>Phone Off</th><th>Keterangan</th></tr></thead><tbody>{daily.map((row)=><tr key={row.day}><td>{row.day}</td><td>OPPO A5 Pro</td><td>{row.input}</td><td className={row.off>5?"fail-cell":"pass-cell"}>{row.off}</td><td>Warranty inspection</td></tr>)}</tbody></table></div></article></div>{dialog&&<InputDialog onClose={()=>setDialog(false)} onSave={()=>setDialog(false)}/>}</>;
}

export default function RepairDashboard({ page }: { page: RepairPage }) {
  const [loading,setLoading]=useState(true);
  useEffect(()=>{setLoading(true);const timer=window.setTimeout(()=>setLoading(false),450);return()=>window.clearTimeout(timer)},[page]);
  if(loading)return <div className="repair-skeleton"><div className="skeleton-title"/><div className="skeleton-kpis">{Array.from({length:8},(_,index)=><i key={index}/>)}</div><div className="skeleton-panels"><i/><i/><i/></div></div>;
  if (page === "Rework") return <Rework/>;
  if (page === "Warranty") return <Warranty/>;
  if (page === "Abnormal") return <div className="repair-empty"><Glyph name="alert"/><h1>Abnormal</h1><p>Slot menu sudah disiapkan. Halaman akan ditambahkan pada tahap berikutnya.</p></div>;
  return <Preassembly/>;
}
