import {
  LayoutDashboard, UserCircle, Headphones, BarChart3, ShoppingBag,
  Image as ImageIcon, FileText, Wrench, Settings,
} from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: UserCircle, label: "Profile" },
  { icon: Headphones, label: "Lead Manager" },
  { icon: BarChart3, label: "BuyLeads", badge: "99+" },
  { icon: ShoppingBag, label: "Products", active: true },
  { icon: ImageIcon, label: "Photos & Docs" },
  { icon: FileText, label: "Invoices" },
  { icon: Wrench, label: "Buyer Tools", badge: "New" },
  { icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="w-[80px] bg-white border-r border-gray-200 flex-shrink-0">
      {items.map((it) => {
        const I = it.icon;
        return (
          <button
            key={it.label}
            className={`w-full py-3 flex flex-col items-center gap-1 text-[10px] relative ${
              it.active ? "bg-[#0d9e8e]/10 text-[#0d9e8e] border-l-2 border-[#0d9e8e]" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {it.badge && (
              <span className={`absolute top-1 right-2 text-[8px] px-1 rounded text-white ${
                it.badge === "New" ? "bg-orange-500" : "bg-gray-500"
              }`}>{it.badge}</span>
            )}
            <I className="w-5 h-5" />
            <span className="text-center leading-tight">{it.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
