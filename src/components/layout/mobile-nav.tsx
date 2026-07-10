"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Flag, CalendarDays, ClipboardList, LineChart, Settings, Target, Trophy } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Weekly Planner", href: "/planner", icon: CalendarDays },
  { label: "Session Logger", href: "/sessions", icon: ClipboardList },
  { label: "Drill Library", href: "/drills", icon: Target },
  { label: "Goals", href: "/goals", icon: Trophy },
  { label: "Progress", href: "/dashboard", icon: LineChart },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[264px] p-0">
        <SheetHeader className="flex h-[88px] flex-row items-center gap-3 border-b border-border px-6">
          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[3px] bg-primary"
            style={{ boxShadow: "0 0 16px rgba(163,230,53,.65)" }}
          >
            <Flag className="h-[14px] w-[14px] text-primary-foreground" aria-hidden />
          </div>
          <SheetTitle className="text-[19px] font-black uppercase tracking-[.16em] text-foreground">
            FAIRWAY
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Main navigation" className="flex-1 space-y-0.5 px-[14px] py-[18px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-[13px] rounded-[9px] px-[15px] py-3 text-[14px] font-bold transition-all",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground/80",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-[15%] h-[70%] w-[3px] rounded-r-full bg-primary" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
