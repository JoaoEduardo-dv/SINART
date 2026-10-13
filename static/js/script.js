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