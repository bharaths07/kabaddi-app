import React, { useEffect, useState } from "react";
import { useMatchPoster } from "../hooks/useMatchPoster";
import PosterShareSheet from "./PosterShareSheet";
import RatioSelector from "./RatioSelector";

export function PosterCarousel({ match, onClose }: { match: any; onClose: () => void }) {
  const [ratio, setRatio] = useState<"story" | "square" | "classic">("story");
  const {
    posters, loading, selected,
    setSelected, generate,
    downloadCurrent, shareCurrent
  } = useMatchPoster(match);

  useEffect(() => { generate(ratio); }, [generate, ratio]);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="pg-carousel">
      <div className="pg-carousel__track">
        {posters.map((p, i) => (
          <div
            key={p.id}
            className={`pg-carousel__slide ${i === selected ? "active" : ""}`}
            onClick={() => setSelected(i)}
          >
            <img src={p.dataUrl} alt={p.label} />
            <span className="pg-carousel__label">{p.label}</span>
          </div>
        ))}
      </div>

      <RatioSelector value={ratio} onChange={(r) => setRatio(r)} />

      <PosterShareSheet
        onDownload={downloadCurrent}
        onClose={onClose}
      />
    </div>
  );
}
