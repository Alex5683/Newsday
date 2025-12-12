"use client";

import React, { useMemo, useState } from "react";
import { Clock, ChevronRight } from "lucide-react";

/* -----------------------
   Types & helper
   ----------------------- */
type Row = {
  id: string;
  countryCode?: string; // ISO2 code e.g. 'US'
  flagEmoji?: string; // fallback emoji icon
  name: string;
  month?: string; // used only for Commodities
  last: number | string;
  high: number | string;
  low: number | string;
  change: number;
  changePct: number;
  time: string;
  regions?: string[]; // for pill filtering
  isMajor?: boolean;
  subIndices?: string[]; // for sub-index filtering
};

function mk(
  idPrefix: string,
  i: number,
  countryCode: string | undefined,
  flagEmoji: string,
  name: string,
  base: number,
  regions: string[] = [],
  subIndices: string[] = [],
  isMajor = false,
  month?: string
): Row {
  const jitter = ((i % 7) - 3) + Math.random() * 2;
  const last = +(base + jitter).toFixed(2);
  const high = +(last + Math.random() * (Math.abs(base) * 0.02 + 5)).toFixed(2);
  const low = +(last - Math.random() * (Math.abs(base) * 0.02 + 5)).toFixed(2);
  const change = +(last - base).toFixed(2);
  const changePct = base === 0 ? 0 : +((change / base) * 100).toFixed(2);
  const hh = Math.floor(Math.random() * 24).toString().padStart(2, "0");
  const mm = Math.floor(Math.random() * 60).toString().padStart(2, "0");
  const time = `${hh}:${mm}`;
  return {
    id: `${idPrefix}-${i}`,
    countryCode,
    flagEmoji,
    name,
    month,
    last,
    high,
    low,
    change,
    changePct,
    time,
    regions,
    isMajor,
    subIndices,
  };
}

/* -----------------------
   SUB-INDEX MAP (type-safe)
   ----------------------- */
const SUB_INDEX_MAP: Record<string, string[]> = {
  Indices: ["All", "Majors", "Top Gainers", "Top Losers", "52 Week High", "52 Week Low", "Americas", "Europe", "Asia/Pacific"],
  Stocks: ["All", "Most Active", "Top Gainers", "Top Losers", "52 Week High", "52 Week Low", "Dow Jones", "S&P 500", "Nasdaq"],
  Commodities: ["All", "Real Time Futures", "Metals", "Grains", "Softs", "Energy", "Meats"],
  Currencies: ["All", "Majors", "Emerging", "Gainers", "Losers", "USD Pairs", "EUR Pairs", "Asia/Pacific"],
  ETFs: ["All", "Sector ETFs", "Country ETFs", "Top Gainers", "Top Losers", "Bond ETFs", "Commodity ETFs"],
  Bonds: ["All", "Government", "Corporate", "High Yield", "10Y", "2Y", "Gainers", "Losers"],
  Funds: ["All", "Equity Funds", "Bond Funds", "Growth Funds", "Income Funds", "Top Gainers", "Top Losers"],
  Cryptocurrency: ["All", "Top Market Cap", "Top Gainers", "Top Losers", "DeFi", "Stablecoins", "NFT Tokens"],
};

/* -----------------------
   MOCK DATA (10 entries per main tab)
   ----------------------- */
const INDICES_BASE = [
  ["US", "🇺🇸", "Dow Jones", 48704, ["Majors", "Americas", "52 Week High"]],
  ["US", "🇺🇸", "S&P 500", 6901, ["Majors", "Americas"]],
  ["US", "🇺🇸", "Nasdaq", 23593.86, ["Majors", "Americas", "52 Week Low"]],
  ["CA", "🇨🇦", "S&P/TSX", 31660.73, ["Americas"]],
  ["BR", "🇧🇷", "Bovespa", 159189, ["Americas"]],
  ["DE", "🇩🇪", "DAX", 24294.61, ["Europe", "Top Gainers"]],
  ["GB", "🇬🇧", "FTSE 100", 7700, ["Europe", "Top Losers"]],
  ["JP", "🇯🇵", "Nikkei 225", 38000, ["Asia/Pacific", "Top Gainers"]],
  ["CN", "🇨🇳", "SSE Composite", 3300, ["Asia/Pacific", "52 Week High"]],
  ["GL", "🌐", "MSCI World", 4448.87, ["Majors"]],
];
const indicesData: Row[] = INDICES_BASE.map((it, i) => mk("idx", i + 1, it[0] as string, it[1] as string, it[2] as string, Number(it[3]), ["Majors", ...((it[4] as string[]) || [])], it[4] as string[], i < 3));

