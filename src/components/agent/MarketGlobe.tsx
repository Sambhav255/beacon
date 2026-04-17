"use client";

import { useMemo, useRef, useState } from "react";
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

const ACCENT = "#d4a574";
const ACCENT_BRIGHT = "#e4b584";

export default function MarketGlobe({ markets, selectedMarketId, onSelect }: MarketGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
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

  return (
    <div className="mx-auto flex w-full max-w-[540px] flex-col items-center rounded border border-border bg-surface p-5">
      <div
        className="h-[500px] w-[500px] overflow-hidden rounded border border-border bg-bg"
        onMouseEnter={() => setDidInteract(true)}
      >
        <Globe
          ref={globeRef}
          width={500}
          height={500}
          backgroundColor="rgba(0,0,0,1)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          showAtmosphere={false}
          polygonsData={[]}
          pointsData={points}
          pointLat={(d) => (d as GlobePoint).lat}
          pointLng={(d) => (d as GlobePoint).lng}
          pointAltitude={(d) => ((d as GlobePoint).isSelected ? 0.04 : (d as GlobePoint).isHovered ? 0.03 : 0.02)}
          pointRadius={(d) => ((d as GlobePoint).isSelected ? 0.36 : (d as GlobePoint).isHovered ? 0.3 : 0.24)}
          pointColor={(d) => ((d as GlobePoint).isSelected ? ACCENT_BRIGHT : ACCENT)}
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
            setPulsingId(p.id);
            setTimeout(() => setPulsingId(null), 900);
          }}
          ringsData={rings}
          ringLat={(d) => (d as GlobeMarket).lat}
          ringLng={(d) => (d as GlobeMarket).lng}
          ringColor={() => ACCENT}
          ringMaxRadius={() => 4.2}
          ringPropagationSpeed={() => 2.2}
          ringRepeatPeriod={(d) => ((d as GlobeMarket).id === selectedMarketId ? 1200 : 750)}
          onGlobeReady={() => {
            const controls = (globeRef.current as
              | {
                  controls?: () => {
                    autoRotate: boolean;
                    autoRotateSpeed: number;
                    enablePan: boolean;
                    minDistance: number;
                    maxDistance: number;
                    addEventListener: (event: string, listener: () => void) => void;
                  };
                }
              | undefined)?.controls?.();
            if (!controls) return;
            controls.autoRotate = !didInteract;
            controls.autoRotateSpeed = 0.18;
            controls.enablePan = false;
            controls.minDistance = 180;
            controls.maxDistance = 300;
            controls.addEventListener("start", () => {
              controls.autoRotate = false;
              setDidInteract(true);
            });
          }}
        />
      </div>
      <p className="mt-3 text-xs text-text-3">Click a highlighted marker to select a market.</p>
    </div>
  );
}
