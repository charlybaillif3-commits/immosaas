import {
  IconHome,
  IconBarChart,
  IconClock,
  IconCog,
  IconCreditCard,
  IconSparkles,
} from "@/components/layout/icons";

/**
 * lib/nav-items.ts — Source de vérité unique pour la navigation
 *
 * Importé par Sidebar.tsx (desktop) et MobileSidebar.tsx (mobile)
 * pour garantir que les deux restent toujours synchronisés.
 */

export interface NavItem {
  href:   string;
  label:  string;
  icon:   React.FC<{ className?: string; "aria-hidden"?: boolean }>;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",   label: "Tableau de bord",    icon: IconHome },
  { href: "/listings",    label: "Annonces",            icon: IconHome },
  { href: "/listings/new",label: "Générer une annonce", icon: IconSparkles, badge: "IA" },
  { href: "/market",      label: "Market Analyzer",     icon: IconBarChart, badge: "IA" },
  { href: "/history",     label: "Historique",          icon: IconClock },
  { href: "/settings",    label: "Paramètres",          icon: IconCog },
  { href: "/billing",     label: "Facturation",         icon: IconCreditCard },
];
