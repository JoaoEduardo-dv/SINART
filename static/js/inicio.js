/* =====================================================================
   TELA INÍCIO - LINKS
   Opção A: coloque o endereço aqui. Opção B: troque o href="#" no HTML por {% url %}.
   Vazio = não faz nada.
   ===================================================================== */
const LINKS_INICIO = {
  "acao-reserva":    "",   // card Nova reserva
  "acao-emprestimo": "",   // card Novo empréstimo
  "acao-aula":       "",   // card Cadastrar aula
  "acao-documentos": "",   // card Documentos
  "ver-agenda":      "",   // Ver agenda completa
  "ver-painel":      ""    // Ver painel completo
};

document.querySelectorAll("[data-inicio-link]").forEach(el => {
  const url = LINKS_INICIO[el.dataset.inicioLink];
  if (url) { el.setAttribute("href", url); return; }
  if (el.getAttribute("href") === "#") el.addEventListener("click", e => e.preventDefault());
});