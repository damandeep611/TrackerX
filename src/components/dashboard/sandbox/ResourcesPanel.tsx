"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Github,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchResourceMetadata } from "@/actions/sandboxActions";
import { Button } from "@/components/ui/button";
import { Card, Well } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { undoToast } from "@/components/ui/undo-toast";
import { useResourceMutations } from "@/hooks/useSandbox";
import { cn } from "@/lib/utils";
import type { SandboxResource } from "@/types/sandbox";

const TYPE_ICON = { video: Video, repo: Github, article: FileText, documentation: BookOpen } as const;
const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "To read" },
  { value: "read", label: "Done" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

const isHttpUrl = (v: string) => {
  try {
    const { protocol } = new URL(v);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Links for a sandbox: paste a URL (title + preview fetched for you), tick off what you've read. */
export function ResourcesPanel({
  sandboxId,
  resources,
}: {
  sandboxId: string;
  resources: SandboxResource[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts = {
    all: resources.length,
    unread: resources.filter((r) => r.status !== "read").length,
    read: resources.filter((r) => r.status === "read").length,
  };
  const visible = resources.filter(
    (r) => filter === "all" || (filter === "read" ? r.status === "read" : r.status !== "read")
  );

  return (
    <div className="space-y-4">
      <AddResourceBar sandboxId={sandboxId} />

      {resources.length === 0 ? (
        <EmptyState
          compact
          icon={<Link2 />}
          title="No resources yet"
          description="Paste a link to an article, video, repo or docs page you're using for this project."
        />
      ) : (
        <>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="h-8">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className="gap-1 px-2.5 text-xs">
                  {f.label}
                  <span className="tabular text-subtle-foreground">{counts[f.value]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {visible.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nothing here.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {visible.map((r) => (
                <ResourceItem key={r.id} sandboxId={sandboxId} resource={r} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function AddResourceBar({ sandboxId }: { sandboxId: string }) {
  const { add } = useResourceMutations(sandboxId);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState<{ url: string; resourceType: string; thumbnailUrl?: string } | null>(null);
  const [fetching, setFetching] = useState(false);

  const trimmed = url.trim();
  const validUrl = isHttpUrl(trimmed);

  const lookup = async (value: string) => {
    if (!isHttpUrl(value) || meta?.url === value) return;
    setFetching(true);
    try {
      const data = await fetchResourceMetadata(value);
      setMeta({ url: value, resourceType: data.resourceType, thumbnailUrl: data.thumbnailUrl || undefined });
      setTitle((t) => t || data.title);
    } catch {
      // The preview is a convenience; the user can still type a title.
    } finally {
      setFetching(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validUrl) return;
    const resourceTitle = title.trim() || hostOf(trimmed);
    add.mutate(
      {
        url: trimmed,
        title: resourceTitle,
        resourceType: meta?.url === trimmed ? meta.resourceType : "article",
        thumbnailUrl: meta?.url === trimmed ? meta.thumbnailUrl : undefined,
      },
      { onError: (err) => toast.error(err.message || "Couldn't add the resource") }
    );
    setUrl("");
    setTitle("");
    setMeta(null);
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <Well className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => lookup(trimmed)}
              onPaste={(e) => lookup(e.clipboardData.getData("text").trim())}
              placeholder="Paste a link…"
              aria-label="Resource URL"
              className="pl-9"
            />
          </div>
          <div className="relative flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={fetching ? "Fetching title…" : "Title (optional)"}
              aria-label="Resource title"
              maxLength={300}
            />
            {fetching && (
              <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button type="submit" disabled={!validUrl}>
            <Plus />
            Add
          </Button>
        </Well>
      </form>
    </Card>
  );
}

function ResourceItem({ sandboxId, resource }: { sandboxId: string; resource: SandboxResource }) {
  const { add, remove, setStatus, isTemp } = useResourceMutations(sandboxId);
  const read = resource.status === "read";
  const saving = isTemp(resource.id);
  const Icon = TYPE_ICON[resource.resourceType as keyof typeof TYPE_ICON] ?? Link2;

  const toggle = () =>
    setStatus.mutate(
      { id: resource.id, status: read ? "unread" : "read" },
      { onError: () => toast.error("Couldn't update the resource") }
    );
  const onDelete = () =>
    remove.mutate(resource.id, {
      // Reversible: Undo adds the same link back (as unread).
      onSuccess: () =>
        undoToast("Resource removed", () =>
          add.mutate(
            {
              url: resource.url,
              title: resource.title,
              resourceType: resource.resourceType,
              thumbnailUrl: resource.thumbnailUrl ?? undefined,
            },
            { onError: () => toast.error("Couldn't restore the resource") }
          )
        ),
      onError: () => toast.error("Couldn't remove the resource"),
    });

  return (
    <li>
      <Card className={cn("h-full flex-row items-center gap-3 p-2 transition-opacity", read && "opacity-60")}>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-surface-2">
            {resource.thumbnailUrl ? (
              // External, user-supplied previews: next/image would need every host allow-listed.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resource.thumbnailUrl}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              <Icon className="size-5 text-muted-foreground" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("line-clamp-2 text-sm font-medium text-foreground", read && "line-through decoration-subtle-foreground")}>
              {resource.title}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{hostOf(resource.url)}</span>
              <ExternalLink className="size-3 shrink-0 opacity-60" aria-hidden />
            </span>
          </span>
        </a>
        <div className="flex shrink-0 items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={saving}
                onClick={toggle}
                aria-label={read ? "Mark as not read" : "Mark as read"}
                aria-pressed={read}
              >
                {read ? <CheckCircle2 className="text-success" /> : <Circle />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{read ? "Mark as not read" : "Mark as read"}</TooltipContent>
          </Tooltip>
          <Button
            size="icon-sm"
            variant="destructive-ghost"
            disabled={saving}
            onClick={onDelete}
            aria-label={`Remove ${resource.title}`}
          >
            <Trash2 />
          </Button>
        </div>
      </Card>
    </li>
  );
}
