// Every template calls these instead of raw canvas API

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  color: string
) {
  // Dark navy base + team color gradient overlay
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0c1832");
  grad.addColorStop(0.5, color + "55");
  grad.addColorStop(1, "#0c1832");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export function drawGridPattern(
  ctx: CanvasRenderingContext2D,
  w: number, h: number
) {
  // Diagonal subtle grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let i = -h; i < w + h; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }
}

export function drawTeamBadge(
  ctx: CanvasRenderingContext2D,
  abbr: string, color: string,
  x: number, y: number, size: number
) {
  // Rounded rect badge with team abbreviation
  const r = size * 0.2;
  ctx.fillStyle = color + "33";
  roundRect(ctx, x - size/2, y - size/2, size, size, r);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  roundRect(ctx, x - size/2, y - size/2, size, size, r);
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = `bold ${size * 0.4}px Rajdhani`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(abbr, x, y);
}

export function drawPlayerAvatar(
  ctx: CanvasRenderingContext2D,
  name: string, color: string,
  x: number, y: number, radius: number
) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  // Circle background
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color + "44";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Initials
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${radius * 0.7}px Rajdhani`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, x, y);
}

export function drawStatBox(
  ctx: CanvasRenderingContext2D,
  value: string, label: string, color: string,
  x: number, y: number, w: number, h: number
) {
  // Box background
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = color + "44";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 16);
  ctx.stroke();

  // Value (big)
  ctx.fillStyle = color;
  ctx.font = `bold ${h * 0.42}px Rajdhani`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(value, x + w/2, y + h * 0.38);

  // Label (small)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `600 ${h * 0.2}px Nunito`;
  ctx.fillText(label, x + w/2, y + h * 0.72);
}

export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number, h: number
) {
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "600 28px Nunito";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("Game Legends 🏉", w - 32, h - 28);
}

export function drawPill(
  ctx: CanvasRenderingContext2D,
  text: string, color: string,
  x: number, y: number
) {
  const padding = 20;
  ctx.font = "bold 30px Nunito";
  const tw = ctx.measureText(text).width;
  const pw = tw + padding * 2;
  const ph = 52;

  ctx.fillStyle = color + "33";
  roundRect(ctx, x - pw/2, y - ph/2, pw, ph, ph/2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  roundRect(ctx, x - pw/2, y - ph/2, pw, ph, ph/2);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

export function fill(color: string, ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

export function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = "left"
) {
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px Nunito`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(value, x, y);
}

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillColor?: string,
  strokeColor?: string,
  strokeWidth?: number
) {
  roundRect(ctx, x, y, w, h, r);
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth ?? 1;
    ctx.stroke();
  }
}

// Helper: rounded rectangle path
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
