/* =====================================================================
   TELA NOVA RESERVA DE SALA
   - A URL da lista de reservas vem do HTML (data-url-reservas="{% url 'reservas' %}"),
     porque o Django só processa {% url %} dentro do .html.
   - Se quiser, pode fixar uma URL aqui como reserva (usada só se o HTML não tiver).
   ===================================================================== */
const URL_RESERVAS_RESERVA = "";

/* Links dos botões da página (vazio = não faz nada).
   "voltar" já está no HTML com {% url 'reservas' %}; só preencha aqui se preferir. */
const LINKS_NR = {
  "voltar":    "",   // seta de voltar
  "ver-salas": "",   // Ver todas as salas
  "sala-1": "", "sala-2": "", "sala-3": "",   // cada sala da lista lateral
  "sala-4": "", "sala-5": "", "sala-6": ""
};

const $q = s => document.querySelector(s);
const form = $q("#formReserva");
const URL_RESERVAS = form.dataset.urlReservas || URL_RESERVAS_RESERVA;

/* ---- volta para a aba Reservas ---- */
function voltarParaReservas(){
  if (URL_RESERVAS) window.location.href = URL_RESERVAS;
  else console.warn("Defina a URL de reservas (data-url-reservas no <form>).");
}

/* ---- links ---- */
document.querySelectorAll("[data-nr-link]").forEach(el => {
  const url = LINKS_NR[el.dataset.nrLink];
  if (url) el.setAttribute("href", url);
});
document.querySelectorAll(".nr a[href='#']").forEach(a =>
  a.addEventListener("click", e => e.preventDefault())
);

/* ---- elementos ---- */
const sala = $q("#sala"), data = $q("#data"), inicio = $q("#inicio"), termino = $q("#termino");
const contato = $q("#contato"), obs = $q("#obs"), contador = $q("#contador");
const btnConfirmar = $q("#btnConfirmar");
const salasLista = document.querySelectorAll("#listaSalas .nr-room");

/* ---- Cancelar ---- */
$q("#btnCancelar").addEventListener("click", voltarParaReservas);

/* ---- data mínima = hoje ---- */
(() => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  data.min = `${d.getFullYear()}-${mm}-${dd}`;
})();

/* ---- sala escolhida <-> lista lateral ---- */
function marcarSala(){
  salasLista.forEach(a => a.classList.toggle("is-selected", a.dataset.sala === sala.value));
}
sala.addEventListener("change", marcarSala);
salasLista.forEach(a => a.addEventListener("click", () => {
  if (a.getAttribute("href") !== "#") return;          // se tiver link, navega normalmente
  sala.value = a.dataset.sala;
  sala.dispatchEvent(new Event("change", { bubbles: true }));
  sala.classList.remove("invalid");
  sala.focus();
}));

/* ---- contador de descrição ---- */
obs.addEventListener("input", () => { contador.textContent = obs.value.length; });

/* ---- máscara do telefone: (XX) XXXXX-XXXX ---- */
contato.addEventListener("input", () => {
  const n = contato.value.replace(/\D/g, "").slice(0, 11);
  let v = n;
  if (n.length > 10)      v = `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  else if (n.length > 6)  v = `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  else if (n.length > 2)  v = `(${n.slice(0,2)}) ${n.slice(2)}`;
  else if (n.length > 0)  v = `(${n}`;
  contato.value = v;
});

/* ---- término precisa ser depois do início ---- */
function checarHorarios(){
  termino.setCustomValidity(
    inicio.value && termino.value && termino.value <= inicio.value
      ? "O horário de término deve ser depois do horário de início." : ""
  );
}
inicio.addEventListener("input", checarHorarios);
termino.addEventListener("input", checarHorarios);

/* ---- tira o destaque de erro ao editar ---- */
form.addEventListener("input", e => e.target.classList.remove("invalid"));
form.addEventListener("change", e => e.target.classList.remove("invalid"));

/* =====================================================================
   CONFIRMAR RESERVA
   ===================================================================== */
form.addEventListener("submit", async e => {
  e.preventDefault();
  checarHorarios();
  form.querySelectorAll("[required]").forEach(el => el.classList.toggle("invalid", !el.checkValidity()));
  if (!form.checkValidity()) { form.reportValidity(); return; }

  btnConfirmar.disabled = true;
  const action = form.getAttribute("action");

  // sem action: apenas volta para a lista (modo protótipo)
  if (!action) { voltarParaReservas(); return; }

  // com action: envia os dados (com o csrf_token) e volta para a lista
  try {
    const resp = await fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin"
    });
    if (resp.ok) voltarParaReservas();
    else throw new Error("HTTP " + resp.status);
  } catch (err) {
    btnConfirmar.disabled = false;
    alert("Não foi possível confirmar a reserva. Tente novamente.");
  }
});