/* =====================================================================
   SINART - CONFIGURAÇÃO DE LINKS
   Coloque o endereço de cada botão abaixo (ex.: "/reservas" ou "reservas.html").
   Se deixar vazio (""), o clique não faz nada.
   ===================================================================== */
const LINKS = {
  logo:               "",   // clique na logo
  inicio:             "",
  reservas:           "",   // Reservas de Salas
  emprestimos:        "",
  aulas:              "",   // Aulas e Horários
  calendario:         "",   // Calendário Acadêmico
  painel:             "",   // Painel Semanal
  "usuarios-lista":   "",   // submenu Usuários > Listar
  "usuarios-cadastro":"",   // submenu Usuários > Cadastrar
  documentos:         "",
  nuarte:             "",   // Informações do NUARTE
  configuracoes:      "",
  perfil:             "",   // Meu Perfil
  notificacoes:       "",   // sino
  sair:               ""    // Sair (menu do usuário)
};

/* ---- aplica os links ---- */
document.querySelectorAll("[data-link]").forEach(el => {
  const url = LINKS[el.dataset.link];
  if (url) { el.setAttribute("href", url); return; }
  // sem URL no LINKS: só bloqueia o clique se o href ainda for "#"
  if (el.getAttribute("href") === "#") el.addEventListener("click", e => e.preventDefault());
});

/* ---- marca como ativo o item do menu da página atual ---- */
document.querySelectorAll(".menu-item[href]").forEach(a => {
  if (a.getAttribute("href") !== "#" && a.pathname === location.pathname) a.classList.add("active");
});

/* ---- helpers ---- */
const $ = s => document.querySelector(s);
const layout = $("#layout");

/* ---- botão hambúrguer ---- */
$("#menuToggle").addEventListener("click", () => {
  if (window.innerWidth <= 900) layout.classList.toggle("open-mobile");
  else layout.classList.toggle("collapsed");
});

/* ---- submenu Usuários ---- */
const sub = $("#sub-usuarios");
sub.querySelector(".sub-toggle").addEventListener("click", e => {
  const open = sub.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});

/* ---- menu do usuário ---- */
const userBox = $("#userBox");
$("#userBtn").addEventListener("click", e => {
  e.stopPropagation();
  const open = userBox.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});

/* ---- tema claro/escuro ---- */
const themeBox = $("#themeBox");
function setTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  $("#themeLabel").textContent = t === "dark" ? "Tema escuro" : "Tema claro";
  $("#themeIcon").setAttribute("href", t === "dark" ? "#i-sun" : "#i-moon");
  try { localStorage.setItem("sinart-theme", t); } catch(e){}
}
$("#themeBtn").addEventListener("click", e => {
  e.stopPropagation();
  const open = themeBox.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
document.querySelectorAll("[data-theme-set]").forEach(b =>
  b.addEventListener("click", () => { setTheme(b.dataset.themeSet); themeBox.classList.remove("open"); })
);
try { setTheme(localStorage.getItem("sinart-theme") || "light"); } catch(e){}

/* ---- fecha dropdowns ao clicar fora ---- */
document.addEventListener("click", () => {
  userBox.classList.remove("open");
  themeBox.classList.remove("open");
});

/* ---- menu mobile: fechar ao tocar fora, em um link ou no ESC ---- */
const closeMobileMenu = () => layout.classList.remove("open-mobile");
$("#overlay").addEventListener("click", closeMobileMenu);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMobileMenu(); });
document.querySelectorAll(".sidebar a").forEach(a =>
  a.addEventListener("click", () => { if (window.innerWidth <= 900) closeMobileMenu(); })
);
window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMobileMenu(); });

/* =====================================================================
   SCROLLBAR POR TEMA
   - Tema escuro: fundo (trilho) escuro e a barra (polegar) clara.
   - Tema claro:  fundo claro e a barra em cinza-azulado.
   Funciona em toda a página e também nas áreas com rolagem própria
   (grade de horários, calendário, barra lateral...).
   Acompanha sozinho o atributo data-theme do <html>, então não precisa
   mexer na função que troca o tema.
   ===================================================================== */
function aplicarScrollbarTema(tema){
  const escuro = (tema || document.documentElement.getAttribute("data-theme")) === "dark";

  // cores (o trilho usa o --bg da própria página; se não existir, usa a cor padrão)
  const trilho = "var(--bg, " + (escuro ? "#12151d" : "#ffffff") + ")";
  const barra  = escuro ? "#cfd6e8" : "#c3cadb";   // polegar
  const hover  = escuro ? "#ffffff" : "#a4adc4";   // polegar ao passar o mouse

  // deixa os controles nativos (rolagem, calendário do input date...) no mesmo tema
  document.documentElement.style.colorScheme = escuro ? "dark" : "light";

  let st = document.getElementById("sinart-scrollbar");
  if (!st) {
    st = document.createElement("style");
    st.id = "sinart-scrollbar";
    document.head.appendChild(st);
  }

  st.textContent = `
    /* Chrome, Edge e Firefox atuais */
    *{scrollbar-width:thin;scrollbar-color:${barra} ${trilho}}

    /* Safari e navegadores antigos */
    @supports not (scrollbar-color:auto){
      *::-webkit-scrollbar{width:12px;height:12px}
      *::-webkit-scrollbar-track,*::-webkit-scrollbar-corner{background:${trilho}}
      *::-webkit-scrollbar-thumb{background:${barra};border-radius:8px;border:3px solid ${trilho}}
      *::-webkit-scrollbar-thumb:hover{background:${hover}}
    }
  `;
}

// aplica agora e sempre que o tema mudar
aplicarScrollbarTema();
new MutationObserver(() => aplicarScrollbarTema())
  .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });