import type { Metadata } from "next";

export const metadata: Metadata = { title: "Historique IA" };

type ActionType = "generate_listing" | "analyze_market" | "generate_description";

interface HistoryEntry {
  id: string;
  action_type: ActionType;
  detail: string;
  tokens_used: number;
  model: string;
  created_at: string;
}

const ACTION_LABELS: Record<ActionType, string> = {
  generate_listing:     "Annonce générée",
  analyze_market:       "Analyse de marché",
  generate_description: "Description générée",
};

const ACTION_COLORS: Record<ActionType, string> = {
  generate_listing:     "bg-indigo-500/10 text-indigo-400",
  analyze_market:       "bg-violet-500/10 text-violet-400",
  generate_description: "bg-emerald-500/10 text-emerald-400",
};

const MOCK_HISTORY: HistoryEntry[] = [
  { id: "1", action_type: "generate_listing",     detail: "Appartement T3 – Paris 15e",      tokens_used: 420, model: "gpt-4o-mini", created_at: "2026-05-08T10:30:00Z" },
  { id: "2", action_type: "analyze_market",       detail: "Lyon 6e – Appartements",          tokens_used: 810, model: "gpt-4o-mini", created_at: "2026-05-08T07:15:00Z" },
  { id: "3", action_type: "generate_listing",     detail: "Maison 5 pièces – Lyon 6e",       tokens_used: 395, model: "gpt-4o-mini", created_at: "2026-05-07T16:45:00Z" },
  { id: "4", action_type: "generate_description", detail: "Studio meublé – Bordeaux Centre",  tokens_used: 280, model: "gpt-4o-mini", created_at: "2026-05-07T09:00:00Z" },
  { id: "5", action_type: "analyze_market",       detail: "Bordeaux – Maisons",              tokens_used: 920, model: "gpt-4o-mini", created_at: "2026-05-06T14:30:00Z" },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function HistoryPage() {
  const totalTokens = MOCK_HISTORY.reduce((sum, e) => sum + e.tokens_used, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Historique IA</h1>
        <p className="mt-1 text-sm text-white/40">
          Toutes vos générations et analyses des 30 derniers jours.
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Actions ce mois", value: String(MOCK_HISTORY.length) },
          { label: "Tokens consommés", value: totalTokens.toLocaleString("fr-FR") },
          { label: "Modèle utilisé", value: "GPT-4o mini" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#0d0d14] px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/30">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0d14]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Action", "Détail", "Tokens", "Modèle", "Date"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white/30">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {MOCK_HISTORY.map((entry) => (
              <tr key={entry.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-3.5">
                  <span className={["rounded-full px-2.5 py-1 text-[11px] font-semibold", ACTION_COLORS[entry.action_type]].join(" ")}>
                    {ACTION_LABELS[entry.action_type]}
                  </span>
                </td>
                <td className="max-w-[220px] truncate px-5 py-3.5 text-[13px] text-white/60">
                  {entry.detail}
                </td>
                <td className="px-5 py-3.5 text-[13px] tabular-nums text-white/50">
                  {entry.tokens_used.toLocaleString("fr-FR")}
                </td>
                <td className="px-5 py-3.5 text-[13px] text-white/30">{entry.model}</td>
                <td className="px-5 py-3.5 text-[13px] text-white/30">{formatDate(entry.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
