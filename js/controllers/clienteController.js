import { apiFetch } from '../api/httpClient.js';
import { exigirPerfil, encerrarSessao, salvarSessao } from '../auth/session.js';

let sessao = null;
let estado = {
  clienteAtual: null,
  automoveis: [],
  agentes: [],
  meusPedidos: []
};

async function carregarDadosCliente() {
  const [clienteAtual, automoveis, agentes, todosPedidos] = await Promise.all([
    apiFetch(`clientes/${sessao.id}`),
    apiFetch('automoveis'),
    apiFetch('agentes'),
    apiFetch('pedidos')
  ]);

  estado.clienteAtual = clienteAtual;
  estado.automoveis = automoveis;
  estado.agentes = agentes;
  estado.meusPedidos = todosPedidos.filter(p => String(p.clienteId) === String(sessao.id));

  document.getElementById('headerNomeCliente').innerHTML = `<i class="bi bi-person-circle me-1"></i>${clienteAtual.nome}`;
  renderizarSelectsPedido();
  renderizarMeusPedidos();
  preencherFormularioPerfil();
}

function renderizarSelectsPedido() {
  const selectAuto = document.getElementById('pedidoAutomovelId');
  const selectBanco = document.getElementById('pedidoBancoId');
  const autoSelecionado = selectAuto.value;

  selectAuto.innerHTML = '<option value="">Selecione um veículo da frota...</option>' +
    estado.automoveis.map(a => `<option value="${a.id}">${a.marca} ${a.modelo} (${a.placa}) - R$ ${a.diaria}/dia</option>`).join('');

  const bancos = estado.agentes.filter(ag => ag.tipo === 'Banco');
  selectBanco.innerHTML = bancos.map(b => `<option value="${b.id}">${b.nome}</option>`).join('');

  if (autoSelecionado) selectAuto.value = autoSelecionado;
  atualizarSimulacaoValor();
}

function atualizarSimulacaoValor() {
  const autoId = document.getElementById('pedidoAutomovelId').value;
  const dias = Number(document.getElementById('pedidoDias').value) || 0;
  const auto = estado.automoveis.find(a => String(a.id) === String(autoId));
  const total = auto ? auto.diaria * dias : 0;
  document.getElementById('pedidoValorEstimado').value = `R$ ${total.toLocaleString('pt-BR')}`;
  return total;
}

function renderizarMeusPedidos() {
  const container = document.getElementById('listaPedidosCliente');
  document.getElementById('contadorPedidos').textContent = estado.meusPedidos.length;
  container.innerHTML = '';

  if (estado.meusPedidos.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4 mb-0">Você ainda não possui pedidos de aluguel.</p>';
    return;
  }

  estado.meusPedidos.forEach(pedido => {
    const auto = estado.automoveis.find(a => String(a.id) === String(pedido.automovelId));
    const banco = pedido.contratoCredito
      ? estado.agentes.find(b => String(b.id) === String(pedido.contratoCredito.bancoId))
      : null;

    let classeCor = 'pedido-status-analise';
    let badgeClass = 'bg-warning text-dark';
    if (pedido.status.includes('Aprovado')) { classeCor = 'pedido-status-aprovado'; badgeClass = 'bg-info text-dark'; }
    if (pedido.status.includes('Execução')) { classeCor = 'pedido-status-executado'; badgeClass = 'bg-success'; }
    if (pedido.status.includes('Rejeitado') || pedido.status.includes('Cancelado')) { classeCor = 'pedido-status-rejeitado'; badgeClass = 'bg-danger'; }

    const podeEditar = !pedido.status.includes('Cancelado') && !pedido.status.includes('Execução');

    const card = document.createElement('div');
    card.className = `card mb-3 shadow-sm pedido-card ${classeCor}`;
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge ${badgeClass} mb-2">${pedido.status}</span>
            <h6 class="fw-bold mb-1">
              Pedido #${pedido.id} — ${auto ? `${auto.marca} ${auto.modelo} (${auto.placa})` : 'Veículo Indisponível'}
            </h6>
            <div class="small text-muted mb-2">
              <i class="bi bi-calendar-event me-1"></i>Início: ${pedido.dataInicio} (${pedido.dias} dias)
            </div>
          </div>
          <div class="text-end">
            <div class="fs-5 fw-bold text-primary">R$ ${Number(pedido.valorTotal).toLocaleString('pt-BR')}</div>
            <span class="badge bg-secondary-subtle text-secondary">Propriedade: ${pedido.tipoPropriedade}</span>
          </div>
        </div>

        ${pedido.requerCredito && pedido.contratoCredito ? `
          <div class="small bg-light p-2 rounded border mb-2">
            <i class="bi bi-bank me-1 text-primary"></i>
            <strong>Crédito:</strong> ${banco ? banco.nome : 'Banco'} — ${pedido.contratoCredito.parcelas}x (${pedido.contratoCredito.taxaJuros}% a.m.)
          </div>
        ` : ''}

        <div class="small text-secondary mb-2">
          <i class="bi bi-chat-left-quote me-1"></i><strong>Parecer do Agente:</strong> ${pedido.parecerAgente}
        </div>

        <div class="d-flex justify-content-end gap-2">
          ${podeEditar ? `
            <button class="btn btn-sm btn-outline-primary btn-modificar" data-id="${pedido.id}">
              <i class="bi bi-pencil me-1"></i>Modificar
            </button>
            <button class="btn btn-sm btn-outline-danger btn-cancelar" data-id="${pedido.id}">
              <i class="bi bi-x-circle me-1"></i>Cancelar Pedido
            </button>
          ` : ''}
        </div>
      </div>
    `;

    const btnMod = card.querySelector('.btn-modificar');
    if (btnMod) btnMod.addEventListener('click', () => prepararModificacaoPedido(pedido.id));

    const btnCanc = card.querySelector('.btn-cancelar');
    if (btnCanc) btnCanc.addEventListener('click', () => cancelarPedido(pedido.id));

    container.appendChild(card);
  });
}

function prepararModificacaoPedido(id) {
  const pedido = estado.meusPedidos.find(p => String(p.id) === String(id));
  if (!pedido) return;

  document.getElementById('pedidoId').value = pedido.id;
  document.getElementById('pedidoAutomovelId').value = pedido.automovelId;
  document.getElementById('pedidoDataInicio').value = pedido.dataInicio;
  document.getElementById('pedidoDias').value = pedido.dias;
  document.getElementById('pedidoTipoPropriedade').value = pedido.tipoPropriedade;
  document.getElementById('pedidoRequerCredito').checked = !!pedido.requerCredito;

  const blocoCredito = document.getElementById('blocoContratoCredito');
  if (pedido.requerCredito && pedido.contratoCredito) {
    blocoCredito.classList.remove('d-none');
    document.getElementById('pedidoBancoId').value = pedido.contratoCredito.bancoId;
    document.getElementById('pedidoParcelas').value = pedido.contratoCredito.parcelas;
  } else {
    blocoCredito.classList.add('d-none');
  }

  atualizarSimulacaoValor();
  document.getElementById('formPedidoTitulo').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Modificar Pedido #${pedido.id}`;
  document.getElementById('btnCancelarEdicaoPedido').classList.remove('d-none');
}

async function cancelarPedido(id) {
  if (!confirm('Deseja realmente cancelar este pedido de aluguel?')) return;
  await apiFetch(`pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'Cancelado pelo Cliente',
      parecerAgente: 'Pedido cancelado pelo cliente contratante.'
    })
  });
  await carregarDadosCliente();
}

function adicionarCampoRendimentoPerfil(entidade = '', valor = '') {
  const container = document.getElementById('listaRendimentosPerfil');
  if (container.querySelectorAll('.rendimento-row').length >= 3) {
    alert('Máximo de 3 rendimentos permitidos.');
    return;
  }

  const div = document.createElement('div');
  div.className = 'row g-2 mb-2 rendimento-row align-items-center';
  div.innerHTML = `
    <div class="col-7">
      <input type="text" class="form-control form-control-sm input-entidade" value="${entidade}" required>
    </div>
    <div class="col-4">
      <input type="number" class="form-control form-control-sm input-valor" min="0" step="0.01" value="${valor}" required>
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
    }
  });

  container.appendChild(div);
}

function preencherFormularioPerfil() {
  const c = estado.clienteAtual;
  document.getElementById('perfilNome').value = c.nome;
  document.getElementById('perfilProfissao').value = c.profissao;
  document.getElementById('perfilEmail').value = c.email;
  document.getElementById('perfilSenha').value = c.senha;
  document.getElementById('perfilRg').value = c.rg;
  document.getElementById('perfilCpf').value = c.cpf;
  document.getElementById('perfilEndereco').value = c.endereco;

  const container = document.getElementById('listaRendimentosPerfil');
  container.innerHTML = '';
  (c.rendimentos || []).forEach(r => adicionarCampoRendimentoPerfil(r.entidade, r.valor));
  if ((c.rendimentos || []).length === 0) adicionarCampoRendimentoPerfil();
}

