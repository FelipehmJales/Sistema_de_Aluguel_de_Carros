import { apiFetch } from '../api/httpClient.js';
import { salvarSessao, obterSessao } from '../auth/session.js';

function exibirMensagem(texto, tipo = 'danger') {
  const alerta = document.getElementById('feedbackAlert');
  alerta.className = `alert alert-${tipo} shadow-sm`;
  alerta.textContent = texto;
  alerta.classList.remove('d-none');
}

function adicionarCampoRendimento(entidade = '', valor = '') {
  const container = document.getElementById('listaRendimentosInputs');
  if (container.querySelectorAll('.rendimento-row').length >= 3) {
    alert('Máximo de 3 rendimentos permitidos por cliente.');
    return;
  }

  const div = document.createElement('div');
  div.className = 'row g-2 mb-2 rendimento-row align-items-center';
  div.innerHTML = `
    <div class="col-7">
      <input type="text" class="form-control form-control-sm input-entidade" placeholder="Entidade Empregadora" value="${entidade}" required>
    </div>
    <div class="col-4">
      <input type="number" class="form-control form-control-sm input-valor" placeholder="R$ Valor" min="0" step="0.01" value="${valor}" required>
    </div>
    <div class="col-1 text-end">
      <button type="button" class="btn btn-sm btn-outline-danger btn-remover-rendimento">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;

  div.querySelector('.btn-remover-rendimento').addEventListener('click', () => {
    if (container.querySelectorAll('.rendimento-row').length > 1) {
      div.remove();
    } else {
      alert('Informe pelo menos 1 rendimento.');
    }
  });

  container.appendChild(div);
}

document.addEventListener('DOMContentLoaded', () => {
  const sessaoAtiva = obterSessao();
  if (sessaoAtiva) {
    window.location.href = sessaoAtiva.perfil === 'CLIENTE' ? 'cliente.html' : 'agente.html';
    return;
  }

  adicionarCampoRendimento();
  document.getElementById('btnAddRendimento').addEventListener('click', () => adicionarCampoRendimento());

  document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const perfil = document.getElementById('loginPerfil').value;
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value.trim();

    const colecao = perfil === 'CLIENTE' ? 'clientes' : 'agentes';
    const registos = await apiFetch(colecao);
    const usuario = registos.find(u => u.email.toLowerCase() === email && String(u.senha) === senha);

    if (!usuario) {
      exibirMensagem('Credenciais inválidas para o perfil selecionado.');
      return;
    }

    salvarSessao(usuario, perfil);
    window.location.href = perfil === 'CLIENTE' ? 'cliente.html' : 'agente.html';
  });

  document.getElementById('formCadastroCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const clientesExistentes = await apiFetch('clientes');

    if (clientesExistentes.some(c => c.email.toLowerCase() === email)) {
      exibirMensagem('Este e-mail já está registado.');
      return;
    }

    const rendimentos = [];
    document.querySelectorAll('#listaRendimentosInputs .rendimento-row').forEach(row => {
      const entidade = row.querySelector('.input-entidade').value.trim();
      const valor = parseFloat(row.querySelector('.input-valor').value) || 0;
      if (entidade) rendimentos.push({ entidade, valor });
    });

    const novoCliente = await apiFetch('clientes', {
      method: 'POST',
      body: JSON.stringify({
        nome: document.getElementById('cadNome').value.trim(),
        email,
        senha: document.getElementById('cadSenha').value.trim(),
        rg: document.getElementById('cadRg').value.trim(),
        cpf: document.getElementById('cadCpf').value.trim(),
        endereco: document.getElementById('cadEndereco').value.trim(),
        profissao: document.getElementById('cadProfissao').value.trim(),
        rendimentos
      })
    });

    salvarSessao(novoCliente, 'CLIENTE');
    window.location.href = 'cliente.html';
  });
});