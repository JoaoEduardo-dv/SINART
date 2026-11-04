/* SINART – Informações do NUARTE. Requer si-base.js carregado antes. */
(() => {
  'use strict';
  const S = window.SINART;
  if (!S || !S.page.classList.contains('si-info')) return;
  const { page, root, $, $$, store, toast, openModal, closeModal, activateTab, setError, clearErrors, collect, emit, isEmail, formatDate, today } = S;

  /* ======================================================================
     INFORMAÇÕES DO NUARTE
     ====================================================================== */
  $$('[data-space]').forEach((item) => item.addEventListener('click', () => {
    const modal = document.getElementById('siModalEspaco');
    if (!modal) return;
    $('[data-space-name]', modal).textContent = item.dataset.name;
    $('[data-space-desc]', modal).textContent = item.dataset.desc;
    const photo = $('[data-space-photo]', modal);
    const icon = $('i', item.querySelector('.si-thumb'));
    photo.innerHTML = '';
    const img = item.querySelector('.si-thumb img');
    if (img && img.complete && img.naturalWidth) { const clone = img.cloneNode(); clone.removeAttribute('class'); photo.appendChild(clone); }
    else if (icon) photo.appendChild(icon.cloneNode());
    openModal('siModalEspaco');
  }));
  // Se a foto do espaço não existir, o ícone de apoio continua visível
  $$('.si-thumb img').forEach((img) => img.addEventListener('error', () => img.remove()));
})();
