/* =====================================================================
   SINART – base compartilhada das páginas "si-*"
   (Configurações, Meu Perfil, Informações do NUARTE)

   Deve ser carregado ANTES de config.js, meuPerfil.js e informacoes.js.
   Expõe window.SINART com os utilitários que esses scripts esperam.
   ===================================================================== */
(() => {
  'use strict';

  // Em páginas sem .si-page, usa o body para que `page.classList` nunca quebre.
  const page = document.querySelector('.si-page') || document.body;
  const root = page;

  const $ = (sel, ctx) => (ctx || page).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || page).querySelectorAll(sel));

  /* ---------------- armazenamento (localStorage seguro) ---------------- */
  const store = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem('sinart:' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('sinart:' + key, JSON.stringify(value)); } catch (e) { /* ignora */ }
    },
    remove(key) {
      try { localStorage.removeItem('sinart:' + key); } catch (e) { /* ignora */ }
    },
  };

  /* ---------------- eventos ---------------- */
  const emit = (name, detail) =>
    page.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(message, type = 'success') {
    const el = $('.si-toast');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('is-error', 'is-success', 'is-info');
    el.classList.add('is-' + type);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  /* ---------------- modais ---------------- */
  function openModal(target) {
    const modal = typeof target === 'string' ? document.getElementById(target) : target;
    if (!modal) return;
    modal.hidden = false;
    modal.classList.add('is-open', 'open');
    modal.setAttribute('aria-hidden', 'false');
    const focusable = modal.querySelector('button, [href], input, select, textarea');
    if (focusable) focusable.focus();
  }

  function closeModal(target) {
    const modal = typeof target === 'string' ? document.getElementById(target) : target;
    if (!modal) return;
    modal.classList.remove('is-open', 'open');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;
    modal.dispatchEvent(new CustomEvent('si:modal-close', { bubbles: true }));
  }

  // [data-open-modal="id"] abre; [data-close-modal] / [data-dismiss] fecha; clique no fundo e ESC também.
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-modal]');
    if (opener) { e.preventDefault(); openModal(opener.dataset.openModal); return; }
    const closer = e.target.closest('[data-close-modal], [data-dismiss]');
    if (closer) { closeModal(closer.closest('.si-modal')); return; }
    if (e.target.classList && e.target.classList.contains('si-modal')) closeModal(e.target);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    $$('.si-modal.is-open', document).forEach(closeModal);
  });

  /* ---------------- abas ---------------- */
  const tabs = $$('.si-tabs .si-tab');
  const panels = $$('[data-panel]');
  const isSettings = page.classList.contains('si-settings');
  const grid = $('.si-settings-grid');

  function activateTab(name) {
    if (!tabs.length) return;
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    if (isSettings) {
      // "geral" mostra o painel geral em visão de conjunto; as demais abas mostram só o seu painel.
      const all = name === 'geral';
      if (grid) grid.classList.toggle('is-single', !all);
      panels.forEach((p) => { p.hidden = !all && p.dataset.panel !== name; });
    } else {
      panels.forEach((p) => p.classList.toggle('si-hidden', p.dataset.panel !== name));
    }
    emit('si:tab', { tab: name });
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));
  $$('[data-open-tab]').forEach((btn) =>
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.openTab);
      const bar = $('.si-tabs');
      if (bar) bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    })
  );

  /* ---------------- validação de formulários ---------------- */
  function setError(input, message) {
    if (!input) return;
    const field = input.closest('.si-field') || input.parentElement;
    field.classList.add('has-error');
    let msg = field.querySelector(':scope > .si-error');
    if (!msg) {
      msg = document.createElement('small');
      msg.className = 'si-error';
      msg.setAttribute('role', 'alert');
      field.appendChild(msg);
    }
    msg.textContent = message;
  }

  function clearErrors(form) {
    $$('.has-error', form).forEach((el) => el.classList.remove('has-error'));
    $$('.si-error', form).forEach((el) => el.remove());
  }

  function collect(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (key in data) data[key] = [].concat(data[key], value);
      else data[key] = value;
    });
    // checkboxes desmarcados não entram no FormData
    $$('input[type="checkbox"][name]', form).forEach((cb) => {
      if (!(cb.name in data)) data[cb.name] = false;
      else if (cb.checked && data[cb.name] === 'on') data[cb.name] = true;
    });
    return data;
  }

  /* ---------------- utilitários ---------------- */
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = String(iso).split('-');
    return y && m && d ? `${d}/${m}/${y}` : String(iso);
  }

  const today = () => new Date().toLocaleDateString('pt-BR');

  /* ---------------- tema / cor (aba Aparência) ---------------- */
  const systemDark = () => matchMedia('(prefers-color-scheme: dark)').matches;
  $$('[data-theme-choice]').forEach((btn) =>
    btn.addEventListener('click', () => {
      $$('[data-theme-choice]').forEach((b) => b.classList.toggle('selected', b === btn));
      const choice = btn.dataset.themeChoice;
      const theme = choice === 'system' ? (systemDark() ? 'dark' : 'light') : choice;
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('sinart-theme', theme); } catch (e) { /* ignora */ }
    })
  );
  $$('.si-color-dot').forEach((dot) =>
    dot.addEventListener('click', () => {
      $$('.si-color-dot').forEach((d) => d.classList.toggle('selected', d === dot));
    })
  );

  /* ---------------- estado inicial das abas ---------------- */
  const initial = tabs.find((t) => t.classList.contains('active')) || tabs[0];
  if (initial) activateTab(initial.dataset.tab);

  window.SINART = {
    page, root, $, $$, store, toast, openModal, closeModal, activateTab,
    setError, clearErrors, collect, emit, isEmail, formatDate, today,
  };
})();