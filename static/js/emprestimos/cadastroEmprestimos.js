/* =====================================================================
   TELA NOVO EMPRÉSTIMO
   - A URL da lista de empréstimos vem do HTML (data-url-emprestimos="{% url 'emprestimos' %}"),
     porque o Django só processa {% url %} dentro do .html.
   - Se quiser, pode fixar uma URL aqui como reserva (usada só se o HTML não tiver).
   ===================================================================== */
const URL_EMPRESTIMOS_RESERVA = "";

/* Links dos botões simples da página (vazio = não faz nada) */
const LINKS_EMPRESTIMO = {
  "ver-todos": ""   // "Ver todos" em Materiais mais emprestados
};

const $q = s => document.querySelector(s);
const form = $q("#formEmprestimo");
const URL_EMPRESTIMOS = form.dataset.urlEmprestimos || URL_EMPRESTIMOS_RESERVA;

/* ---- volta para a aba Empréstimos ---- */
function voltarParaEmprestimos(){
  if (URL_EMPRESTIMOS) window.location.href = URL_EMPRESTIMOS;
  else console.warn("Defina a URL de empréstimos (data-url-emprestimos no <form>).");
}

/* ---- links ---- */
document.querySelectorAll("[data-emp-link]").forEach(el => {
  const url = LINKS_EMPRESTIMO[el.dataset.empLink];
  if (url) el.setAttribute("href", url);
  else if (el.getAttribute("href") === "#") el.addEventListener("click", e => e.preventDefault());
});

/* ---- Cancelar ---- */
$q("#btnCancelar").addEventListener("click", voltarParaEmprestimos);

/* ---- elementos ---- */
const tipo = $q("#tipo"), material = $q("#material"), qtd = $q("#quantidade");
const inicio = $q("#inicio"), devolucao = $q("#devolucao");
const btnRegistrar = $q("#btnRegistrar"), btnAdicionar = $q("#btnAdicionar");
const caixa = $q("#caixaMateriais"), lista = $q("#listaMateriais");
const vazia = $q("#listaVazia"), total = $q("#totalMateriais"), erro = $q("#erroMaterial");

/* =====================================================================
   LISTA DE MATERIAIS DO EMPRÉSTIMO
   ===================================================================== */
let itens = [];   // [{id, nome, tipo, qtd}]

const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function mostrarErro(msg){ erro.textContent = msg; erro.hidden = !msg; }

function renderLista(){
  lista.innerHTML = itens.map((it, i) => `
    <li>
      <span class="m-ico"><svg><use href="#e-box"/></svg></span>
      <div><strong>${esc(it.nome)}</strong><small>Tipo: ${esc(it.tipo)}</small></div>
      <span class="m-qty">Qtd: ${it.qtd}</span>
      <button type="button" class="m-del" data-i="${i}" aria-label="Remover ${esc(it.nome)}"><svg><use href="#e-trash"/></svg></button>
      <input type="hidden" name="materiais" value="${esc(it.id)}">
      <input type="hidden" name="quantidades" value="${it.qtd}">
    </li>`).join("");
  total.textContent = itens.length;
  vazia.hidden = itens.length > 0;
  if (itens.length) caixa.classList.remove("invalid");
}

function adicionarMaterial(){
  const q = parseInt(qtd.value, 10);
  tipo.classList.toggle("invalid", !tipo.value);
  material.classList.toggle("invalid", !material.value);
  qtd.classList.toggle("invalid", !(q >= 1));
  if (!tipo.value)      { mostrarErro("Selecione o tipo de material."); tipo.focus(); return; }
  if (!material.value)  { mostrarErro("Selecione o material."); material.focus(); return; }
  if (!(q >= 1))        { mostrarErro("Informe uma quantidade válida (mínimo 1)."); qtd.focus(); return; }
  mostrarErro("");

  const existente = itens.find(it => it.id === material.value);
  if (existente) existente.qtd += q;          // mesmo material: soma a quantidade
  else itens.push({
    id: material.value,
    nome: material.selectedOptions[0].textContent,
    tipo: tipo.selectedOptions[0].textContent,
    qtd: q
  });
  renderLista();

  // pronto para o próximo material (o tipo continua selecionado)
  material.value = ""; qtd.value = 1;
  atualizarInfo();
  material.focus();
}

btnAdicionar.addEventListener("click", adicionarMaterial);
lista.addEventListener("click", e => {
  const b = e.target.closest(".m-del");
  if (!b) return;
  itens.splice(Number(b.dataset.i), 1);
  renderLista();
});
renderLista();

/* =====================================================================
   REGISTRAR EMPRÉSTIMO
   ===================================================================== */
form.addEventListener("submit", async e => {
  e.preventDefault();

  devolucao.setCustomValidity(
    inicio.value && devolucao.value && devolucao.value < inicio.value
      ? "A data de devolução deve ser igual ou posterior à data de início." : ""
  );
  form.querySelectorAll("[required]").forEach(el => el.classList.toggle("invalid", !el.checkValidity()));
  caixa.classList.toggle("invalid", itens.length === 0);

  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (itens.length === 0) {
    mostrarErro("Adicione pelo menos um material ao empréstimo.");
    caixa.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  btnRegistrar.disabled = true;
  const action = form.getAttribute("action");

  // sem action: apenas volta para a lista (modo protótipo)
  if (!action) { voltarParaEmprestimos(); return; }

  // com action: envia os dados (com o csrf_token e os materiais) e volta para a lista
  try {
    const resp = await fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin"
    });
    if (resp.ok) voltarParaEmprestimos();
    else throw new Error("HTTP " + resp.status);
  } catch (err) {
    btnRegistrar.disabled = false;
    alert("Não foi possível registrar o empréstimo. Tente novamente.");
  }
});

form.addEventListener("input", e => { e.target.classList.remove("invalid"); mostrarErro(""); });

/* ---- Quantidade (setas) ---- */
document.querySelectorAll(".spin button").forEach(b =>
  b.addEventListener("click", () => {
    const v = (parseInt(qtd.value, 10) || 0) + Number(b.dataset.step);
    qtd.value = Math.max(Number(qtd.min) || 1, v);
  })
);

/* ---- Datas: devolução não pode ser antes do início ---- */
inicio.addEventListener("change", () => { devolucao.min = inicio.value; });

/* ---- Contador de observações ---- */
const obs = $q("#obs"), contador = $q("#contador");
obs.addEventListener("input", () => { contador.textContent = obs.value.length; });

/* ---- Tipo filtra a lista de materiais ---- */
tipo.addEventListener("change", () => {
  [...material.options].forEach(o => {
    if (!o.value) return;
    const mostrar = !tipo.value || o.dataset.tipo === tipo.value;
    o.hidden = !mostrar; o.disabled = !mostrar;
  });
  if (material.selectedOptions[0] && material.selectedOptions[0].disabled) material.value = "";
  atualizarInfo();
});

/* ---- Painel "Informações do material" ---- */
const infoNome = $q("#infoNome"), infoTexto = $q("#infoTexto");
function atualizarInfo(){
  const op = material.selectedOptions[0];
  if (op && op.value) {
    infoNome.textContent = op.textContent;
    const t = tipo.selectedOptions[0];
    infoTexto.textContent = t && t.value ? "Tipo: " + t.textContent : "Material selecionado.";
  } else {
    infoNome.textContent = "Nenhum material selecionado";
    infoTexto.textContent = "Selecione o tipo de material e o item para visualizar mais informações.";
  }
}
material.addEventListener("change", atualizarInfo);