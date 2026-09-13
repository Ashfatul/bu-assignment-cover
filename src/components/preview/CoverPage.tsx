"use client";

import { forwardRef } from "react";

import { EmptyHint } from "@/components/preview/parts";
import { Watermark } from "@/components/preview/Watermark";
import { ClassicBordered } from "@/components/preview/templates/ClassicBordered";
import { MinimalRule } from "@/components/preview/templates/MinimalRule";
import { ModernCard } from "@/components/preview/templates/ModernCard";
import { buildModel } from "@/lib/cover-model";
import { coverCssVars } from "@/lib/cover-style";
import type { CoverState } from "@/lib/schema";

/**
 * The printable page. Everything inside is sized in millimetres, so what the
 * preview shows is literally what lands on paper — the on-screen version is the
 * same node with a CSS scale applied by <PreviewFrame>.
 */
export const CoverPage = forwardRef<HTMLDivElement, { state: CoverState; hint?: boolean }>(
  function CoverPage({ state, hint = true }, ref) {
    const model = buildModel(state);
    const { settings } = state;

    return (
      <div ref={ref} className="cover-page" style={coverCssVars(settings)}>
        <Watermark
          settings={settings}
          logo={model.logo}
          fallbackText={model.university || model.documentType}
        />

        {settings.template === "modern-card" && <ModernCard model={model} settings={settings} />}
        {settings.template === "classic-bordered" && (
          <ClassicBordered model={model} settings={settings} />
        )}
        {settings.template === "minimal-rule" && <MinimalRule model={model} settings={settings} />}

        {hint && model.isEmpty && <EmptyHint />}
      </div>
    );
  },
);
