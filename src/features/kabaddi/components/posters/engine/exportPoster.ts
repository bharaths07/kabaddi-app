import { supabase } from '@shared/lib/supabase'

export async function downloadPoster(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareToWhatsApp(blob: Blob, text: string) {
  // On mobile — use Web Share API if available
  if (navigator.share && navigator.canShare({ files: [] })) {
    const file = new File([blob], "poster.png", { type: "image/png" });
    await navigator.share({
      title: "Game Legends Kabaddi",
      text,
      files: [file],
    });
    return;
  }
  // Fallback: open WhatsApp with text only
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}

export async function shareNative(blob: Blob, title: string) {
  if (!navigator.share) return false;
  const file = new File([blob], "poster.png", { type: "image/png" });
  try {
    await navigator.share({ title, files: [file] });
    return true;
  } catch {
    return false;
  }
}

// ─── DOM CAPTURE (html2canvas) ────────────────────────────────────────────────
import html2canvas from "html2canvas";

export async function captureNodeToCanvas(node: HTMLElement, opts?: { scale?: number; backgroundColor?: string | null }) {
  const canvas = await html2canvas(node, {
    useCORS: true,
    backgroundColor: opts?.backgroundColor ?? null,
    scale: opts?.scale ?? 2,
  });
  return canvas;
}

export async function exportNodePNG(node: HTMLElement, filename = "poster.png") {
  const canvas = await captureNodeToCanvas(node);
  const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  await downloadPoster(blob, filename);
}

export async function savePosterToSupabase(
  blob: Blob,
  userId: string,
  fixtureId?: string
): Promise<string> {
  const filename = `${userId}/${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from('posters')
    .upload(filename, blob, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error || !data) {
    throw error ?? new Error('Failed to upload poster');
  }

  const { data: urlData } = supabase.storage
    .from('posters')
    .getPublicUrl(data.path);

  const publicUrl = urlData?.publicUrl ?? '';

  await supabase.from('posters').insert({
    user_id: userId,
    fixture_id: fixtureId ?? null,
    image_url: publicUrl,
    template: 'exported',
  });

  return publicUrl;
}
