// Cronotours: imágenes de reemplazo y chat con Ramiro

// 1. Si una imagen todavía no está en /img, mostrar un recuadro con su nombre
function markMissing(img) {
  const avatar = img.closest(".avatar");
  if (avatar) { img.remove(); return; }
  const ph = img.closest(".ph");
  if (ph) ph.classList.add("no-img");
}
document.querySelectorAll("img").forEach((img) => {
  if (img.complete && img.naturalWidth === 0) markMissing(img);
  else img.addEventListener("error", () => markMissing(img), { once: true });
});

// 2. Chat
const toggle = document.getElementById("chatToggle");
const panel = document.getElementById("chatPanel");
const closeBtn = document.getElementById("chatClose");
const log = document.getElementById("chatLog");
const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");
const sendBtn = form.querySelector("button");
const suggest = document.getElementById("chatSuggest");

// Historial que se manda a la IA (el saludo inicial no hace falta enviarlo)
const history = [];
let busy = false;

function openChat() {
  panel.hidden = false;
  toggle.hidden = true;
  toggle.setAttribute("aria-expanded", "true");
  input.focus();
}
function closeChat() {
  panel.hidden = true;
  toggle.hidden = false;
  toggle.setAttribute("aria-expanded", "false");
  toggle.focus();
}
toggle.addEventListener("click", openChat);
closeBtn.addEventListener("click", closeChat);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panel.hidden) closeChat();
});

function addMessage(text, kind) {
  const div = document.createElement("div");
  div.className = "msg msg-" + kind;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

async function send(text) {
  text = text.trim();
  if (!text || busy) return;
  busy = true;
  sendBtn.disabled = true;
  suggest.hidden = true;

  addMessage(text, "user");
  history.push({ role: "user", content: text });
  const typing = addMessage("Ramiro está escribiendo…", "bot msg-typing");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-10) }),
    });
    const data = await res.json().catch(() => ({}));
    typing.remove();
    if (!res.ok || !data.reply) {
      history.pop();
      addMessage(data.error || "No pudimos conectar con Ramiro. Probá de nuevo en unos segundos.", "error");
    } else {
      history.push({ role: "assistant", content: data.reply });
      addMessage(data.reply, "bot");
    }
  } catch {
    typing.remove();
    history.pop();
    addMessage("No hay conexión con el servidor. Si abriste el archivo directo desde la compu, el chat solo funciona una vez publicado en Vercel (o con vercel dev).", "error");
  } finally {
    busy = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value;
  input.value = "";
  send(text);
});
suggest.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") send(e.target.textContent);
});

// 3. El buscador de la portada abre el chat con la consulta armada
document.getElementById("buscador").addEventListener("submit", (e) => {
  e.preventDefault();
  const destino = document.getElementById("destino").value;
  const pax = document.getElementById("pasajeros").value;
  const quien = pax === "1" ? "Viajo solo" : `Somos ${pax} pasajeros`;
  openChat();
  send(`Quiero viajar ${destino}. ${quien}. ¿Qué me recomendás y qué riesgos hay?`);
});

// 4. Botones "Preguntarle a Ramiro" de cada paquete
document.querySelectorAll("[data-ask]").forEach((btn) => {
  btn.addEventListener("click", () => {
    openChat();
    send(btn.dataset.ask);
  });
});

// 5. Tablero de salidas con letras que giran
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const CHARS = " ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789:";
const randChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

function buildCell(td) {
  const w = Number(td.dataset.w);
  const label = document.createElement("span");
  label.className = "sr-only";
  const flaps = document.createElement("span");
  flaps.setAttribute("aria-hidden", "true");
  for (let i = 0; i < w; i++) {
    const f = document.createElement("span");
    f.className = "f";
    f.textContent = "\u00a0";
    flaps.appendChild(f);
  }
  td.append(label, flaps);
}

function setCell(td, text, animate) {
  const w = Number(td.dataset.w);
  const target = text.padEnd(w, " ").slice(0, w).replace(/ /g, "\u00a0");
  td.querySelector(".sr-only").textContent = text;
  const cells = td.querySelectorAll(".f");
  cells.forEach((f, i) => {
    const final = target[i];
    if (!animate || reduceMotion) { f.textContent = final; return; }
    let steps = 4 + Math.floor(Math.random() * 10) + i;
    const tick = () => {
      f.classList.remove("flip");
      void f.offsetWidth;
      f.classList.add("flip");
      if (steps-- > 0) {
        f.textContent = randChar();
        setTimeout(tick, 55);
      } else {
        f.textContent = final;
      }
    };
    setTimeout(tick, i * 25);
  });
}

const boardCells = document.querySelectorAll("#boardBody td");
boardCells.forEach((td) => {
  buildCell(td);
  setCell(td, td.dataset.flap, true);
});

// Cada tanto cambia el estado de algún vuelo
const STATUSES = [
  ["EMBARCANDO", "ok"], ["A HORARIO", "ok"], ["EN VUELO", "ok"],
  ["DEMORADO", "warn"], ["PARADOJA", "bad"],
];
const rotatingRows = [0, 1, 2, 4];
const rows = document.querySelectorAll("#boardBody tr");
setInterval(() => {
  if (document.hidden) return;
  const row = rows[rotatingRows[Math.floor(Math.random() * rotatingRows.length)]];
  const td = row.lastElementChild;
  const options = STATUSES.filter(([t]) => t !== td.dataset.flap);
  const [text, status] = options[Math.floor(Math.random() * options.length)];
  td.dataset.flap = text;
  td.dataset.status = status;
  setCell(td, text, true);
}, 4500);

// Reloj del tablero
const clock = document.getElementById("boardClock");
function tickClock() {
  const d = new Date();
  clock.textContent = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}
tickClock();
setInterval(tickClock, 15000);