const STOCKS_BASE = [
  ["US", "🇺🇸", "Apple (AAPL)", 173.5, ["Most Active", "Top Gainers", "S&P 500", "Nasdaq"]],
  ["US", "🇺🇸", "Microsoft (MSFT)", 380.2, ["Most Active", "S&P 500", "Nasdaq"]],
  ["US", "🇺🇸", "Alphabet (GOOGL)", 160.8, ["Most Active", "Top Gainers", "S&P 500", "Nasdaq"]],
  ["US", "🇺🇸", "Amazon (AMZN)", 153.4, ["Most Active", "Top Losers", "S&P 500", "Nasdaq"]],
  ["US", "🇺🇸", "Tesla (TSLA)", 189.2, ["Most Active", "Top Gainers", "S&P 500", "Nasdaq"]],
  ["JP", "🇯🇵", "Toyota (TM)", 150.7, ["52 Week High", "Most Active"]],
  ["GB", "🇬🇧", "Unilever (ULVR)", 47.8, ["52 Week Low", "Top Losers"]],
  ["DE", "🇩🇪", "Siemens (SIE)", 122.4, ["52 Week High", "Top Gainers"]],
  ["FR", "🇫🇷", "LVMH (MC)", 815.3, ["52 Week High", "Top Gainers"]],
  ["KR", "🇰🇷", "Samsung (005930.KS)", 62000, ["Most Active", "Top Gainers", "52 Week High"]],
];
const stocksData: Row[] = STOCKS_BASE.map((it, i) => mk("stk", i + 1, it[0] as string, it[1] as string, it[2] as string, Number(it[3]), ["Majors", "Americas"], it[4] as string[], i < 5));

const COMMODITIES_BASE = [
  [undefined, "🥇", "Gold", 4311.5, "Feb 26", ["Metals", "Real Time Futures"]],
  [undefined, "🪙", "Silver", 64.12, "Mar 26", ["Metals"]],
  ["US", "🇺🇸", "Crude Oil WTI", 57.99, "Jan 26", ["Energy"]],
  ["US", "🇺🇸", "Copper", 5.5125, "Mar 26", ["Metals"]],
  ["GB", "🇬🇧", "Brent Oil", 61.64, "Feb 26", ["Energy"]],
  ["US", "🇺🇸", "Natural Gas", 4.223, "Jan 26", ["Energy"]],
  ["US", "🇺🇸", "Heating Oil", 2.2499, "Jan 26", ["Energy"]],
  ["US", "🇺🇸", "US Soybeans", 1091.13, "Jan 26", ["Grains"]],
  ["US", "🇺🇸", "US Wheat", 533.1, "Mar 26", ["Grains"]],
  ["US", "🇺🇸", "Gasoline RBOB", 1.772, "Jan 26", ["Energy"]],
];
const commoditiesData: Row[] = COMMODITIES_BASE.map((it, i) => mk("cmd", i + 1, it[0] as string | undefined, it[1] as string, it[2] as string, Number(it[3]), ["Commodities"], ["Real Time Futures", ...(it[5] as string[])], false, it[4] as string));

const CURRENCIES_BASE = [
  ["US", "🇺🇸", "USD/INR", 83.21],
  ["EU", "🇪🇺", "EUR/USD", 1.089],
  ["GB", "🇬🇧", "GBP/USD", 1.27],
  ["JP", "🇯🇵", "USD/JPY", 153.34],
  ["AU", "🇦🇺", "AUD/USD", 0.67],
  ["CA", "🇨🇦", "USD/CAD", 1.35],
  ["CH", "🇨🇭", "USD/CHF", 0.9],
  ["NZ", "🇳🇿", "NZD/USD", 0.61],
  ["EU", "🇪🇺", "EUR/GBP", 0.86],
  ["SG", "🇸🇬", "SGD/USD", 0.74],
];
const currenciesData: Row[] = CURRENCIES_BASE.map((it, i) => mk("fx", i + 1, it[0] as string, it[1] as string, it[2] as string, Number(it[3]), ["Currencies"], []));

