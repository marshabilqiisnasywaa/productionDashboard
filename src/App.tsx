import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import ProductionDashboard from "./ProductionDashboard";
import RepairDashboard from "./RepairDashboard";
import OqcDashboard, { type Page } from "./OqcDashboard";
import PackingDashboard from "./PackingDashboard";
import ServiceDashboard from "./ServiceDashboard";
import SqcdipDashboard from "./SqcdipDashboard";
import AssemblyDashboard, { type AssemblyPage } from "./AssemblyDashboard";
import MaterialDashboard from "./MaterialDashboard";
import type { ServicePageKey } from "./serviceData";
import CostDashboard from "./cost/CostDashboard";
import type { CostNav, CostPage } from "./cost/costData";

const ollieImage = new URL("./assets/ollie.png", import.meta.url).href;
const oppoLogo = new URL("./assets/oppo-logo.png", import.meta.url).href;
const oppoLogoDark = new URL("./assets/oppo-logo-dark.svg", import.meta.url).href;

type IconName =
  | "factory" | "grid" | "assembly" | "package" | "shield" | "wrench"
  | "warehouse" | "alert" | "search" | "bell" | "moon" | "sun"
  | "calendar" | "chevron" | "arrow" | "boxes" | "refresh" | "users"
  | "panel" | "globe" | "help" | "settings" | "chart" | "message"
  | "profile" | "billing" | "trending" | "cost";

const iconPaths: Record<IconName, React.ReactNode> = {
  factory: <><path d="M3 21h18M5 21V10l5 3V8l5 3V4h4v17" /><path d="M8 17h1m4 0h1m4 0h1" /></>,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></>,
  assembly: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15.03 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9c.13.6.65 1 1.55 1H21v4h-.08c-.9 0-1.42.4-1.52 1Z" /></>,
  package: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Zm8 4v10" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.8 7.5 9.5 4.4-1.7 7.5-4.8 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
  wrench: <><path d="M14.5 6.5a4 4 0 0 0-5-5L12 4 9 7 6.5 4.5a4 4 0 0 0 5 5L19 17a1.4 1.4 0 0 1-2 2l-7.5-7.5" /></>,
  warehouse: <><path d="m3 9 9-5 9 5v12H3V9Z" /><path d="M7 21v-8h10v8M7 16h10" /></>,
  alert: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v5m0 3h.01" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  chevron: <path d="m9 7 5 5-5 5" />,
  arrow: <><path d="M5 12h14m-5-5 5 5-5 5" /></>,
  boxes: <><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" /><path d="m4.3 6.7 7.7 4.4 7.7-4.4M12 20v-8.9" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9m16 6-2 2.5A7 7 0 0 1 5.5 15" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  panel: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.6 2.6 0 1 1 3.7 2.35c-.8.4-1.2.85-1.2 1.65m0 3h.01" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-2.9 1.21V21h-4v-.08a1.7 1.7 0 0 0-2.9-1.21l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 3.08 14H3v-4h.08a1.7 1.7 0 0 0 1.21-2.9l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 2.9 1.21l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /></>,
  chart: <><path d="M4 20V10m6 10V4m6 16v-7m5 7H2" /></>,
  message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  billing: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  trending: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  cost: <><circle cx="12" cy="12" r="8" /><path d="M12 7v10m3-7.5c-.6-.7-1.5-1-3-1-1.7 0-3 .8-3 2s1.3 2 3 2 3 .8 3 2-1.3 2-3 2c-1.5 0-2.4-.3-3-1" /></>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

const platformMenu: { label: string; icon: IconName; submenu?: string[] }[] = [
  { label: "SQCDIP", icon: "chart", submenu: ["Overview", "Abnormal Tracker"] },
  { label: "Dashboard", icon: "grid" },
  { label: "Assembly", icon: "assembly" },
  { label: "Packing", icon: "package" },
  { label: "Material", icon: "warehouse", submenu: ["Clearance Discontinue", "New Model Progress", "WO Close"] },
  { label: "QC", icon: "shield", submenu: ["FQC", "OQC", "Solusi Improvement"] },
  { label: "Service", icon: "wrench", submenu: ["Mainboard Service Rate", "Battery Service Rate", "Service External", "Qualitas"] },
  { label: "Repair", icon: "wrench", submenu: ["Preassembly", "Rework", "Warranty", "Abnormal"] },
  { label: "Cost", icon: "cost", submenu: ["Monitoring", "Losses Cost", "Cost Transfer", "Cost Improvement"] },
];

const managementMenu: { label: string; icon: IconName; submenu?: string[] }[] = [
  { label: "Messages", icon: "message" },
  { label: "Abnormality", icon: "alert" },
  { label: "Settings", icon: "settings" },
];

// Keep a single menu registry for active-item lookups and HMR-safe updates.
const menu = [...platformMenu, ...managementMenu];

const chartData = [
  { day: "Mon", actual: 2.8, capacity: 3.4 },
  { day: "Tue", actual: 3.1, capacity: 3.6 },
  { day: "Wed", actual: 2.5, capacity: 3.2 },
  { day: "Thu", actual: 3.4, capacity: 3.8 },
  { day: "Fri", actual: 2.9, capacity: 3.5 },
  { day: "Sat", actual: 2.2, capacity: 3.0 },
  { day: "Sun", actual: 2.6, capacity: 3.3 },
];

const commandGroups = [
  {
    label: "Suggestions",
    items: [
      { label: "Dashboard", icon: "grid" as IconName, shortcut: "G D" },
      { label: "My Wallet", icon: "warehouse" as IconName, shortcut: "G W" },
      { label: "Transactions", icon: "refresh" as IconName, shortcut: "G T" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Profile", icon: "profile" as IconName },
      { label: "Billing", icon: "billing" as IconName },
      { label: "Settings", icon: "settings" as IconName, shortcut: "G S" },
    ],
  },
];

const materials = [
  { name: "Battery Cell B117", id: "MAT-250614-091", category: "Battery", doh: "2.1 Days", status: "Active", owner: "AR", color: "primary" },
  { name: "PCB Mainboard P204", id: "MAT-250613-047", category: "Electronics", doh: "1.8 Days", status: "Low stock", owner: "DK", color: "violet" },
  { name: "Housing Frame H083", id: "MAT-250612-018", category: "External", doh: "3.4 Days", status: "Active", owner: "NS", color: "rose" },
  { name: "Camera Module C021", id: "MAT-250611-036", category: "Component", doh: "2.7 Days", status: "Active", owner: "RP", color: "cyan" },
];

type TooltipEntry = { name?: string; value?: number | string; color?: string };

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: readonly TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <div key={entry.name}>
          <i style={{ background: entry.color }} />
          <span>{entry.name}</span>
          <b>{Number(entry.value).toFixed(1)} days</b>
        </div>
      ))}
    </div>
  );
}

