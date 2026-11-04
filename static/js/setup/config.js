/* SINART – Configurações. Requer si-base.js carregado antes. */
(() => {
  'use strict';
  const S = window.SINART;
  if (!S || !S.page.classList.contains('si-settings')) return;
  const { page, root, $, $$, store, toast, openModal, closeModal, activateTab, setError, clearErrors, collect, emit, isEmail, formatDate, today } = S;

  /* ======================================================================
     CONFIGURAÇÕES
     ====================================================================== */
  $$('form[data-si-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const native = form.dataset.submit === 'native';
      if (!native) e.preventDefault();
      const detail = { form: form.dataset.siForm, data: collect(form) };
      emit('si:save', detail);
      if (native) return;
      const btn = $('button[type="submit"]', form);
      if (btn) {
        btn.disabled = true;
        setTimeout(() => { btn.disabled = false; toast(form.dataset.success || 'Alterações salvas com sucesso.'); }, 450);
      }
    });
  });

  // Modo de manutenção pede confirmação ao ligar
  const maintenance = $('#siMaintenance');
  if (maintenance) {
    maintenance.addEventListener('change', () => { if (maintenance.checked) openModal('siModalManutencao'); });
    const modal = document.getElementById('siModalManutencao');
    if (modal) {
      let confirmed = false;
      $('[data-confirm-maintenance]', modal).addEventListener('click', () => { confirmed = true; closeModal(modal); toast('Modo de manutenção ativado. Salve para aplicar.', 'info'); });
      modal.addEventListener('si:modal-close', () => { if (!confirmed) maintenance.checked = false; confirmed = false; });
    }
  }

  // Integrações (apenas interface – a conexão real depende do servidor)
  $$('[data-integration]').forEach((btn) => btn.addEventListener('click', () => {
    const status = btn.closest('.si-integration').querySelector('.si-status');
    const on = status.classList.toggle('is-on');
    status.textContent = on ? 'Conectado' : 'Não conectado';
    btn.textContent = on ? 'Desconectar' : 'Conectar';
    toast(on ? 'Integração marcada como conectada.' : 'Integração desconectada.', 'info');
  }));

  // Backup manual (simulação de progresso)
  const backupBtn = $('#siBackupNow');
  if (backupBtn) {
    const bar = $('.si-progress span');
    backupBtn.addEventListener('click', () => {
      backupBtn.disabled = true;
      let p = 0;
      const timer = setInterval(() => {
        p = Math.min(100, p + 12 + Math.random() * 14);
        if (bar) bar.style.width = p + '%';
        if (p >= 100) {
          clearInterval(timer);
          backupBtn.disabled = false;
          const last = $('[data-backup-last]');
          if (last) last.textContent = new Date().toLocaleString('pt-BR');
          toast('Backup solicitado com sucesso.');
          setTimeout(() => { if (bar) bar.style.width = '0'; }, 1200);
        }
      }, 260);
    });
  }
})();
