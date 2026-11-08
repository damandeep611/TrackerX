"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileProps {
  isCollapsed?: boolean;
}

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function Avatar({ src, name, size }: { src?: string | null; name?: string | null; size: number }) {
  return src ? (
    // Google avatars come from an arbitrary CDN host; a plain <img> avoids next/image config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      className="shrink-0 rounded-lg border border-border object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-[11px] font-semibold text-muted-foreground"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );
}

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-0.5 rounded-lg bg-surface-2 p-0.5">
      {THEMES.map(({ value, label, icon: Icon }) => {
        const active = hydrated && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-7 items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
              active
                ? "bg-card text-foreground shadow-panel dark:bg-surface-3"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const router = useRouter();
  const { data } = authClient.useSession();
  const user = data?.user;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-[3px] focus-visible:ring-ring data-[state=open]:bg-sidebar-accent",
          isCollapsed && "justify-center"
        )}
        aria-label="Account menu"
      >
        <Avatar src={user?.image} name={user?.name} size={32} />
        {!isCollapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-foreground">
                {user?.name ?? " "}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {user?.email ?? " "}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-subtle-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isCollapsed ? "right" : "top"}
        align={isCollapsed ? "end" : "start"}
        className="w-60"
      >
        <DropdownMenuLabel className="flex items-center gap-2.5 py-2 font-normal">
          <Avatar src={user?.image} name={user?.name} size={28} />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium">{user?.name}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{user?.email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-1 py-1.5">
          <p className="px-1 pb-1.5 text-[11px] font-medium text-subtle-foreground">Appearance</p>
          <ThemeSwitcher />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
