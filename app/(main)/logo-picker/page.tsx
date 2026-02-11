"use client";

import Image from "next/image";
import { useState } from "react";

const logos = [
  {
    id: 1,
    src: "/logo-options/logo-1-circuit-check.png",
    label: "Circuit Checkmark",
    desc: "Checkmark made of circuit-trace lines",
  },
  {
    id: 2,
    src: "/logo-options/logo-2-robot-check.png",
    label: "Robot Check",
    desc: "Agent head with integrated checkmark",
  },
  {
    id: 3,
    src: "/logo-options/logo-3-t-check.png",
    label: "T-Check",
    desc: "Letter T stylized as a checkbox",
  },
  {
    id: 4,
    src: "/logo-options/logo-4-clipboard-node.png",
    label: "Clipboard Node",
    desc: "Task list with AI node accent",
  },
];

export default function LogoPicker() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Pick a logo
          </h1>
          <p className="text-muted-foreground">
            Click one to select. These are starting points — we can iterate.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {logos.map((logo) => (
            <button
              key={logo.id}
              onClick={() => setSelected(logo.id)}
              className={`group relative rounded-2xl border-2 p-8 transition-all duration-200 ${
                selected === logo.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground/30 bg-card"
              }`}
            >
              {selected === logo.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">✓</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-4">
                <div className="w-40 h-40 relative bg-white rounded-xl flex items-center justify-center overflow-hidden">
                  <Image
                    src={logo.src}
                    alt={logo.label}
                    width={160}
                    height={160}
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{logo.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{logo.desc}</p>
                </div>
              </div>

              {/* Dark mode preview */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">On dark</p>
                <div className="w-full h-20 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={logo.src}
                    alt={`${logo.label} dark`}
                    width={64}
                    height={64}
                    className="object-contain invert"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Selected: <strong>{logos.find((l) => l.id === selected)?.label}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
