/* =====================================================================
   TELA RESERVAS DE SALAS - LINKS
   Opção A: coloque o endereço aqui.  Opção B: troque o href="#" no HTML por {% url %}.
   Vazio = o botão não navega (os de visão e de sala só mudam o visual).
   ===================================================================== */
const LINKS_RESERVAS = {
  "nova-reserva":     "",   // botão + Nova reserva
  "semana-anterior":  "",   // seta <
  "semana-proxima":   "",   // seta >
  "hoje":             "",   // botão Hoje
  "visao-dia":        "",   // Dia
  "visao-semana":     "",   // Semana
  "visao-mes":        "",   // Mês
  "sala-1": "", "sala-2": "", "sala-3": "", "sala-4": "",   // cada sala da lista
  "sala-5": "", "sala-6": "", "sala-7": "",
  "ver-salas":        "",   // Ver todas as salas
  "minhas-reservas":  ""    // Ver minhas reservas
};
/* Os blocos de reserva no calendário (<a class="ev">) ficam com href="#":
   no Django, troque por {% url 'detalhe_reserva' r.id %} */

const rq = s => document.querySelector(s);

/* ---- aplica os links ---- */
document.querySelectorAll("[data-reservas-link]").forEach(el => {
  const url = LINKS_RESERVAS[el.dataset.reservasLink];
  if (url) el.setAttribute("href", url);
});
document.querySelectorAll(".reservas a[href='#']").forEach(a =>
  a.addEventListener("click", e => e.preventDefault())
);

/* ---- Dia / Semana / Mês (visual, enquanto não há link) ---- */
document.querySelectorAll("#visoes a").forEach(a =>
  a.addEventListener("click", () => {
    if (a.getAttribute("href") !== "#") return;
    document.querySelectorAll("#visoes a").forEach(x => x.classList.remove("active"));
    a.classList.add("active");
  })
);

/* ---- seleção de sala (visual) ---- */
const titulo = rq("#salaTitulo");
const salas = document.querySelectorAll("#listaSalas .room");
function selecionarSala(a){
  salas.forEach(x => x.classList.remove("active"));
  a.classList.add("active");
  titulo.textContent = a.dataset.nome;
}
salas.forEach(a => a.addEventListener("click", () => {
  if (a.getAttribute("href") === "#") selecionarSala(a);
}));

/* ---- filtro "Todas as salas" ---- */
rq("#filtroSala").addEventListener("change", e => {
  const i = e.target.value;
  if (i) selecionarSala(salas[Number(i) - 1]);
});

/* ---- busca de salas ---- */
rq("#buscaSala").addEventListener("input", e => {
  const t = e.target.value.trim().toLowerCase();
  salas.forEach(a => {
    a.parentElement.style.display = a.dataset.nome.toLowerCase().includes(t) ? "" : "none";
  });
});