const ETFS_BASE = [
  ["US", "🇺🇸", "SPY (S&P 500 ETF)", 460.5],
  ["US", "🇺🇸", "QQQ (Nasdaq 100)", 370.2],
  ["US", "🇺🇸", "DIA (DJIA ETF)", 345.1],
  ["US", "🇺🇸", "IWM (Small Caps)", 198.4],
  ["US", "🇺🇸", "XLF (Financials)", 33.8],
  ["US", "🇺🇸", "XLK (Tech)", 185.2],
  ["EU", "🇪🇺", "EFA (Developed Mkts)", 80.5],
  ["JP", "🇯🇵", "EWJ (Japan ETF)", 55.1],
  ["CN", "🇨🇳", "FXI (China Large)", 28.4],
  ["GL", "🌐", "VXUS (Intl Stocks)", 50.9],
];
const etfData: Row[] = ETFS_BASE.map((it, i) => mk("etf", i + 1, it[0] as string, it[1] as string, it[2] as string, Number(it[3]), ["ETFs"], []));

const BONDS_BASE = [
  ["US", "🇺🇸", "US 10Y", 4.23],
  ["US", "🇺🇸", "US 2Y", 4.75],
  ["GB", "🇬🇧", "UK 10Y", 3.55],
  ["DE", "🇩🇪", "Germany 10Y", 2.45],
  ["JP", "🇯🇵", "Japan 10Y", 0.42],
  ["US", "🇺🇸", "Corporate AAA", 3.9],
  ["US", "🇺🇸", "High Yield Index", 7.2],
  ["CA", "🇨🇦", "Canada 10Y", 3.2],
  ["AU", "🇦🇺", "Australia 10Y", 4.0],
  ["IN", "🇮🇳", "India 10Y", 7.1],
];
const bondsData: Row[] = BONDS_BASE.map((it, i) => mk("bnd", i + 1, it[0] as string, it[1] as string, it[2] as string, Number(it[3]), ["Bonds"], []));

const FUNDS_BASE = [
  ["US", "🇺🇸", "Vanguard 500 Index", 380.5],
  ["US", "🇺🇸", "Fidelity Contrafund", 210.4],
  ["US", "🇺🇸", "T. Rowe Price Growth", 120.6],
  ["GB", "🇬🇧", "Baillie Gifford Global", 450.2],
  ["EU", "🇪🇺", "Amundi Europe", 78.5],
  ["AU", "🇦🇺", "Magellan Global", 220.7],
  ["JP", "🇯🇵", "Nomura Japan Fund", 18.9],
  ["CA", "🇨🇦", "RBC Canadian Fund", 27.3],
  ["DE", "🇩🇪", "DWS German Equity", 92.1],
  ["FR", "🇫🇷", "AXA World Fund", 65.0],
];
const fundData: Row[] = FUNDS_BASE.map((it, i) => mk("fnd", i + 1, it[0] as string, it[1] as string, it[2] as string, Number(it[3]), ["Funds"], []));

const CRYPTO_BASE = [
  ["", "🟠", "Bitcoin (BTC)", 41000],
  ["", "🔵", "Ethereum (ETH)", 2800],
  ["", "🟣", "Binance Coin (BNB)", 320],
  ["", "🟢", "Cardano (ADA)", 0.45],
  ["", "🔴", "XRP", 0.48],
  ["", "⚪", "Solana (SOL)", 24.5],
  ["", "🟡", "Polkadot (DOT)", 5.6],
  ["", "🔺", "Dogecoin (DOGE)", 0.067],
  ["", "🟤", "Litecoin (LTC)", 85.2],
  ["", "🔷", "Chainlink (LINK)", 11.3],
];
const cryptoData: Row[] = CRYPTO_BASE.map((it, i) => mk("cry", i + 1, it[0] as string | undefined, it[1] as string, it[2] as string, Number(it[3]), ["Cryptocurrency"], []));

/* Data map & tabs */
const dataMap: Record<string, Row[]> = {
  Indices: indicesData,
  Stocks: stocksData,
  Commodities: commoditiesData,
  Currencies: currenciesData,
  ETFs: etfData,
  Bonds: bondsData,
  Funds: fundData,
  Cryptocurrency: cryptoData,
};

const TABS = Object.keys(dataMap);
const PILL_FILTERS = ["All", "Majors", "Indices Futures", "Americas", "Europe", "Asia/Pacific", "Middle East", "Africa"];

/* -----------------------
   Flag renderer (uses FlagCDN with emoji fallback)
   ----------------------- */