document.addEventListener('DOMContentLoaded', async () => {
  sessao = exigirPerfil('CLIENTE');
  if (!sessao) return;

  document.getElementById('btnLogout').addEventListener('click', encerrarSessao);
  document.getElementById('pedidoDataInicio').valueAsDate = new Date();

  await carregarDadosCliente();

  document.getElementById('pedidoAutomovelId').addEventListener('change', atualizarSimulacaoValor);
  document.getElementById('pedidoDias').addEventListener('input', atualizarSimulacaoValor);
  document.getElementById('pedidoRequerCredito').addEventListener('change', (e) => {
    document.getElementById('blocoContratoCredito').classList.toggle('d-none', !e.target.checked);
  });

  document.getElementById('btnCancelarEdicaoPedido').addEventListener('click', () => {
    document.getElementById('formPedido').reset();
    document.getElementById('pedidoId').value = '';
    document.getElementById('pedidoDataInicio').valueAsDate = new Date();
    document.getElementById('blocoContratoCredito').classList.add('d-none');
    document.getElementById('formPedidoTitulo').innerHTML = '<i class="bi bi-plus-circle-fill me-2"></i>Introduzir Pedido de Aluguel';
    document.getElementById('btnCancelarEdicaoPedido').classList.add('d-none');
    atualizarSimulacaoValor();
  });

  document.getElementById('formPedido').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pedidoId').value;
    const valorTotal = atualizarSimulacaoValor();
    const requerCredito = document.getElementById('pedidoRequerCredito').checked;
    const parcelas = Number(document.getElementById('pedidoParcelas').value);
    const taxaJuros = parcelas <= 6 ? 1.49 : (parcelas === 12 ? 1.69 : 1.89);

    const payload = {
      clienteId: Number(sessao.id),
      automovelId: Number(document.getElementById('pedidoAutomovelId').value),
      dataInicio: document.getElementById('pedidoDataInicio').value,
      dias: Number(document.getElementById('pedidoDias').value),
      valorTotal,
      tipoPropriedade: document.getElementById('pedidoTipoPropriedade').value,
      requerCredito,
      contratoCredito: requerCredito ? {
        bancoId: Number(document.getElementById('pedidoBancoId').value),
        valorFinanciado: valorTotal,
        parcelas,
        taxaJuros
      } : null,
      status: 'Em Análise Financeira',
      parecerAgente: id
        ? 'Pedido modificado pelo cliente. Reencaminhado para análise financeira.'
        : 'Aguardando avaliação do agente financeiro.'
    };

    if (id) {
      await apiFetch(`pedidos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiFetch('pedidos', { method: 'POST', body: JSON.stringify(payload) });
    }

    document.getElementById('btnCancelarEdicaoPedido').click();
    await carregarDadosCliente();
  });

  document.getElementById('btnAddRendimentoPerfil').addEventListener('click', () => adicionarCampoRendimentoPerfil());

  document.getElementById('formPerfilCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rendimentos = [];
    document.querySelectorAll('#listaRendimentosPerfil .rendimento-row').forEach(row => {
      const entidade = row.querySelector('.input-entidade').value.trim();
      const valor = parseFloat(row.querySelector('.input-valor').value) || 0;
      if (entidade) rendimentos.push({ entidade, valor });
    });

    const atualizado = await apiFetch(`clientes/${sessao.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nome: document.getElementById('perfilNome').value.trim(),
        profissao: document.getElementById('perfilProfissao').value.trim(),
        email: document.getElementById('perfilEmail').value.trim(),
        senha: document.getElementById('perfilSenha').value.trim(),
        rg: document.getElementById('perfilRg').value.trim(),
        cpf: document.getElementById('perfilCpf').value.trim(),
        endereco: document.getElementById('perfilEndereco').value.trim(),
        rendimentos
      })
    });

    salvarSessao(atualizado, 'CLIENTE');
    alert('Dados cadastrais atualizados com sucesso!');
    await carregarDadosCliente();
  });

  document.getElementById('btnExcluirConta').addEventListener('click', async () => {
    if (!confirm('Deseja excluir permanentemente o seu cadastro?')) return;
    await apiFetch(`clientes/${sessao.id}`, { method: 'DELETE' });
    encerrarSessao();
  });
});