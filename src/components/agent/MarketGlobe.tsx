"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";

type GlobeMarket = {
  id: string;
  name: string;
  tagline: string;
  lat: number;
  lng: number;
};

interface MarketGlobeProps {
  markets: GlobeMarket[];
  selectedMarketId: string | null;
  onSelect: (marketId: string) => void;
}

type GlobePoint = GlobeMarket & { isSelected: boolean; isHovered: boolean };

const ACCENT_BRIGHT = "#ddb086";
const ACCENT_SOFT = "#e8c39d";
const DEFAULT_VIEW = { lat: 28, lng: 14, altitude: 2.05 };

type GlobeControls = {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enablePan: boolean;
  minDistance: number;
  maxDistance: number;
  distance?: number;
  getDistance?: () => number;
  addEventListener: (event: string, listener: () => void) => void;
  update?: () => void;
};

export default function MarketGlobe({ markets, selectedMarketId, onSelect }: MarketGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const controlsRef = useRef<GlobeControls | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [didInteract, setDidInteract] = useState(false);

  const points = useMemo(
    () =>
      markets.map((market) => ({
        ...market,
        isSelected: market.id === selectedMarketId,
        isHovered: market.id === hoveredId,
      })),
    [markets, selectedMarketId, hoveredId],
  );

  const rings = useMemo(
    () =>
      markets
        .filter((market) => market.id === selectedMarketId || market.id === pulsingId)
        .map((market) => ({ ...market })),
    [markets, selectedMarketId, pulsingId],
  );

  const focusMarket = useCallback((marketId: string, durationMs = 700) => {
    const target = markets.find((market) => market.id === marketId);
    if (!target) return;
    globeRef.current?.pointOfView({ lat: target.lat, lng: target.lng, altitude: 1.6 }, durationMs);
  }, [markets]);

  const resetView = useCallback(() => {
    globeRef.current?.pointOfView(DEFAULT_VIEW, 700);
    setDidInteract(false);
  }, []);

  const zoomBy = useCallback((delta: number) => {
    const currentPov = globeRef.current?.pointOfView();
    if (!currentPov) return;
    const currentAltitude = currentPov.altitude ?? DEFAULT_VIEW.altitude;
    const altitudeStep = delta > 0 ? 0.2 : -0.2;
    const nextAltitude = Math.min(2.8, Math.max(1.15, currentAltitude + altitudeStep));
    globeRef.current?.pointOfView({ altitude: nextAltitude }, 250);
    setDidInteract(true);
  }, []);

  useEffect(() => {
    if (!selectedMarketId) return;
    focusMarket(selectedMarketId, 850);
  }, [selectedMarketId, focusMarket]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.autoRotate = !didInteract;
  }, [didInteract]);

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center rounded border border-border bg-surface p-5">
      <div className="mb-3 flex w-full items-center justify-between gap-3">
        <p className="text-xs text-text-3">Drag to rotate, scroll to zoom, click a marker to select a market.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoomBy(-16)}
            className="h-8 w-8 border border-border text-sm text-text-2 hover:border-border-strong hover:text-text"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomBy(16)}
            className="h-8 w-8 border border-border text-sm text-text-2 hover:border-border-strong hover:text-text"
            aria-label="Zoom out"
          >
            -
          </button>
          <button
            type="button"
            onClick={resetView}
            className="h-8 border border-border px-2 text-xs text-text-2 hover:border-border-strong hover:text-text"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="relative h-[500px] w-[500px] overflow-hidden rounded border border-border bg-bg">
        <Globe
          ref={globeRef}
          width={500}
          height={500}
          backgroundColor="rgba(12,13,16,1)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          showAtmosphere
          atmosphereColor="#8a9098"
          atmosphereAltitude={0.1}
          polygonsData={[]}
          pointsData={points}
          pointLat={(d) => (d as GlobePoint).lat}
          pointLng={(d) => (d as GlobePoint).lng}
          pointAltitude={(d) => ((d as GlobePoint).isSelected ? 0.04 : (d as GlobePoint).isHovered ? 0.03 : 0.02)}
          pointRadius={(d) => ((d as GlobePoint).isSelected ? 0.38 : (d as GlobePoint).isHovered ? 0.32 : 0.26)}
          pointColor={(d) => ((d as GlobePoint).isSelected ? ACCENT_SOFT : ACCENT_BRIGHT)}
          pointLabel={(d) =>
            `<div style="background:#141414;border:1px solid #2a2a2a;padding:8px 10px;color:#f5f5f0;max-width:220px">
              <div style="font-weight:600;color:${ACCENT_BRIGHT};margin-bottom:4px">${(d as GlobePoint).name}</div>
              <div style="font-size:12px;color:#a0a0a0">${(d as GlobePoint).tagline}</div>
            </div>`
          }
          onPointHover={(point) => {
            const p = point as GlobePoint | null;
            setHoveredId(p?.id ?? null);
            if (point) setDidInteract(true);
          }}
          onPointClick={(point) => {
            const p = point as GlobePoint | null;
            if (!p?.id) return;
            setDidInteract(true);
            onSelect(p.id);
            focusMarket(p.id);
            setPulsingId(p.id);
            setTimeout(() => setPulsingId(null), 900);
          }}
          ringsData={rings}
          ringLat={(d) => (d as GlobeMarket).lat}
          ringLng={(d) => (d as GlobeMarket).lng}
          ringColor={() => ACCENT_BRIGHT}
          ringMaxRadius={() => 5}
          ringPropagationSpeed={() => 2}
          ringRepeatPeriod={(d) => ((d as GlobeMarket).id === selectedMarketId ? 1200 : 750)}
          onGlobeReady={() => {
            const controls = (globeRef.current as { controls?: () => GlobeControls } | undefined)?.controls?.();
            if (!controls) return;
            controlsRef.current = controls;
            controls.autoRotate = !didInteract;
            controls.autoRotateSpeed = 0.18;
            controls.enablePan = false;
            controls.minDistance = 150;
            controls.maxDistance = 320;
            controls.addEventListener("start", () => {
              controls.autoRotate = false;
              setDidInteract(true);
            });
            globeRef.current?.pointOfView(DEFAULT_VIEW, 0);
          }}
        />
        {selectedMarketId && (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-border bg-surface/90 px-2 py-1 text-xs text-text-2">
            Selected: <span className="text-accent">{markets.find((market) => market.id === selectedMarketId)?.name}</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex w-full items-center justify-between">
        <p className="text-xs text-text-3">Tip: use List view if you want the fastest market switching.</p>
        {selectedMarketId && (
          <button
            type="button"
            onClick={() => focusMarket(selectedMarketId)}
            className="border border-border px-2 py-1 text-xs text-text-2 hover:border-border-strong hover:text-text"
          >
            Center selected
          </button>
        )}
      </div>
    </div>
  );
}
