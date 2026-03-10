import { useCallback, useMemo, useState } from "react";
/**
 * Lightweight poster generation hook used by PosterCarousel.
 * Currently generates a simple placeholder image for given ratio.
 */
export function useMatchPoster(match: any) {
  const [posters, setPosters] = useState<Array<{ id: string; label: string; dataUrl: string; blob?: Blob }>>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const generate = useCallback(async (ratio: "story" | "square" | "classic" = "story") => {
    setLoading(true);
    try {
      const dims =
        ratio === "story" ? { w: 1080, h: 1920 } :
        ratio === "classic" ? { w: 1200, h: 900 } :
        { w: 1080, h: 1080 };
      const canvas = document.createElement("canvas");
      canvas.width = dims.w;
      canvas.height = dims.h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, dims.w, dims.h);
        ctx.fillStyle = "#0ea5e9";
        ctx.font = "bold 64px Nunito";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`Poster (${ratio})`, dims.w / 2, dims.h / 2);
      }
      const dataUrl = canvas.toDataURL("image/png");
      setPosters([{ id: `${ratio}-1`, label: `Poster ${ratio}`, dataUrl }]);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadCurrent = useCallback(async () => {
    const cur = posters[selected];
    if (!cur) return;
    const a = document.createElement("a");
    a.href = cur.dataUrl;
    a.download = `${cur.label.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }, [posters, selected]);

  const shareCurrent = useCallback(async () => {
    const cur = posters[selected];
    if (!cur) return;
    try {
      const res = await fetch(cur.dataUrl);
      const blob = await res.blob();
      // Try Web Share API if available
      // Note: guarded to avoid exceptions in unsupported environments
      // @ts-ignore
      if (navigator.share && navigator.canShare?.({ files: [] })) {
        const file = new File([blob], "poster.png", { type: "image/png" });
        // @ts-ignore
        await navigator.share({ title: "Poster", files: [file] });
        return;
      }
    } catch {
      /* ignore share errors */
    }
    window.open(cur.dataUrl, "_blank");
  }, [posters, selected]);

  return {
    posters,
    loading,
    selected,
    setSelected,
    generate,
    downloadCurrent,
    shareCurrent,
  };
}
