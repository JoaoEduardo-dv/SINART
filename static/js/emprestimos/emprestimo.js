/* ==========================================================================
   Empréstimos — comportamento da página
   Funciona direto sobre o HTML renderizado (inclusive com {% for %} do Django):
   cada <tr data-emp-row> precisa de data-type, data-status e data-loan.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.querySelector('[data-emp]');
  if (!root) return;

  const PAGE_SIZE = Number(root.dataset.pageSize) || 5;
  const rows = Array.from(root.querySelectorAll('[data-emp-row]'));

  const els = {
    tabs: Array.from(root.querySelectorAll('[data-tab]')),
    search: root.querySelector('[data-search]'),
    type: root.querySelector('[data-filter-type]'),
    status: root.querySelector('[data-filter-status]'),
    from: root.querySelector('[data-period-from]'),
    to: root.querySelector('[data-period-to]'),
    periodBtn: root.querySelector('.emp-period__btn'),
    periodLabel: root.querySelector('[data-period-label]'),
    filtersBtn: root.querySelector('[data-filters-toggle]'),
    filtersExtra: root.querySelector('[data-filters-extra]'),
    empty: root.querySelector('[data-empty]'),
    count: root.querySelector('[data-count]'),
    pagination: root.querySelector('[data-pagination]'),
  };

  const state = { tab: 'andamento', q: '', type: '', status: '', from: '', to: '', page: 1 };

  /* ---------- utilitários ---------- */
  const normalize = (s) =>
    (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const formatDate = (iso) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  // Texto pesquisável de cada linha (item, patrimônio, pessoa e cargo)
  rows.forEach((row) => {
    const parts = row.querySelectorAll('.emp-item__name, .emp-item__meta, .emp-person__name, .emp-person__role');
    row._search = normalize(Array.from(parts, (p) => p.textContent).join(' '));
  });

  // Imagem do item que não carregar: mostra o ícone de fallback
  root.querySelectorAll('.emp-thumb img').forEach((img) => {
    const markEmpty = () => img.closest('.emp-thumb').classList.add('is-empty');
    img.addEventListener('error', markEmpty);
    if (img.complete && img.naturalWidth === 0) markEmpty();
  });

  /* ---------- regras de filtro ---------- */
  const matchesTab = (row) => {
    const status = row.dataset.status;
    switch (state.tab) {
      case 'andamento':  return status === 'andamento' || status === 'atrasado';
      case 'devolvidos': return status === 'devolvido';
      case 'atrasados':  return status === 'atrasado';
      default:           return true; // histórico: tudo
    }
  };

  const matches = (row) => {
    if (!matchesTab(row)) return false;
    if (state.q && !row._search.includes(state.q)) return false;
    if (state.type && row.dataset.type !== state.type) return false;
    if (state.status && row.dataset.status !== state.status) return false;
    const loan = row.dataset.loan;
    if (state.from && loan < state.from) return false;
    if (state.to && loan > state.to) return false;
    return true;
  };

  /* ---------- renderização ---------- */
  function render() {
    closePopovers();

    const filtered = rows.filter(matches);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(state.page, pages);

    const start = (state.page - 1) * PAGE_SIZE;
    const visible = new Set(filtered.slice(start, start + PAGE_SIZE));
    rows.forEach((row) => { row.hidden = !visible.has(row); });

    els.empty.hidden = total > 0;
    els.count.textContent = total
      ? `Mostrando ${start + 1} a ${start + visible.size} de ${total} ${total === 1 ? 'item' : 'itens'}`
      : 'Nenhum item para mostrar';

    renderPagination(pages);
  }

  function pageList(current, pages) {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const set = new Set([1, pages, current, current - 1, current + 1]);
    const list = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    const out = [];
    list.forEach((n, i) => {
      if (i && n - list[i - 1] > 1) out.push('…');
      out.push(n);
    });
    return out;
  }

  function renderPagination(pages) {
    els.pagination.hidden = pages <= 1;
    els.pagination.innerHTML = '';

    const arrow = (dir, label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'emp-page-btn';
      b.setAttribute('aria-label', label);
      b.disabled = dir < 0 ? state.page === 1 : state.page === pages;
      b.innerHTML = `<svg class="emp-icon" aria-hidden="true"><use href="#i-chevron-${dir < 0 ? 'left' : 'right'}"/></svg>`;
      b.addEventListener('click', () => goTo(state.page + dir));
      return b;
    };

    els.pagination.append(arrow(-1, 'Página anterior'));
    pageList(state.page, pages).forEach((n) => {
      if (n === '…') {
        const gap = document.createElement('span');
        gap.className = 'emp-page-gap';
        gap.textContent = '…';
        els.pagination.append(gap);
        return;
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'emp-page-btn' + (n === state.page ? ' is-current' : '');
      b.textContent = n;
      b.setAttribute('aria-label', `Página ${n}`);
      if (n === state.page) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', () => goTo(n));
      els.pagination.append(b);
    });
    els.pagination.append(arrow(1, 'Próxima página'));
  }

  function goTo(page) {
    state.page = page;
    render();
  }

  function update(patch) {
    Object.assign(state, patch, { page: 1 });
    render();
  }

  /* ---------- abas ---------- */
  function selectTab(tab, focus) {
    els.tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
      t.tabIndex = active ? 0 : -1;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    update({ tab: tab.dataset.tab });
  }

  els.tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1 };
      if (e.key === 'Home') { e.preventDefault(); selectTab(els.tabs[0], true); }
      else if (e.key === 'End') { e.preventDefault(); selectTab(els.tabs[els.tabs.length - 1], true); }
      else if (keys[e.key]) {
        e.preventDefault();
        selectTab(els.tabs[(i + keys[e.key] + els.tabs.length) % els.tabs.length], true);
      }
    });
  });

  /* ---------- busca e selects ---------- */
  let searchTimer;
  els.search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => update({ q: normalize(els.search.value) }), 150);
  });

  [['type', els.type], ['status', els.status]].forEach(([key, select]) => {
    select.addEventListener('change', () => {
      select.classList.toggle('has-value', !!select.value);
      update({ [key]: select.value });
    });
  });

  /* ---------- período ---------- */
  function applyPeriod() {
    let { value: from } = els.from;
    let { value: to } = els.to;
    if (from && to && from > to) [from, to] = [to, from];
    els.from.value = from;
    els.to.value = to;

    let label = 'Período';
    if (from && to) label = `${formatDate(from)} – ${formatDate(to)}`;
    else if (from) label = `A partir de ${formatDate(from)}`;
    else if (to) label = `Até ${formatDate(to)}`;

    els.periodLabel.textContent = label;
    els.periodBtn.classList.toggle('has-value', !!(from || to));
    update({ from, to });
  }

  root.querySelector('[data-period-apply]').addEventListener('click', applyPeriod);
  root.querySelector('[data-period-clear]').addEventListener('click', () => {
    els.from.value = '';
    els.to.value = '';
    applyPeriod();
  });

  /* ---------- botão "Filtros" ---------- */
  // Em telas estreitas mostra/esconde os filtros; em telas largas (já visíveis) foca a busca.
  els.filtersBtn.addEventListener('click', () => {
    const alreadyVisible = getComputedStyle(els.filtersExtra).display !== 'none' &&
                           !els.filtersExtra.classList.contains('is-open') ;
    if (alreadyVisible) { els.search.focus(); return; }
    const open = els.filtersExtra.classList.toggle('is-open');
    els.filtersBtn.setAttribute('aria-expanded', open);
  });

  /* ---------- popovers (período e menu de ações) ---------- */
  function closePopovers(except) {
    root.querySelectorAll('[data-popover]').forEach((pop) => {
      if (pop === except) return;
      const btn = pop.querySelector('[data-popover-toggle]');
      const panel = pop.querySelector('.emp-popover, .emp-menu');
      if (panel && !panel.hidden) {
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  root.querySelectorAll('[data-popover]').forEach((pop) => {
    const btn = pop.querySelector('[data-popover-toggle]');
    const panel = pop.querySelector('.emp-popover, .emp-menu');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const opening = panel.hidden;
      closePopovers(pop);
      panel.hidden = !opening;
      btn.setAttribute('aria-expanded', opening);
      if (!opening) return;

      // Abre para cima quando não há espaço embaixo
      panel.classList.remove('is-up');
      const rect = panel.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 8 && btn.getBoundingClientRect().top > rect.height + 16) {
        panel.classList.add('is-up');
      }
      const first = panel.querySelector('a, input');
      if (first && panel.classList.contains('emp-menu')) first.focus();
    });

    panel.addEventListener('click', (e) => e.stopPropagation());

    panel.addEventListener('keydown', (e) => {
      if (!panel.classList.contains('emp-menu')) return;
      const items = Array.from(panel.querySelectorAll('a'));
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
  });

  document.addEventListener('click', () => closePopovers());
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = root.querySelector('[data-popover] [aria-expanded="true"]');
    closePopovers();
    if (open) open.focus();
  });

  render();
})();