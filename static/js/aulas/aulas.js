/* =====================================================================
   TELA AULAS E HORÁRIOS - LINKS
   Opção A: coloque o endereço aqui.  Opção B: troque o href="#" no HTML por {% url %}.
   Vazio = o botão não navega (as abas só mudam o visual).
   ===================================================================== */
const LINKS_AH = {
  "aba-grade":        "",   // aba Grade de horários
  "aba-disciplinas":  "",   // aba Disciplinas
  "aba-professores":  "",   // aba Professores
  "semana-anterior":  "",   // seta <
  "semana-proxima":   "",   // seta >
  "ver-lista":        ""    // botão Ver em lista
};
/* As aulas (<a class="ah-card">) ficam com href="#":
   no Django, troque por {% url 'detalhe_aula' a.id %} dentro do {% for %}. */

const $q = s => document.querySelector(s);

/* ---- aplica os links ---- */
document.querySelectorAll("[data-ah-link]").forEach(el => {
  const url = LINKS_AH[el.dataset.ahLink];
  if (url) el.setAttribute("href", url);
});
document.querySelectorAll(".ah a[href='#']").forEach(a =>
  a.addEventListener("click", e => e.preventDefault())
);

/* ---- abas (visual, enquanto não há link) ---- */
document.querySelectorAll("#ahAbas a").forEach(a =>
  a.addEventListener("click", () => {
    if (a.getAttribute("href") !== "#") return;
    document.querySelectorAll("#ahAbas a").forEach(x => x.classList.remove("active"));
    a.classList.add("active");
  })
);

/* ---- filtro por professor: destaca só as aulas do professor escolhido ---- */
const filtroProf = $q("#filtroProf");
const cards = document.querySelectorAll(".ah-card");
filtroProf.addEventListener("change", () => {
  const p = filtroProf.value;
  cards.forEach(c => c.classList.toggle("is-dim", !!p && c.dataset.prof !== p));
});

/* ---- semestre: envia o formulário (GET) e a página recarrega com ?semestre=2025.1 ---- */
$q("#filtroSemestre").addEventListener("change", () => $q("#formFiltros").submit());