/* SINART – Meu Perfil. Requer si-base.js carregado antes. */
(() => {
  'use strict';
  const S = window.SINART;
  if (!S || !S.page.classList.contains('si-profile')) return;
  const { page, root, $, $$, store, toast, openModal, closeModal, activateTab, setError, clearErrors, collect, emit, isEmail, formatDate, today } = S;

  /* ======================================================================
     MEU PERFIL
     ====================================================================== */
  const bind = (key, value) => $$('[data-bind="' + key + '"]').forEach((el) => {
    el.textContent = el.dataset.bindFormat ? el.dataset.bindFormat.replace('%s', value) : value;
  });

  // Foto de perfil
  const avatarInput = $('#siAvatarInput');
  const avatarBtn = $('[data-avatar-change]');
  if (avatarInput && avatarBtn) {
    avatarBtn.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', () => {
      const file = avatarInput.files[0];
      if (!file) return;
      if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) { toast('Use uma imagem PNG, JPG ou WEBP.', 'error'); avatarInput.value = ''; return; }
      if (file.size > 2 * 1024 * 1024) { toast('A imagem deve ter no máximo 2 MB.', 'error'); avatarInput.value = ''; return; }
      const reader = new FileReader();
      reader.onload = () => {
        const avatar = $('.si-avatar');
        avatar.style.backgroundImage = 'url("' + reader.result + '")';
        avatar.classList.add('has-photo');
        emit('si:avatar', { file });
        toast('Foto atualizada.');
      };
      reader.readAsDataURL(file);
    });
  }

  // Editar perfil
  const editForm = $('#siFormEditar');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      const native = editForm.dataset.submit === 'native';
      clearErrors(editForm);
      const f = editForm.elements;
      let ok = true;
      const fail = (input, msg) => { setError(input, msg); ok = false; };

      if (f.nome.value.trim().split(/\s+/).filter(Boolean).length < 2) fail(f.nome, 'Informe nome e sobrenome.');
      if (!f.nascimento.value) fail(f.nascimento, 'Informe a data de nascimento.');
      else if (new Date(f.nascimento.value) > new Date()) fail(f.nascimento, 'A data não pode ser futura.');
      const digits = f.telefone.value.replace(/\D/g, '');
      if (digits.length < 10) fail(f.telefone, 'Informe um telefone válido com DDD.');
      if (f.email_alternativo.value && !isEmail(f.email_alternativo.value)) fail(f.email_alternativo, 'E-mail inválido.');
      if (!f.formacao.value.trim()) fail(f.formacao, 'Informe sua formação.');

      if (!ok) { e.preventDefault(); const bad = $('.has-error input, .has-error select', editForm); if (bad) bad.focus(); return; }
      emit('si:save', { form: 'perfil', data: collect(editForm) });
      if (native) return;
      e.preventDefault();

      const nome = f.nome.value.trim();
      bind('nome', nome);
      bind('iniciais', nome.split(/\s+/).filter(Boolean).map((p, i, a) => (i === 0 || i === a.length - 1 ? p[0] : '')).join('').toUpperCase());
      bind('nascimento', formatDate(f.nascimento.value));
      bind('telefone', f.telefone.value);
      bind('email_alternativo', f.email_alternativo.value || '—');
      bind('formacao', f.formacao.value.trim());
      bind('departamento', f.departamento.value);
      toast('Perfil atualizado com sucesso.');
      activateTab('visao');
    });
    $('[data-cancel-edit]', editForm).addEventListener('click', () => { editForm.reset(); clearErrors(editForm); activateTab('visao'); });
  }

  // Segurança: senha
  const pwdForm = $('#siFormSenha');
  if (pwdForm) {
    const nova = pwdForm.elements.nova_senha;
    const meter = $('.si-meter', pwdForm);
    const reqs = $$('[data-req]', pwdForm);
    const evaluate = (v) => ({
      len: v.length >= 8,
      case: /[a-z]/.test(v) && /[A-Z]/.test(v),
      num: /\d/.test(v),
      sym: /[^A-Za-z0-9]/.test(v),
    });
    nova.addEventListener('input', () => {
      const r = evaluate(nova.value);
      const score = Object.values(r).filter(Boolean).length;
      reqs.forEach((li) => li.classList.toggle('ok', r[li.dataset.req]));
      meter.dataset.level = nova.value ? score : 0;
      meter.firstElementChild.style.width = (nova.value ? score * 25 : 0) + '%';
    });
    pwdForm.addEventListener('submit', (e) => {
      const native = pwdForm.dataset.submit === 'native';
      clearErrors(pwdForm);
      const f = pwdForm.elements;
      let ok = true;
      const fail = (input, msg) => { setError(input.closest('.si-input-wrap') ? input.closest('.si-input-wrap').firstElementChild : input, msg); ok = false; };
      const r = evaluate(f.nova_senha.value);
      if (!f.senha_atual.value) fail(f.senha_atual, 'Informe sua senha atual.');
      if (!Object.values(r).every(Boolean)) fail(f.nova_senha, 'A nova senha não atende a todos os requisitos.');
      else if (f.nova_senha.value === f.senha_atual.value) fail(f.nova_senha, 'A nova senha deve ser diferente da atual.');
      if (f.confirmar_senha.value !== f.nova_senha.value) fail(f.confirmar_senha, 'As senhas não coincidem.');
      if (!ok) { e.preventDefault(); return; }
      emit('si:save', { form: 'senha', data: { alterada: true } });
      if (native) return;
      e.preventDefault();
      pwdForm.reset();
      nova.dispatchEvent(new Event('input'));
      bind('senha_data', today());
      toast('Senha alterada com sucesso.');
    });
  }

  // 2FA (reflete no cartão "Segurança da conta")
  const twoFa = $('#siTwoFactor');
  if (twoFa) twoFa.addEventListener('change', () => {
    $$('[data-bind="2fa"]').forEach((el) => {
      el.textContent = twoFa.checked ? 'Ativada' : 'Desativada';
      el.className = twoFa.checked ? 'si-green' : 'si-red-text';
    });
    emit('si:save', { form: '2fa', data: { ativo: twoFa.checked } });
    toast('Autenticação em duas etapas ' + (twoFa.checked ? 'ativada.' : 'desativada.'), twoFa.checked ? 'success' : 'info');
  });

  // Preferências do perfil
  const prefForm = $('#siFormPreferencias');
  if (prefForm) prefForm.addEventListener('submit', (e) => {
    if (prefForm.dataset.submit !== 'native') e.preventDefault();
    emit('si:save', { form: 'preferencias', data: collect(prefForm) });
    if (prefForm.dataset.submit !== 'native') toast('Preferências salvas.');
  });

  // Dispositivos: encerrar sessão
  $$('[data-session-end]').forEach((btn) => btn.addEventListener('click', () => {
    btn.closest('.si-session').remove();
    toast('Sessão encerrada.', 'info');
    const list = $('#siSessionList');
    if (list && !$('.si-session', list)) list.innerHTML = '<p class="si-empty">Nenhuma outra sessão ativa.</p>';
  }));

  // Baixar meus dados
  const exportBtn = $('[data-confirm-export]');
  if (exportBtn) exportBtn.addEventListener('click', () => {
    emit('si:save', { form: 'exportar-dados', data: {} });
    closeModal(exportBtn.closest('.si-modal'));
    toast('Solicitação registrada. Você receberá um e-mail com o arquivo.', 'info');
  });

  // Atividade da conta: filtros
  const chips = $$('.si-chip[data-filter]');
  if (chips.length) {
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => { c.classList.toggle('active', c === chip); c.setAttribute('aria-pressed', c === chip); });
      const type = chip.dataset.filter;
      let visible = 0;
      $$('#siActivityFull .si-activity-row').forEach((row) => {
        const show = type === 'all' || row.dataset.type === type;
        row.hidden = !show;
        if (show) visible++;
      });
      const empty = $('#siActivityEmpty');
      if (empty) empty.hidden = visible > 0;
    }));
  }
})();
