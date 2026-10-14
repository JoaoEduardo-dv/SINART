/* =====================================================================
   TELA PAINEL DE ATIVIDADES - LINKS
   Opção A: coloque o endereço aqui.  Opção B: troque o href="#" no HTML por {% url %}.
   Vazio = o botão não navega (as abas de visão e os itens só mudam o visual).
   ===================================================================== */
const LINKS_PAINEL = {
  "visao-diario":        "",   // aba Diário
  "visao-semanal":       "",   // aba Semanal
  "visao-mensal":        "",   // aba Mensal
  "visao-semestral":     "",   // aba Semestral
  "dia-anterior":        "",   // seta <
  "dia-proximo":         "",   // seta >
  "escolher-data":       "",   // caixa com a data (ex.: abrir calendário)
  "adicionar-atividade": ""    // botão + Adicionar atividade
};
/* Cada atividade (card da linha do tempo e item da coluna "Hoje") tem
   data-painel-link="atividade-N" e href="#". No Django, troque o href por
   {% url 'detalhe_atividade' a.id %} dentro do {% for %}. */

/* ---- aplica os links ---- */
document.querySelectorAll("[data-painel-link]").forEach(el => {
  const url = LINKS_PAINEL[el.dataset.painelLink];
  if (url) el.setAttribute("href", url);
});
document.querySelectorAll(".painel a[href='#']").forEach(a =>
  a.addEventListener("click", e => e.preventDefault())
);

/* ---- Diário / Semanal / Mensal / Semestral (visual, enquanto não há link) ---- */
document.querySelectorAll("#paVisoes a").forEach(a =>
  a.addEventListener("click", () => {
    if (a.getAttribute("href") !== "#") return;
    document.querySelectorAll("#paVisoes a").forEach(x => x.classList.remove("active"));
    a.classList.add("active");
  })
);

/* ---- clicar num item de "Hoje" destaca o card na linha do tempo (enquanto não há link) ---- */
document.querySelectorAll(".pa-item").forEach(item =>
  item.addEventListener("click", () => {
    if (item.getAttribute("href") !== "#") return;
    const alvo = document.getElementById(item.dataset.alvo);
    if (!alvo) return;
    alvo.scrollIntoView({ behavior: "smooth", block: "center" });
    alvo.classList.remove("is-flash");
    void alvo.offsetWidth;            // reinicia a animação
    alvo.classList.add("is-flash");
  })
);