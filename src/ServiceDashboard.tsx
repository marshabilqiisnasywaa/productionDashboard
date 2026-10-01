import { useEffect, useMemo, useState } from "react";
import {
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
import { serviceOverviewGroups, servicePages, type ServiceKpiDefinition, type ServicePageKey } from "./serviceData";

type ServiceChartItem = {
  label: string;
  target: number;
  actual: number;
};

function getStatus(current: number, target: number, higherIsBetter: boolean): "ok" | "warn" | "bad" {
  if (higherIsBetter) {
    if (current >= target) return "ok";
    if (current >= target * 0.97) return "warn";
    return "bad";
  }

  if (current <= target) return "ok";
  if (current <= target * 1.05) return "warn";
  return "bad";
}

function ServiceKpiCard({
  item,
  onSelect,
  selected,
}: {
  item: { id: string; label: string; value: number; target: number };
  onSelect: (id: string) => void;
  selected: boolean;
}) {
  const status = getStatus(item.value, item.target, item.target >= 90 || item.label.toLowerCase().includes("pass") || item.label.toLowerCase().includes("rate"));

  return (
    <button
      type="button"
      className={`oqc-metric-card status-${status} ${selected ? "service-selected" : ""}`}
      onClick={() => onSelect(item.id)}
      style={{ textAlign: "left", cursor: "pointer" }}
    >
      <span className="metric-accent" />
      <div className="oqc-metric-label">{item.label}</div>
      <div className="oqc-metric-value up">{item.value.toFixed(1)}%</div>
      <div className="oqc-metric-delta up">Target {item.target.toFixed(1)}%</div>
    </button>
  );
}

function ServiceLineChart({
  id,
  title,
  data,
  targetValue,
  targetLabel,
  actualLabel,
  yMax,
  yTicks,
  unit = "%",
  selected,
}: {
  id: string;
  title: string;
  data: ServiceChartItem[];
  targetValue: number;
  targetLabel: string;
  actualLabel: string;
  yMax: number;
  yTicks: number[];
  unit?: string;
  selected: boolean;
}) {
  const chartData = data.map((point) => ({ ...point, target: targetValue, actual: point.actual }));

  return (
    <article id={id} className={`qc-card large-card service-chart-card ${selected ? "service-chart-card-active" : ""}`}>
      <div className="qc-card-header compact">
        <div>
          <h3>{title}</h3>
        </div>
      </div>

      <div className="service-chart-shell">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 20, left: 10, bottom: 12 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "Montserrat" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={0}
              height={42}
            />
            <YAxis
              domain={[0, yMax]}
              ticks={yTicks}
              tickFormatter={(value) => `${Number(value).toFixed(2)}${unit}`}
              tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "Montserrat" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${Number(value).toFixed(2)}${unit}`, ""]}
              contentStyle={{
                background: "rgba(27, 43, 35, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: "#fff",
                boxShadow: "0 18px 36px rgba(0,0,0,0.22)",
                fontFamily: "Montserrat",
                fontSize: 12,
              }}
              labelStyle={{ color: "#fff", fontWeight: 600, fontFamily: "Montserrat" }}
              wrapperStyle={{ outline: "none" }}
              labelFormatter={(value) => value}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ paddingTop: 12, fontSize: 11, color: "var(--muted)", fontFamily: "Montserrat" }}
            />
            <Line
              type="monotone"
              dataKey="target"
              name={targetLabel}
              stroke="var(--danger)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name={actualLabel}
              stroke="var(--success)"
              strokeWidth={2.5}
              dot={{ r: 2.6, fill: "var(--success)" }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            >
              <LabelList dataKey="actual" position="top" formatter={(value: number) => `${Number(value).toFixed(2)}${unit}`} style={{ fontSize: 10, fill: "var(--muted)", fontFamily: "Montserrat" }} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function ServiceOverview() {
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = () => {
    setUpdatedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <div className="qc-page-shell">
      <header className="qc-page-header">
        <div>
          <div className="qc-kicker">Service</div>
          <h1>Service Overview</h1>
          <p>PIC: Ricky L</p>
        </div>
        <div className="qc-toolbar">
          <div className="qc-live">
            <span className="live-dot" />
            <span>Terakhir diperbarui: {updatedAt}</span>
          </div>
          <button className="qc-primary-button" onClick={refresh}>Muat Ulang</button>
        </div>
      </header>

      <div className="service-overview-grid">
        {serviceOverviewGroups.map((group) => (
          <article key={group.id} className="qc-card service-overview-card">
            <div className="qc-card-header compact">
              <div>
                <h3>{group.title}</h3>
                <p>{group.subtitle}</p>
              </div>
            </div>
            <div className="service-group-kpis">
              {group.kpis.map((item) => (
                <ServiceKpiCard
                  key={item.id}
                  item={{ ...item, target: item.target }}
                  selected={selectedId === item.id}
                  onSelect={(id) => {
                    setSelectedId(id);
                    const section = document.getElementById(`service-${id}`);
                    if (section) section.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ServicePage({ pageKey }: { pageKey: ServicePageKey }) {
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const page = servicePages[pageKey];

  useEffect(() => {
    if (!selectedChart) return;
    const block = document.getElementById(selectedChart);
    if (block) block.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedChart]);

  const cardConfigs = useMemo(() => {
    if (pageKey === "service-battery") {
      return [
        {
          id: "input-rate-battery",
          title: "Monitoring Battery Input",
          target: 2.0,
          targetLabel: "NG Rate",
          actualLabel: "Aktual NG",
          yMax: 2.5,
          yTicks: [0, 0.5, 1, 1.5, 2, 2.5],
          data: page.kpis[0].series,
        },
        {
          id: "pass-rate-repair-battery",
          title: "Repair Rate Battery",
          target: 98.0,
          targetLabel: "Standart repair",
          actualLabel: "Aktual repair",
          yMax: 100,
          yTicks: [0, 20, 40, 60, 80, 100],
          data: page.kpis[1].series,
        },
        {
          id: "pass-rate-qa-battery",
          title: "Monitoring penggunaan QA pass battery",
          target: 98.0,
          targetLabel: "NG rate",
          actualLabel: "Aktual NG",
          yMax: 100,
          yTicks: [0, 20, 40, 60, 80, 100],
          data: page.kpis[2].series,
        },
      ];
    }

    return page.kpis.map((item) => ({
      id: item.id,
      title: `Monitoring ${item.label}`,
      target: item.target,
      targetLabel: item.higherIsBetter ? "Standart" : "NG Rate",
      actualLabel: item.higherIsBetter ? "Aktual" : "Aktual NG",
      yMax: item.target >= 90 ? 100 : 2.5,
      yTicks: item.target >= 90 ? [0, 20, 40, 60, 80, 100] : [0, 0.5, 1, 1.5, 2, 2.5],
      data: item.series,
    }));
  }, [page, pageKey]);

  const pageTitle = pageKey === "service-battery" ? "Tabel Monitoring BATTERY Repair" : `Tabel Monitoring ${page.title.toUpperCase()}`;

  return (
    <div className="qc-page-shell">
      <header className="qc-page-header">
        <div>
          <div className="qc-kicker">Service / {page.title}</div>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <div className="qc-toolbar">
          <div className="qc-live">
            <span className="live-dot" />
            <span>Terakhir diperbarui: {updatedAt}</span>
          </div>
          <button className="qc-primary-button" onClick={() => setUpdatedAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))}>Muat Ulang</button>
        </div>
      </header>

      <div className="service-page-title">{pageTitle}</div>

      <div className="service-chart-grid">
        {cardConfigs.map((chart, index) => (
          <div key={chart.id} className={`service-chart-slot ${index % 2 === 1 ? "service-chart-second" : ""}`}>
            <ServiceLineChart
              id={chart.id}
              title={chart.title}
              data={chart.data}
              targetValue={chart.target}
              targetLabel={chart.targetLabel}
              actualLabel={chart.actualLabel}
              yMax={chart.yMax}
              yTicks={chart.yTicks}
              selected={selectedChart === chart.id}
            />
          </div>
        ))}
      </div>

      <div className="service-kpi-card-list">
        {page.kpis.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`oqc-metric-card status-${getStatus(item.series[item.series.length - 1].actual, item.target, item.higherIsBetter)} ${selectedChart === item.id ? "service-selected" : ""}`}
            onClick={() => {
              const target = document.getElementById(item.id);
              if (target) {
                setSelectedChart(item.id);
                target.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            style={{ textAlign: "left", cursor: "pointer" }}
          >
            <span className="metric-accent" />
            <div className="oqc-metric-label">{item.label}</div>
            <div className="oqc-metric-value up">{item.series[item.series.length - 1].actual.toFixed(1)}%</div>
            <div className="oqc-metric-delta up">Target {item.target.toFixed(1)}%</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ServiceDashboard({ pageKey }: { pageKey: ServicePageKey }) {
  if (pageKey === "service-overview") return <ServiceOverview />;
  return <ServicePage pageKey={pageKey} />;
}
