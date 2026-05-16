import { ChevronDown, Search, Truck, HelpCircle, User, ShoppingBag, BarChart3, Headphones } from "lucide-react";

export function TopNav() {
  return (
    <header className="bg-[#1e3a8a] text-white">
      <div className="flex items-center gap-4 px-4 py-2">
        <div className="flex items-center gap-1 font-bold text-xl">
          <span className="text-orange-400">🅜</span>
          <span className="italic">indiamart</span>
          <span className="text-[8px] align-top">®</span>
        </div>

        <button className="flex items-center gap-1 bg-white text-gray-700 px-3 py-2 rounded text-sm">
          Buy Leads <ChevronDown className="w-3 h-3" />
        </button>

        <div className="flex-1 flex">
          <input
            type="text"
            placeholder="Enter product / service to search"
            className="flex-1 px-3 py-2 text-sm text-gray-800 rounded-l outline-none"
          />
          <button className="bg-[#0d9e8e] hover:bg-[#0b8a7c] px-5 py-2 rounded-r text-sm font-medium flex items-center gap-1">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>

        <button className="border border-white/40 px-3 py-2 rounded text-sm font-medium">
          Buy With IndiaMART
        </button>

        <NavIcon icon={<Headphones className="w-4 h-4" />} label="Lead Manager" />
        <NavIcon icon={<BarChart3 className="w-4 h-4" />} label="BuyLeads" badge="99+" />
        <NavIcon icon={<ShoppingBag className="w-4 h-4" />} label="Products" />
        <NavIcon icon={<Truck className="w-4 h-4" />} label="Book Transport" />
        <NavIcon icon={<HelpCircle className="w-4 h-4" />} label="Help" />

        <button className="flex items-center gap-1 text-sm">
          <User className="w-4 h-4" /> Hi Sanklesh <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
}

function NavIcon({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <button className="relative flex flex-col items-center text-[11px] px-2 hover:opacity-80">
      {badge && (
        <span className="absolute -top-1 right-0 bg-orange-400 text-white text-[9px] px-1 rounded-full">
          {badge}
        </span>
      )}
      {icon}
      <span>{label}</span>
    </button>
  );
}