function ChartLegend({ payload }: { payload?: readonly { value?: string; color?: string }[] }) {
  return (
    <div className="chart-legend">
      {payload?.map((entry) => <span key={entry.value}><i style={{ background: entry.color }} />{entry.value}</span>)}
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [warehouseOpen, setWarehouseOpen] = useState(true);
  const [repairOpen, setRepairOpen] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState<"ID" | "EN">("ID");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [chartYear, setChartYear] = useState("2025");
  const [yearOpen, setYearOpen] = useState(false);
  const [materialPage, setMaterialPage] = useState<"material-overview" | "material-clearance" | "material-new-model" | "material-woclose">("material-overview");
  const [costPage, setCostPage] = useState<CostPage>("Monitoring");
  const [costFocus, setCostFocus] = useState<CostNav | undefined>();

  const filteredCommandGroups = useMemo(() => commandGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.label.toLowerCase().includes(commandQuery.toLowerCase())),
  })).filter((group) => group.items.length), [commandQuery]);
  const filteredCommands = filteredCommandGroups.flatMap((group) => group.items);
  const isRepairPage = ["Preassembly", "Rework", "Warranty", "Abnormal", "Abnormality"].includes(active);
  const isProductionPage = active === "Dashboard";
  const isSqcdipPage = ["Overview", "Abnormal Tracker"].includes(active);
  const isServicePage = ["service-overview", "service-mainboard", "service-battery", "service-external", "service-qualitas"].includes(active);
  const isQcPage = ["qc-achievement", "fqc", "oqc", "solusi"].includes(active);
  const isPackingPage = active === "Packing";
  const isMaterialPage = ["material-overview", "material-clearance", "material-new-model", "material-woclose"].includes(active);
  const isAssemblyPage = ["assembly-overview", "assembly-oqc", "assembly-violation", "assembly-upph", "assembly-ngp", "assembly-woclose", "assembly-wip", "assembly-rework"].includes(active);
  const isCostPage = active.startsWith("cost-");
  const isAbnormalityPage = active === "Abnormality";
  const activeBrandLogo = dark ? oppoLogoDark : oppoLogo;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarExpanded((value) => !value);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!commandOpen) return;
    const handleCommandKeys = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setCommandIndex((index) => (index + 1) % Math.max(filteredCommands.length, 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setCommandIndex((index) => (index - 1 + Math.max(filteredCommands.length, 1)) % Math.max(filteredCommands.length, 1));
      } else if (event.key === "Enter" && filteredCommands[commandIndex]) {
        event.preventDefault();
        selectMenu(filteredCommands[commandIndex].label);
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleCommandKeys);
    return () => window.removeEventListener("keydown", handleCommandKeys);
  }, [commandOpen, commandIndex, filteredCommands]);

  useEffect(() => setCommandIndex(0), [commandQuery]);

  const selectMenu = (label: string) => {
    if (label === "SQCDIP") {
      setActive("Overview");
      setMobileSidebar(false);
      return;
    }

    if (label === "Repair") {
      setActive("Preassembly");
      setMobileSidebar(false);
      return;
    }

    if (label === "Abnormality") {
      setActive("Abnormality");
      setMobileSidebar(false);
      return;
    }

    if (label === "QC") {
      setActive("qc-achievement");
      setMobileSidebar(false);
      return;
    }

    if (label === "Assembly") {
      setActive("assembly-overview");
      setMobileSidebar(false);
      return;
    }

    if (label === "FQC") {
      setActive("fqc");
      setMobileSidebar(false);
      return;
    }

    if (label === "OQC") {
      setActive("oqc");
      setMobileSidebar(false);
      return;
    }

    if (label === "Solusi Improvement") {
      setActive("solusi");
      setMobileSidebar(false);
      return;
    }

    if (label === "Material") {
      setActive("material-overview");
      setMaterialPage("material-overview");
      setMobileSidebar(false);
      return;
    }

    if (label === "Clearance Discontinue") {
      setActive("material-clearance");
      setMaterialPage("material-clearance");
      setMobileSidebar(false);
      return;
    }

    if (label === "New Model Progress") {
      setActive("material-new-model");
      setMaterialPage("material-new-model");
      setMobileSidebar(false);
      return;
    }

    if (label === "WO Close") {
      setActive("material-woclose");
      setMaterialPage("material-woclose");
      setMobileSidebar(false);
      return;
    }

    if (label === "Service") {
      setActive("service-overview");
      setMobileSidebar(false);
      return;
    }

    if (label === "Cost") {
      setActive("cost-monitoring");
      setCostPage("Monitoring");
      setCostFocus(undefined);
      setMobileSidebar(false);
      return;
    }

    if (["Monitoring", "Losses Cost", "Cost Transfer", "Cost Improvement"].includes(label)) {
      const nextPage = label as CostPage;
      setActive(`cost-${nextPage.toLowerCase().replaceAll(" ", "-")}`);
      setCostPage(nextPage);
      setCostFocus(undefined);
      setMobileSidebar(false);
      return;
    }

    if (label === "Mainboard Service Rate") {
      setActive("service-mainboard");
      setMobileSidebar(false);
      return;
    }

    if (label === "Battery Service Rate") {
      setActive("service-battery");
      setMobileSidebar(false);
      return;
    }

    if (label === "Service External") {
      setActive("service-external");
      setMobileSidebar(false);
      return;
    }

    if (label === "Qualitas") {
      setActive("service-qualitas");
      setMobileSidebar(false);
      return;
    }

    const normalized = label === "SQCDIP Overview" ? "Overview" : label;
    const exactMatch = menu.find((item) => item.label === normalized);
    const submenuMatch = menu.some((item) => item.submenu?.includes(normalized));
    setActive(submenuMatch ? normalized : (exactMatch?.label ?? normalized));
    setMobileSidebar(false);
  };

  return (
    <div className="canvas">
      <div className={`dashboard-frame ${sidebarExpanded ? "" : "sidebar-collapsed"}`}>
        {mobileSidebar && <button className="sheet-overlay" aria-label="Close navigation" onClick={() => setMobileSidebar(false)} />}
        <aside className={`sidebar ${mobileSidebar ? "sheet-open" : ""}`}>
          <button className="logo" onClick={() => setSidebarExpanded(true)} data-tooltip="OPPO workspace">
            <img className="brand-image sidebar-copy" src={activeBrandLogo} alt="OPPO" />
            <img className="ollie-image" src={ollieImage} alt="Ollie" />
            <span className="workspace-chevron">⌃⌄</span>
          </button>

          <nav>
            <div className="nav-group">
              <p>PLATFORM</p>
              {platformMenu.map((item) => {
                const isActiveParent =
                  item.label === "QC" && ["qc-achievement", "fqc", "oqc"].includes(active) ||
                  item.label === "Solusi Improvement" && active === "solusi" ||
                  item.label === "Assembly" && isAssemblyPage ||
                  item.label === "Material" && isMaterialPage ||
                  item.label === "Cost" && isCostPage ||
                  active === item.label;

                const isServiceActiveParent = item.label === "Service" && active.startsWith("service-");
                const isCurrentMenuParent = isActiveParent || isServiceActiveParent;

                return (
                  <div className="nav-entry" key={item.label}>
                    <button data-tooltip={item.label} className={isCurrentMenuParent ? "active" : ""} onClick={() => {
                      selectMenu(item.label);
                      if (item.submenu) {
                        if (item.label === "Repair") setRepairOpen((value) => !value);
                        else setWarehouseOpen((value) => !value);
                      }
                    }}>
                      <Icon name={item.icon} /><span className="sidebar-copy">{item.label}</span>
                      {item.submenu && <Icon name="chevron" size={13} />}
                    </button>
                    {item.submenu && item.label !== "Repair" && warehouseOpen && sidebarExpanded && (
                      <div className="submenu">
                        {item.submenu.map((sub) => {
                          const isCurrentSub =
                            (sub === "FQC" && active === "fqc") ||
                            (sub === "OQC" && active === "oqc") ||
                            (sub === "Solusi Improvement" && active === "solusi") ||
                            (sub === "Clearance Discontinue" && active === "material-clearance") ||
                            (sub === "New Model Progress" && active === "material-new-model") ||
                            (sub === "WO Close" && active === "material-woclose") ||
                            (sub === "Mainboard Service Rate" && active === "service-mainboard") ||
                            (sub === "Battery Service Rate" && active === "service-battery") ||
                            (sub === "Service External" && active === "service-external") ||
                            (sub === "Qualitas" && active === "service-qualitas") ||
                            (sub === "Monitoring" && active === "cost-monitoring") ||
                            (sub === "Losses Cost" && active === "cost-losses-cost") ||
                            (sub === "Cost Transfer" && active === "cost-cost-transfer") ||
                            (sub === "Cost Improvement" && active === "cost-cost-improvement");
                            

                          return (
                            <button key={sub} className={isCurrentSub ? "current" : ""} onClick={() => selectMenu(sub)}>{sub}</button>
                          );
                        })}
                      </div>
                    )}
                    {item.submenu && item.label === "Repair" && repairOpen && sidebarExpanded && (
                      <div className="submenu repair-submenu">
                        {item.submenu.map((sub) => <button key={sub} className={active === sub ? "current" : ""} onClick={() => selectMenu(sub)}>{sub}</button>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="nav-group management">
              <p>MANAGEMENT</p>
              {managementMenu.map((item) => (
                <div className="nav-entry" key={item.label}>
                  <button data-tooltip={item.label} className={active === item.label || (item.label === "Repair" && isRepairPage) ? "active" : ""} onClick={() => {
                    if (item.submenu) {
                      setRepairOpen(!repairOpen);
                      if (!isRepairPage) selectMenu("Preassembly");
                    } else selectMenu(item.label);
                  }}>
                    <Icon name={item.icon} /><span className="sidebar-copy">{item.label}</span>
                    {item.label === "Abnormality" && <b>3</b>}
                    {item.submenu && <Icon name="chevron" size={13} />}
                  </button>
                  {item.submenu && repairOpen && sidebarExpanded && <div className="submenu repair-submenu">
                    {item.submenu.map((sub) => <button key={sub} className={active === sub ? "current" : ""} onClick={() => selectMenu(sub)}>
                      {sub === "Abnormal" && <Icon name="alert" size={13} />}{sub}
                    </button>)}
                  </div>}
                </div>
              ))}
            </div>
          </nav>

          <div className="sidebar-foot">
            <button className="support-item" data-tooltip="Help & Support"><Icon name="help" /><span className="sidebar-copy">Help & Support</span></button>
            <div className="version sidebar-copy">MANUFLOW <span>v2.4.0</span></div>
          </div>
        </aside>

        <main>
          <header className="topbar">
            <div className="navbar-left">
              <button className="ghost-button sidebar-trigger" aria-label="Toggle sidebar" onClick={() => {
                if (window.innerWidth < 768) setMobileSidebar(true);
                else setSidebarExpanded(!sidebarExpanded);
              }}><Icon name="panel" size={18} /></button>
              <span className="divider" />
              <div className="breadcrumb">
                <button>Home</button>
                <Icon name="chevron" size={11} />
                <button>{isRepairPage ? "Repair" : isCostPage ? "Cost" : isServicePage ? "Service" : isQcPage ? (active === "qc-achievement" ? "QC" : active === "fqc" ? "FQC" : active === "oqc" ? "OQC" : "Solusi Improvement") : isMaterialPage ? "Material" : isAssemblyPage ? "Assembly" : active}</button>
                <Icon name="chevron" size={11} />
                <strong>{isAbnormalityPage ? "Abnormality" : isRepairPage ? active : isCostPage ? costPage : isServicePage ? (active === "service-overview" ? "Overview" : active === "service-mainboard" ? "Mainboard Service Rate" : active === "service-battery" ? "Battery Service Rate" : active === "service-external" ? "Service External" : "Qualitas") : isQcPage ? (active === "qc-achievement" ? "Pencapaian" : active === "fqc" ? "FQC" : active === "oqc" ? "OQC" : "Solusi Improvement") : isMaterialPage ? (active === "material-overview" ? "Overview" : active === "material-clearance" ? "Clearance Discontinue" : active === "material-new-model" ? "New Model Progress" : "WO Close") : isAssemblyPage ? (active === "assembly-overview" ? "Overview" : active === "assembly-oqc" ? "OQC" : active === "assembly-violation" ? "Violation" : active === "assembly-upph" ? "UPPH" : active === "assembly-ngp" ? "NG Produksi" : active === "assembly-woclose" ? "Wo Close" : active === "assembly-wip" ? "WIP" : "Rework") : "Overview"}</strong>
              </div>
            </div>
            <div className="navbar-right">
              <button className="command-search" onClick={() => setCommandOpen(true)}><Icon name="search" size={16} /><span>Search...</span><kbd>{navigator.platform.includes("Mac") ? "⌘K" : "Ctrl K"}</kbd></button>
              <div className="language-wrap">
                <button className="ghost-button language-button" onClick={() => setLanguageOpen(!languageOpen)}><Icon name="globe" size={17} /><span>{language}</span></button>
                {languageOpen && <div className="language-menu">
                  <button onClick={() => { setLanguage("ID"); setLanguageOpen(false); }}><span>🇮🇩 Bahasa Indonesia</span>{language === "ID" && <b>✓</b>}</button>
                  <button onClick={() => { setLanguage("EN"); setLanguageOpen(false); }}><span>🇬🇧 English</span>{language === "EN" && <b>✓</b>}</button>
                </div>}
              </div>
              <button className="ghost-button theme-button" onClick={() => setDark(!dark)} aria-label="Switch theme"><Icon name={dark ? "sun" : "moon"} size={17} /></button>
              <button className="ghost-button notification" aria-label="Notifications"><Icon name="bell" size={18} /><i /></button>
              <span className="divider" />
              <button className="profile-button">
                <span className="avatar">MB</span>
                <span className="account-copy"><strong>Marsha Bilqiis</strong><small>marsha@manuflow.id</small></span>
                <Icon name="chevron" size={13} />
              </button>
            </div>
          </header>

          <section className={`content ${isRepairPage ? "repair-content" : ""}`}>
            {isRepairPage ? <RepairDashboard page={isAbnormalityPage ? "Abnormal" : (active as "Preassembly" | "Rework" | "Warranty" | "Abnormal")} /> : isProductionPage ? <ProductionDashboard onNavigate={(page) => selectMenu(page)} /> : isPackingPage ? <PackingDashboard /> : isMaterialPage ? <MaterialDashboard page={materialPage} onNavigate={(nextPage) => { setMaterialPage(nextPage as typeof materialPage); setActive(nextPage); }} /> : isCostPage ? <CostDashboard page={costPage} focus={costFocus} onNavigate={(nextPage, nav) => { setCostPage(nextPage); setCostFocus(nav); setActive(`cost-${nextPage.toLowerCase().replaceAll(" ", "-")}`); }} /> : isSqcdipPage ? <SqcdipDashboard page={active === "Abnormal Tracker" ? "Abnormal Tracker" : "Overview"} onOpenCost={(page, nav) => { setCostPage(page); setCostFocus(nav); setActive(`cost-${page.toLowerCase().replaceAll(" ", "-")}`); }} /> : isServicePage ? <ServiceDashboard pageKey={active as ServicePageKey} /> : isQcPage ? <OqcDashboard page={active as Page} onPageChange={(nextPage) => setActive(nextPage)} /> : isAssemblyPage ? <AssemblyDashboard page={active as AssemblyPage} /> : <>
            <div className="page-heading">
              <div><p>WAREHOUSE ANALYTICS</p><h1>Material overview</h1><span>Track inventory health and clearance performance.</span></div>
              <div className="range-wrap">
                <button className="filter-pill" onClick={() => setRangeOpen(!rangeOpen)}><Icon name="calendar" size={15} />Jun 10 – Jun 16<Icon name="chevron" size={12} /></button>
                {rangeOpen && <div className="range-menu"><button>This week</button><button>Last 30 days</button><button>This quarter</button></div>}
              </div>
            </div>

            <div className="bento-top">
              <div className="stat-stack">
                <article className="glass-card stat-card focus-card">
                  <div className="card-icon"><Icon name="boxes" /></div>
                  <div className="stat-copy"><span>Inventory DOH</span><strong>2.4 <small>Days</small></strong><p><b>↓ 20%</b> from target 3.0 days</p></div>
                  <span className="status active">Active</span>
                </article>
                <article className="glass-card stat-card">
                  <div className="card-icon warm"><Icon name="refresh" /></div>
                  <div className="stat-copy"><span>Clearance frequency</span><strong>12× <small>/ Week</small></strong><p><b>↑ 9.1%</b> from last week</p></div>
                  <span className="status active">On track</span>
                </article>
              </div>

              <article className="glass-card chart-card">
                <div className="card-head">
                  <div><h2>Inventory coverage</h2><p>Days on hand performance by day</p></div>
                  <div className="year-filter">
                    <button onClick={() => setYearOpen(!yearOpen)}>{chartYear}<Icon name="chevron" size={12} /></button>
                    {yearOpen && <div>{["2025", "2024", "2023"].map((year) => <button key={year} onClick={() => { setChartYear(year); setYearOpen(false); }}>{year}{chartYear === year && <b>✓</b>}</button>)}</div>}
                  </div>
                </div>
                <div className="recharts-wrap" onMouseLeave={() => setActiveBar(null)}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={4} barCategoryGap="28%" onMouseMove={(state) => setActiveBar(typeof state?.activeTooltipIndex === "number" ? state.activeTooltipIndex : null)}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--chart-cursor)" }} />
                      <Legend verticalAlign="bottom" content={<ChartLegend />} />
                      <Bar dataKey="actual" name="Actual" fill="var(--chart-1)" radius={6} maxBarSize={28}>
                        {chartData.map((item, index) => <Cell key={`actual-${item.day}`} opacity={activeBar === null || activeBar === index ? 1 : .6} />)}
                      </Bar>
                      <Bar dataKey="capacity" name="Capacity" fill="var(--chart-2)" radius={6} maxBarSize={28}>
                        {chartData.map((item, index) => <Cell key={`capacity-${item.day}`} opacity={activeBar === null || activeBar === index ? 1 : .6} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-footer"><strong>Trending up by 5.2% this month <Icon name="trending" size={13} /></strong><span>Showing inventory coverage for the last 7 days</span></div>
              </article>
            </div>

            <div className="bento-bottom">
              <article className="glass-card summary-card">
                <div className="card-head"><div><h2>Warehouse summary</h2><p>Live material flow status</p></div><button>View report <Icon name="arrow" size={14} /></button></div>
                <div className="summary-body">
                  <div className="donut"><span><strong>94%</strong><small>Optimized</small></span></div>
                  <div className="summary-list">
                    <div><span><i className="green" />Regular material pull</span><strong>12</strong></div>
                    <div><span><i className="primary" />Optimized inventory</span><strong>8</strong></div>
                    <div><span><i className="orange" />Urgent restocking</span><strong>2</strong></div>
                  </div>
                </div>
              </article>

              <article className="glass-card team-card">
                <div className="card-head"><div><h2>Warehouse activity</h2><p>Team and clearance progress</p></div><span className="live"><i />Live</span></div>
                <div className="activity-metrics">
                  <div><Icon name="users" /><span>Active team<strong>18</strong></span></div>
                  <div><Icon name="package" /><span>Clearances today<strong>7</strong></span></div>
                  <div><Icon name="alert" /><span>Multi-clearance<strong className="orange-text">2</strong></span></div>
                </div>
                <div className="activity-foot"><div className="avatar-stack"><span>AR</span><span>DK</span><span>NS</span><span>+5</span></div><p>8 operators currently active</p><button>Manage team</button></div>
              </article>
            </div>

            <article className="glass-card table-card">
              <div className="card-head"><div><h2>Material inventory</h2><p>Current stock and clearance status</p></div><button>View all materials <Icon name="arrow" size={14} /></button></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>MATERIAL / BATCH</th><th>CATEGORY</th><th>INVENTORY DOH</th><th>STATUS</th><th>OWNER</th><th /></tr></thead>
                  <tbody>
                    {materials.map((item) => <tr key={item.id}>
                      <td><strong>{item.name}</strong><small>{item.id}</small></td>
                      <td>{item.category}</td><td>{item.doh}</td>
                      <td><span className={`row-status ${item.status === "Low stock" ? "inactive" : ""}`}><i />{item.status}</span></td>
                      <td><span className={`owner ${item.color}`}>{item.owner}</span></td><td>•••</td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </article>
            </>}
          </section>
        </main>
      </div>
      {commandOpen && (
        <div className="command-overlay" role="presentation" onMouseDown={() => setCommandOpen(false)}>
          <div className="command-dialog" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}>
            <label className="command-input">
              <Icon name="search" size={18} />
              <input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Type a command or search..." />
              <kbd>ESC</kbd>
            </label>
            <div className="command-results">
              {filteredCommandGroups.length ? filteredCommandGroups.map((group) => (
                <div className="command-group" key={group.label}>
                  <p>{group.label}</p>
                  {group.items.map((item) => {
                    const itemIndex = filteredCommands.findIndex((command) => command.label === item.label);
                    return <button key={item.label} className={commandIndex === itemIndex ? "selected" : ""} onMouseEnter={() => setCommandIndex(itemIndex)} onClick={() => { selectMenu(item.label); setCommandOpen(false); }}>
                      <Icon name={item.icon} size={17} /><span>{item.label}</span>{item.shortcut && <kbd>{item.shortcut}</kbd>}
                    </button>;
                  })}
                </div>
              )) : <div className="command-empty">No results found.</div>}
            </div>
            <div className="command-footer"><span><b>↑↓</b> navigate</span><span><b>↵</b> select</span><span><b>esc</b> close</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