function Flag({ countryCode, emoji, size = 18 }: { countryCode?: string; emoji?: string; size?: number }) {
  if (!countryCode) return <span>{emoji ?? "🏳️"}</span>;
  const cc = countryCode.toLowerCase();
  const w = size <= 18 ? "w20" : size <= 24 ? "w24" : "w32";
  const src = `https://flagcdn.com/${w}/${cc}.png`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={countryCode}
      width={size}
      height={Math.round(size * 0.75)}
      className="rounded-sm object-cover"
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        el.style.display = "none";
      }}
    />
  );
}

/* -----------------------
   Component
   ----------------------- */
export default function MarketTable(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>("Commodities"); // default demo
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [activeSub, setActiveSub] = useState<string>("All");

  const rows = dataMap[activeTab] ?? [];

  const filteredRows = useMemo(() => {
    if (!activeFilter || activeFilter === "All") return rows;
    if (activeFilter === "Majors") return rows.filter((r) => r.isMajor);
    return rows.filter((r) => r.regions?.includes(activeFilter));
  }, [rows, activeFilter]);

  const visibleRows = useMemo(() => {
    if (!activeSub || activeSub === "All") return filteredRows;
    return filteredRows.filter((r) => r.subIndices?.includes(activeSub));
  }, [filteredRows, activeSub]);

  const isCommodities = activeTab === "Commodities";

  const handleTabChange = (t: string) => {
    setActiveTab(t);
    setActiveFilter("All");
    setActiveSub("All");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-semibold">Markets</h3>
          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Top tabs */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {TABS.map((t: string) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`pb-2 ${activeTab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Pill filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {PILL_FILTERS.map((f: string) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1 rounded-full text-sm ${activeFilter === f ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-100 text-slate-700"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sub-index bar (contextual by tab) */}
      <div className="mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {(SUB_INDEX_MAP[activeTab] || ["All"]).map((s: string) => (
            <button
              key={s}
              onClick={() => setActiveSub(s)}
              className={`px-3 py-1 rounded-full text-sm ${activeSub === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Removed extra divider line to prevent double header visuals */}
      {/* Table (no horizontal lines between rows) */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-slate-600 text-left">
              <th className="py-4 pl-6">Name</th>
              {isCommodities && <th className="py-4 text-left pl-4">Month</th>}
              <th className="py-4 text-right pr-8">Last</th>
              <th className="py-4 text-right pr-8">High</th>
              <th className="py-4 text-right pr-8">Low</th>
              <th className="py-4 text-right pr-8">Chg.</th>
              <th className="py-4 text-right pr-8">Chg. %</th>
              <th className="py-4 text-right pr-6">Time</th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={isCommodities ? 8 : 7} className="text-center py-8 text-slate-500">
                  No data for <strong>{activeSub}</strong> in <strong>{activeTab}</strong>
                </td>
              </tr>
            ) : (
              visibleRows.map((r: Row, idx: number) => (
                <tr key={r.id} className={`hover:bg-slate-50`}>
                  <td className="py-5 pl-6 flex items-center gap-3 text-slate-700">
                    <div className="w-6 h-4 flex items-center">
                      <Flag countryCode={r.countryCode} emoji={r.flagEmoji} size={18} />
                    </div>
                    <span className="font-medium">{r.name}</span>
                  </td>

                  {isCommodities && <td className="py-5 text-left pl-4 text-slate-600">{r.month ?? "-"}</td>}

                  <td className="py-5 text-right pr-8 font-medium text-slate-800">{typeof r.last === "number" ? r.last.toLocaleString() : r.last}</td>
                  <td className="py-5 text-right pr-8 text-slate-600">{r.high}</td>
                  <td className="py-5 text-right pr-8 text-slate-600">{r.low}</td>

                  <td className="py-5 text-right pr-8">
                    <span className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${r.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {r.change >= 0 ? `+${r.change}` : r.change}
                    </span>
                  </td>

                  <td className="py-5 text-right pr-8">
                    <span className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${r.changePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {r.changePct >= 0 ? `+${r.changePct}%` : `${r.changePct}%`}
                    </span>
                  </td>

                  <td className="py-5 text-right pr-6 flex items-center justify-end gap-2">
                    <span className="text-xs text-slate-500">{r.time}</span>
                    <Clock size={16} className={`${r.time.includes(":") ? "text-green-500" : "text-red-500"}`} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right">
        <a className="text-blue-600 text-sm cursor-pointer">Show all {activeTab.toLowerCase()}</a>
      </div>
    </div>
  );
}
