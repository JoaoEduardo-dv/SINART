/* Aulas e Horários — abas, filtros e links configuráveis */
(() => {
  "use strict";

  // Coloque os endereços das páginas do Django aqui, ou substitua os href="#" no HTML.
  const LINKS_AH = {
    "cadastrar-aula": "",
    "semana-anterior": "",
    "semana-proxima": "",
    "ver-lista": "",
    "editar-disciplina": "",
    "detalhes-professor": ""
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Aplica somente URLs preenchidas. Enquanto estiver vazio, o clique não navega.
  $$('[data-ah-link]').forEach((element) => {
    const url = LINKS_AH[element.dataset.ahLink];
    if (url) element.setAttribute('href', url);
  });
  $$('a[data-ah-link][href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  // Abas: cada botão mostra seu painel e atualiza os estados acessíveis.
  const tabs = $$('#ahAbas [data-tab]');
  const panels = $$('[data-panel]');
  const gradeFilters = $('[data-grade-filters]');

  function activateTab(name, moveFocus = false) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.tab === name;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== name;
    });
    if (gradeFilters) gradeFilters.hidden = name !== 'grade';
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[nextIndex].dataset.tab, true);
    });
  });
  activateTab('grade');

  // Filtro da grade por professor.
  const filtroProf = $('#filtroProf');
  const cards = $$('.ah-card');
  if (filtroProf) {
    filtroProf.addEventListener('change', () => {
      const professor = filtroProf.value;
      cards.forEach((card) => {
        card.classList.toggle('is-dim', Boolean(professor) && card.dataset.prof !== professor);
      });
    });
  }

  // O semestre mantém o comportamento atual de envio do formulário GET.
  const filtroSemestre = $('#filtroSemestre');
  const formFiltros = $('#formFiltros');
  if (filtroSemestre && formFiltros) {
    filtroSemestre.addEventListener('change', () => formFiltros.submit());
  }

  // Pesquisa local nas listas de disciplinas e professores.
  function setupSearch(inputSelector, itemSelector, emptySelector) {
    const input = $(inputSelector);
    const items = $$(itemSelector);
    const empty = $(emptySelector);
    if (!input) return;

    const filter = () => {
      const query = input.value.trim().toLocaleLowerCase('pt-BR');
      let visible = 0;
      items.forEach((item) => {
        const content = (item.dataset.search || item.textContent).toLocaleLowerCase('pt-BR');
        const matches = content.includes(query);
        item.hidden = !matches;
        if (matches) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
    };
    input.addEventListener('input', filter);
  }

  setupSearch('#buscarDisciplina', '#listaDisciplinas tr', '#semDisciplinas');
  setupSearch('#buscarProfessor', '#listaProfessores .ah-teacher-card', '#semProfessores');
})();