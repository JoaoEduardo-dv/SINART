/* =====================================================================
   PÁGINA DE LOGIN - SINART
   Coloque abaixo o endereço do login (a sua API).
   Vazio = o botão só faz a animação (modo protótipo).
   Também vale trocar o href="#" do botão no HTML pelo endereço.
   ===================================================================== */
const LINKS_LOGIN = {
  "entrar": ""   // ex.: "https://sua-api.com/login" ou "/login/api/"
};

const $ = s => document.querySelector(s);
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- tema (usa o mesmo salvo pelo sistema; senão, o do aparelho) ---- */
try {
  const t = localStorage.getItem("sinart-theme") ||
            (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", t);
} catch (e) {}

$("#ano").textContent = new Date().getFullYear();

/* =====================================================================
   BOTÃO ENTRAR
   ===================================================================== */
const btn = $("#btnEntrar"), label = $("#btnLabel"), wipe = $("#wipe");

function destino(){
  const direto = LINKS_LOGIN[btn.dataset.loginLink];
  if (direto) return direto;
  const h = btn.getAttribute("href");
  return h && h !== "#" ? h : "";
}

btn.addEventListener("click", e => {
  e.preventDefault();
  if (btn.classList.contains("is-loading")) return;

  // ripple a partir do ponto do clique (ou do centro, se vier do teclado)
  const r = btn.getBoundingClientRect();
  const x = e.clientX ? e.clientX - r.left : r.width / 2;
  const y = e.clientY ? e.clientY - r.top  : r.height / 2;
  const d = Math.max(r.width, r.height) * 2.2;
  const rip = document.createElement("span");
  rip.className = "ripple";
  rip.style.cssText = `width:${d}px;height:${d}px;left:${x - d/2}px;top:${y - d/2}px`;
  btn.appendChild(rip);
  setTimeout(() => rip.remove(), 800);

  btn.classList.add("is-loading");
  label.textContent = "Entrando...";
  const url = destino();

  if (url) {
    // saída animada e depois vai para o login
    wipe.style.setProperty("--x", (r.left + x) + "px");
    wipe.style.setProperty("--y", (r.top + y) + "px");
    setTimeout(() => document.body.classList.add("leaving"), 350);
    setTimeout(() => { window.location.href = url; }, reduzir ? 100 : 1100);
  } else {
    // protótipo: sem link definido, volta ao normal
    console.warn("Defina o endereço do login em LINKS_LOGIN (login.js).");
    setTimeout(() => {
      btn.classList.remove("is-loading");
      label.textContent = "Entrar";
      btn.classList.add("shake");
      setTimeout(() => btn.classList.remove("shake"), 600);
    }, 1400);
  }
});

/* ---- botão "magnético": segue o mouse de leve ---- */
if (!reduzir) {
  btn.addEventListener("pointermove", e => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.08) + "px");
    btn.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.18) + "px");
  });
  btn.addEventListener("pointerleave", () => {
    btn.style.setProperty("--bx", "0px");
    btn.style.setProperty("--by", "0px");
  });
}

/* =====================================================================
   EFEITO DIGITANDO
   ===================================================================== */
const palavras = ["reservas de salas", "empréstimos de materiais", "aulas e horários", "o calendário acadêmico", "o painel semanal"];
const alvo = $("#typed");
if (reduzir) {
  alvo.textContent = palavras[0];
} else {
  let p = 0, c = 0, apagando = false;
  (function digitar(){
    const w = palavras[p];
    alvo.textContent = w.slice(0, c);
    if (!apagando && c < w.length) { c++; setTimeout(digitar, 70); }
    else if (!apagando) { apagando = true; setTimeout(digitar, 1500); }
    else if (c > 0) { c--; setTimeout(digitar, 35); }
    else { apagando = false; p = (p + 1) % palavras.length; setTimeout(digitar, 350); }
  })();
}

/* =====================================================================
   MOUSE: inclinação do cartão, brilho e ícones flutuantes (parallax)
   ===================================================================== */
const card = $("#card");
const flutuantes = document.querySelectorAll(".fl");
const mouse = { x: -9999, y: -9999 };

if (!reduzir) {
  window.addEventListener("pointermove", e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    card.style.setProperty("--ry", (nx * 9) + "deg");
    card.style.setProperty("--rx", (-ny * 9) + "deg");
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
    flutuantes.forEach(f => {
      const d = Number(f.dataset.depth) || 20;
      f.style.setProperty("--px", (-nx * d) + "px");
      f.style.setProperty("--py", (-ny * d) + "px");
    });
  });
  document.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = -9999;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });
}

/* =====================================================================
   PARTÍCULAS (canvas): pontos nas cores do SINART ligados por linhas,
   que fogem do mouse
   ===================================================================== */
const cv = $("#particulas"), ctx = cv.getContext("2d");
const cores = ["#d63b2d", "#2b78c2", "#6aa56f", "#7b3f98", "#f0a22c"];
let W, H, DPR, pts = [];

function ajustar(){
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const n = Math.round(Math.min(90, Math.max(28, (W * H) / 16000)));
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
    r: Math.random() * 2.6 + 1.2,
    c: cores[Math.floor(Math.random() * cores.length)]
  }));
}

let rodando = true;
function quadro(){
  if (!rodando) return;
  ctx.clearRect(0, 0, W, H);
  const claro = document.documentElement.dataset.theme !== "dark";

  for (const p of pts) {
    // fuga do mouse
    const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
    if (dist < 130 && dist > 0) { p.x += (dx / dist) * 1.6; p.y += (dy / dist) * 1.6; }
    p.x += p.vx; p.y += p.vy;
    if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
  }
  // linhas
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = (claro ? "rgba(70,80,130," : "rgba(200,210,255,") + (0.22 * (1 - d / 130)) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  // pontos
  for (const p of pts) {
    ctx.fillStyle = p.c; ctx.globalAlpha = .75;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(quadro);
}

ajustar();
addEventListener("resize", ajustar);
if (reduzir) { rodando = false; }
else {
  document.addEventListener("visibilitychange", () => {
    rodando = !document.hidden;
    if (rodando) requestAnimationFrame(quadro);
  });
  requestAnimationFrame(quadro);
}