"use client";

import Image from "next/image";
import { ExternalLink, Play, Youtube } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CATEGORY_CONFIG,
  DIFFICULTY_CONFIG,
  getDrillThumbnail,
  type Drill,
} from "@/features/drills/data";

interface DrillCardProps {
  drill: Drill;
}

export function DrillCard({ drill }: DrillCardProps) {
  const category = CATEGORY_CONFIG[drill.category];
  const difficulty = DIFFICULTY_CONFIG[drill.difficulty];
  const thumbnail = getDrillThumbnail(drill);

  return (
    <div
      style={{ borderLeft: `3px solid ${category.color}` }}
      className="flex flex-col overflow-hidden rounded-[9px] border border-border/40"
    >
      {/* Thumbnail */}
      <a
        href={drill.source.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${drill.title} on ${drill.source.label}`}
        className="group relative block aspect-video w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={drill.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2"
            style={{ background: category.bg }}
          >
            <Play
              className="h-8 w-8 transition-transform duration-200 group-hover:scale-110"
              style={{ color: category.color }}
              aria-hidden
            />
            <span
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: category.color }}
            >
              {drill.source.type === "instagram"
                ? "Instagram"
                : drill.source.type === "tiktok"
                  ? "TikTok"
                  : "Video"}
            </span>
          </div>
        )}

        {/* Play overlay on hover for YouTube */}
        {thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/0 transition-all duration-200 group-hover:bg-white/90">
              <Play className="h-5 w-5 translate-x-0.5 text-black opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
            </div>
          </div>
        )}
      </a>

      {/* Content */}
      <div
        className="flex flex-col gap-3 p-4"
        style={{ background: category.bg }}
      >
        {/* Category + difficulty */}
        <div className="flex items-start justify-between gap-2">
          <span
            style={{ color: category.color }}
            className="text-[9px] font-black uppercase tracking-[.08em]"
          >
            {category.label}
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-wide", difficulty.className)}>
            {difficulty.label}
          </span>
        </div>

        {/* Title */}
        <div className="text-[13.5px] font-bold leading-snug text-foreground">
          {drill.title}
        </div>

        {/* Description */}
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          {drill.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {drill.tags.map((tag) => (
            <span
              key={tag}
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center gap-2 border-t border-border/50 pt-3">
          {drill.source.type === "youtube" ? (
            <Youtube className="h-3.5 w-3.5 shrink-0 text-[#ff0000]" aria-hidden />
          ) : drill.source.type === "tiktok" ? (
            <span className="text-[10px] font-black tracking-wider text-foreground">TT</span>
          ) : (
            <span className="text-[10px] font-black tracking-wider text-[#e1306c]">IG</span>
          )}
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-muted-foreground">
            {drill.source.label}
          </span>
          <span className="text-[11px] text-muted-foreground">~{drill.durationMin} min</span>
          <a
            href={drill.source.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${drill.title} on ${drill.source.label}`}
            className={cn(
              "flex h-7 items-center gap-1 rounded-[5px] px-2 text-[11px] font-bold transition-colors",
              "bg-background/60 text-foreground hover:bg-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            Watch
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}
