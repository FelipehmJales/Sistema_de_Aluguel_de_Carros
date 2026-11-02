const API_URL = 'http://localhost:3000';
let usarFallbackLocal = false;

const DADOS_INICIAIS = {
  clientes: [
    {
      id: 1,
      nome: "Carlos Eduardo Mendes",
      rg: "MG-12.345.678",
      cpf: "123.456.789-00",
      endereco: "Av. Afonso Pena, 1500, Centro, Belo Horizonte - MG",
      profissao: "Engenheiro de Software",
      rendimentos: [
        { entidade: "Tech Solutions S.A.", valor: 8500 },
        { entidade: "Consultoria Dev Autônoma", valor: 3200 }
      ]
    },
    {
      id: 2,
      nome: "Mariana Costa Silva",
      rg: "MG-87.654.321",
      cpf: "987.654.321-11",
      endereco: "Rua da Bahia, 900, Lourdes, Belo Horizonte - MG",
      profissao: "Arquiteta Urbanista",
      rendimentos: [
        { entidade: "Construtora Horizonte Ltda", valor: 6800 }
      ]
    }
  ],
  automoveis: [
    { id: 1, matricula: "MAT-2025-001", ano: 2025, marca: "Volkswagen", modelo: "Nivus Highline 200 TSI", placa: "RMA-4B21", proprietarioAtual: "Empresa", diaria: 195 },
    { id: 2, matricula: "MAT-2024-002", ano: 2024, marca: "Toyota", modelo: "Corolla XEi 2.0", placa: "QXZ-9C10", proprietarioAtual: "Banco", diaria: 230 },
    { id: 3, matricula: "MAT-2024-003", ano: 2024, marca: "Jeep", modelo: "Compass Longitude", placa: "PAB-7D88", proprietarioAtual: "Empresa", diaria: 260 },
    { id: 4, matricula: "MAT-2023-004", ano: 2023, marca: "Fiat", modelo: "Pulse Audace Turbo", placa: "OXY-3E45", proprietarioAtual: "Empresa", diaria: 160 }
  ],
  agentes: [
    { id: 1, nome: "Localiza Rent a Car S.A.", tipo: "Empresa", documento: "16.670.085/0001-55" },
    { id: 2, nome: "Banco Itaú Financiamentos", tipo: "Banco", documento: "60.701.190/0001-04" },
    { id: 3, nome: "Banco Santander Leasing", tipo: "Banco", documento: "90.400.888/0001-42" }
  ],
  pedidos: [
    {
      id: 1,
      clienteId: 1,
      automovelId: 1,
      dataInicio: "2026-11-10",
      dias: 15,
      valorTotal: 2925,
      tipoPropriedade: "Empresa",
      requerCredito: true,
      contratoCredito: { bancoId: 2, valorFinanciado: 2925, parcelas: 6, taxaJuros: 1.49 },
      status: "Em Análise Financeira",
      parecerAgente: "Aguardando avaliação do agente financeiro."
    },
    {
      id: 2,
      clienteId: 2,
      automovelId: 2,
      dataInicio: "2026-11-12",
      dias: 7,
      valorTotal: 1610,
      tipoPropriedade: "Banco",
      requerCredito: false,
      contratoCredito: null,
      status: "Aprovado - Aguardando Execução",
      parecerAgente: "Renda compatível. Parecer positivo concedido pela Localiza Rent a Car."
    }
  ]
};

let estado = {
  clientes: [],
  automoveis: [],
  agentes: [],
  pedidos: []
};

async function apiFetch(recurso, opcoes = {}) {
  if (!usarFallbackLocal) {
    try {
      const resposta = await fetch(`${API_URL}/${recurso}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opcoes
      });
      if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
      return await resposta.json();
    } catch (erro) {
      console.warn('JSON Server indisponível. A ativar fallback LocalStorage.', erro);
      usarFallbackLocal = true;
      document.getElementById('apiAlert').classList.remove('d-none');
      inicializarLocalStorage();
    }
  }

  const db = JSON.parse(localStorage.getItem('drivesys_db'));
  const [colecao, idParam] = recurso.split('/');
  const metodo = opcoes.method || 'GET';

  if (metodo === 'GET') {
    return db[colecao] || [];
  } else if (metodo === 'POST') {
    const novoItem = JSON.parse(opcoes.body);
    novoItem.id = Date.now();
    db[colecao].push(novoItem);
    localStorage.setItem('drivesys_db', JSON.stringify(db));
    return novoItem;
  } else if (metodo === 'PUT' || metodo === 'PATCH') {
    const dadosAtualizados = JSON.parse(opcoes.body);
    const index = db[colecao].findIndex(i => String(i.id) === String(idParam));
    if (index !== -1) {
      db[colecao][index] = { ...db[colecao][index], ...dadosAtualizados, id: Number(idParam) || idParam };
      localStorage.setItem('drivesys_db', JSON.stringify(db));
      return db[colecao][index];
    }
  } else if (metodo === 'DELETE') {
    db[colecao] = db[colecao].filter(i => String(i.id) !== String(idParam));
    localStorage.setItem('drivesys_db', JSON.stringify(db));
    return {};
  }
}

function inicializarLocalStorage() {
  if (!localStorage.getItem('drivesys_db')) {
    localStorage.setItem('drivesys_db', JSON.stringify(DADOS_INICIAIS));
  }
}

async function carregarTodosDados() {
  const [clientes, automoveis, agentes, pedidos] = await Promise.all([
    apiFetch('clientes'),
    apiFetch('automoveis'),
    apiFetch('agentes'),
    apiFetch('pedidos')
  ]);
  estado = { clientes, automoveis, agentes, pedidos };
  renderizarTudo();
}

function renderizarTudo() {
  renderizarTabelaClientes();
  renderizarSelectsPedido();
  renderizarPedidosCliente();
  renderizarPainelAgentes();
  renderizarFrota();
}

function adicionarCampoRendimento(entidade = '', valor = '') {
  const container = document.getElementById('listaRendimentosInputs');
  const totalAtual = container.querySelectorAll('.rendimento-row').length;
  if (totalAtual >= 3) {
    alert('O sistema permite registar no máximo 3 entidades empregadoras e respetivos rendimentos por cliente.');
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
      <button type="button" class="btn btn-sm btn-outline-danger btn-remover-rendimento" title="Remover">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;

  div.querySelector('.btn-remover-rendimento').addEventListener('click', () => {
    if (container.querySelectorAll('.rendimento-row').length > 1) {
      div.remove();
    } else {
      alert('O cliente deve informar pelo menos 1 rendimento.');
    }
  });

  container.appendChild(div);
}

function limparFormularioCliente() {
  document.getElementById('formCliente').reset();
  document.getElementById('clienteId').value = '';
  document.getElementById('formClienteTitulo').innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Cadastrar Novo Cliente';
  document.getElementById('btnCancelarEdicaoCliente').classList.add('d-none');
  const container = document.getElementById('listaRendimentosInputs');
  container.innerHTML = '';
  adicionarCampoRendimento();
}

function renderizarTabelaClientes() {
  const tbody = document.getElementById('tabelaClientesBody');
  document.getElementById('contadorClientes').textContent = estado.clientes.length;
  tbody.innerHTML = '';

  if (estado.clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum cliente cadastrado.</td></tr>';
    return;
  }

  estado.clientes.forEach(cliente => {
    const somaRendimentos = (cliente.rendimentos || []).reduce((acc, r) => acc + Number(r.valor), 0);
    const badgeRendimentos = (cliente.rendimentos || [])
      .map(r => `<div class="small"><i class="bi bi-building me-1 text-secondary"></i><strong>${r.entidade}:</strong> R$ ${Number(r.valor).toLocaleString('pt-BR')}</div>`)
      .join('');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="fw-bold text-dark">${cliente.nome}</div>
        <div class="small text-muted">CPF: ${cliente.cpf} | RG: ${cliente.rg}</div>
      </td>
      <td>
        <div class="fw-semibold small text-primary">${cliente.profissao}</div>
        <div class="small text-muted">${cliente.endereco}</div>
      </td>
      <td>
        ${badgeRendimentos}
        <span class="badge bg-success-subtle text-success mt-1">Total: R$ ${somaRendimentos.toLocaleString('pt-BR')}</span>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarCliente('${cliente.id}')" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="excluirCliente('${cliente.id}')" title="Excluir">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editarCliente = function(id) {
  const cliente = estado.clientes.find(c => String(c.id) === String(id));
  if (!cliente) return;

  document.getElementById('clienteId').value = cliente.id;
  document.getElementById('clienteNome').value = cliente.nome;
  document.getElementById('clienteRg').value = cliente.rg;
  document.getElementById('clienteCpf').value = cliente.cpf;
  document.getElementById('clienteEndereco').value = cliente.endereco;
  document.getElementById('clienteProfissao').value = cliente.profissao;

  const container = document.getElementById('listaRendimentosInputs');
  container.innerHTML = '';
  (cliente.rendimentos || []).forEach(r => adicionarCampoRendimento(r.entidade, r.valor));
  if ((cliente.rendimentos || []).length === 0) adicionarCampoRendimento();

  document.getElementById('formClienteTitulo').innerHTML = '<i class="bi bi-pencil-fill me-2"></i>Editar Cliente';
  document.getElementById('btnCancelarEdicaoCliente').classList.remove('d-none');
};

window.excluirCliente = async function(id) {
  if (!confirm('Deseja realmente excluir este cliente?')) return;
  await apiFetch(`clientes/${id}`, { method: 'DELETE' });
  await carregarTodosDados();
};

function renderizarSelectsPedido() {
  const selectCliente = document.getElementById('pedidoClienteId');
  const selectAuto = document.getElementById('pedidoAutomovelId');
  const selectBanco = document.getElementById('pedidoBancoId');

  const clienteAtual = selectCliente.value;
  const autoAtual = selectAuto.value;

  selectCliente.innerHTML = '<option value="">Selecione um cliente cadastrado...</option>' +
    estado.clientes.map(c => `<option value="${c.id}">${c.nome} (CPF: ${c.cpf})</option>`).join('');

  selectAuto.innerHTML = '<option value="">Selecione um veículo da frota...</option>' +
    estado.automoveis.map(a => `<option value="${a.id}" data-diaria="${a.diaria}">${a.marca} ${a.modelo} (${a.placa}) - R$ ${a.diaria}/dia</option>`).join('');

  const bancos = estado.agentes.filter(ag => ag.tipo === 'Banco');
  selectBanco.innerHTML = bancos.map(b => `<option value="${b.id}">${b.nome}</option>`).join('');

  if (clienteAtual) selectCliente.value = clienteAtual;
  if (autoAtual) selectAuto.value = autoAtual;
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

function renderizarPedidosCliente() {
  const container = document.getElementById('listaPedidosCliente');
  document.getElementById('contadorPedidos').textContent = estado.pedidos.length;
  container.innerHTML = '';

  if (estado.pedidos.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-4 mb-0">Nenhum pedido de aluguel registado.</p>';
    return;
  }

  estado.pedidos.forEach(pedido => {
    const cliente = estado.clientes.find(c => String(c.id) === String(pedido.clienteId));
    const auto = estado.automoveis.find(a => String(a.id) === String(pedido.automovelId));
    const banco = pedido.contratoCredito
      ? estado.agentes.find(b => String(b.id) === String(pedido.contratoCredito.bancoId))
      : null;

    let classeCor = 'pedido-status-analise';
    let badgeClass = 'bg-warning text-dark';
    if (pedido.status.includes('Aprovado')) { classeCor = 'pedido-status-aprovado'; badgeClass = 'bg-info text-dark'; }
    if (pedido.status.includes('Executado')) { classeCor = 'pedido-status-executado'; badgeClass = 'bg-success'; }
    if (pedido.status.includes('Rejeitado') || pedido.status.includes('Cancelado')) { classeCor = 'pedido-status-rejeitado'; badgeClass = 'bg-danger'; }

    const podeModificarOuCancelar = !pedido.status.includes('Cancelado') && !pedido.status.includes('Executado');

    const card = document.createElement('div');
    card.className = `card mb-3 shadow-sm pedido-card ${classeCor}`;
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge ${badgeClass} mb-2">${pedido.status}</span>
            <h6 class="fw-bold mb-1">
              Pedido #${pedido.id} — ${auto ? `${auto.marca} ${auto.modelo} (${auto.placa})` : 'Veículo removido'}
            </h6>
            <div class="small text-muted mb-2">
              <i class="bi bi-person me-1"></i><strong>Cliente:</strong> ${cliente ? cliente.nome : 'N/A'} |
              <i class="bi bi-calendar-event me-1"></i><strong>Início:</strong> ${pedido.dataInicio} (${pedido.dias} dias)
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
            <strong>Contrato de Crédito Associado:</strong> ${banco ? banco.nome : 'Banco Agente'} —
            ${pedido.contratoCredito.parcelas}x com juros de ${pedido.contratoCredito.taxaJuros}% a.m.
          </div>
        ` : ''}

        <div class="small text-secondary mb-2">
          <i class="bi bi-chat-left-quote me-1"></i><strong>Parecer Financeiro:</strong> ${pedido.parecerAgente}
        </div>

        <div class="d-flex justify-content-end gap-2">
          ${pedido.status === 'Aprovado - Aguardando Execução' ? `
            <button class="btn btn-sm btn-success" onclick="executarContrato('${pedido.id}')">
              <i class="bi bi-check2-all me-1"></i>Confirmar & Executar Contrato
            </button>
          ` : ''}
          ${podeModificarOuCancelar ? `
            <button class="btn btn-sm btn-outline-primary" onclick="carregarPedidoParaModificacao('${pedido.id}')">
              <i class="bi bi-pencil me-1"></i>Modificar
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="cancelarPedido('${pedido.id}')">
              <i class="bi bi-x-circle me-1"></i>Cancelar Pedido
            </button>
          ` : ''}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

window.carregarPedidoParaModificacao = function(id) {
  const pedido = estado.pedidos.find(p => String(p.id) === String(id));
  if (!pedido) return;

  document.getElementById('pedidoId').value = pedido.id;
  document.getElementById('pedidoClienteId').value = pedido.clienteId;
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

  const tabTrigger = new bootstrap.Tab(document.getElementById('pedidos-tab'));
  tabTrigger.show();
};

window.cancelarPedido = async function(id) {
  if (!confirm('Deseja realmente cancelar este pedido de aluguel?')) return;
  await apiFetch(`pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'Cancelado pelo Cliente',
      parecerAgente: 'Pedido cancelado a pedido do utilizador.'
    })
  });
  await carregarTodosDados();
};

function renderizarPainelAgentes() {
  const tbody = document.getElementById('tabelaAgentesBody');
  tbody.innerHTML = '';

  if (estado.pedidos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Não há pedidos para avaliação.</td></tr>';
    return;
  }

  estado.pedidos.forEach(pedido => {
    const cliente = estado.clientes.find(c => String(c.id) === String(pedido.clienteId));
    const auto = estado.automoveis.find(a => String(a.id) === String(pedido.automovelId));
    const banco = pedido.contratoCredito
      ? estado.agentes.find(b => String(b.id) === String(pedido.contratoCredito.bancoId))
      : null;

    const rendaTotal = cliente
      ? (cliente.rendimentos || []).reduce((acc, r) => acc + Number(r.valor), 0)
      : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="fw-bold">#${pedido.id}</div>
        <div class="small text-muted">${pedido.dataInicio} (${pedido.dias}d)</div>
      </td>
      <td>
        <div class="fw-bold">${cliente ? cliente.nome : 'Cliente Removido'}</div>
        <div class="small text-muted">${cliente ? cliente.profissao : ''}</div>
        <span class="badge bg-success-subtle text-success mt-1">
          Renda Total: R$ ${rendaTotal.toLocaleString('pt-BR')}
        </span>
      </td>
      <td>
        <div class="fw-semibold">${auto ? `${auto.marca} ${auto.modelo}` : 'N/A'}</div>
        <div class="small text-muted">Placa: ${auto ? auto.placa : '-'} | Matrícula: ${auto ? auto.matricula : '-'}</div>
        <span class="badge bg-secondary mt-1">Registo Contrato: ${pedido.tipoPropriedade}</span>
      </td>
      <td>
        <div class="fw-bold text-primary">R$ ${Number(pedido.valorTotal).toLocaleString('pt-BR')}</div>
        ${pedido.requerCredito && pedido.contratoCredito ? `
          <div class="small text-dark mt-1">
            <i class="bi bi-bank me-1"></i><strong>Crédito:</strong> ${banco ? banco.nome : 'Banco'}<br>
            ${pedido.contratoCredito.parcelas}x (${pedido.contratoCredito.taxaJuros}% a.m.)
          </div>
        ` : '<span class="badge bg-light text-secondary border">Sem Contrato de Crédito</span>'}
      </td>
      <td>
        <div class="fw-bold small mb-1">${pedido.status}</div>
        <div class="small text-muted">${pedido.parecerAgente}</div>
      </td>
      <td class="text-center">
        <div class="d-flex flex-column gap-1">
          <button class="btn btn-sm btn-success" onclick="avaliarPedidoAgente('${pedido.id}', true)">
            <i class="bi bi-hand-thumbs-up-fill me-1"></i>Parecer Positivo
          </button>
          <button class="btn btn-sm btn-danger" onclick="avaliarPedidoAgente('${pedido.id}', false)">
            <i class="bi bi-hand-thumbs-down-fill me-1"></i>Parecer Negativo
          </button>
          <button class="btn btn-sm btn-outline-primary" onclick="carregarPedidoParaModificacao('${pedido.id}')">
            <i class="bi bi-pencil-square me-1"></i>Modificar Pedido
          </button>
          ${pedido.status.includes('Aprovado') ? `
            <button class="btn btn-sm btn-dark" onclick="executarContrato('${pedido.id}')">
              <i class="bi bi-file-earmark-check me-1"></i>Executar Contrato
            </button>
          ` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.avaliarPedidoAgente = async function(id, aprovado) {
  const observacao = prompt(
    aprovado
      ? 'Informe o parecer financeiro POSITIVO do Agente (Empresa/Banco):'
      : 'Informe o motivo da reprovação financeira:',
    aprovado
      ? 'Rendimentos comprovados e compatíveis. Parecer financeiro favorável para execução do contrato.'
      : 'Rendimentos insuficientes para o valor do contrato solicitado.'
  );
  if (observacao === null) return;

  await apiFetch(`pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: aprovado ? 'Aprovado - Aguardando Execução' : 'Rejeitado na Análise Financeira',
      parecerAgente: observacao
    })
  });
  await carregarTodosDados();
};

window.executarContrato = async function(id) {
  const pedido = estado.pedidos.find(p => String(p.id) === String(id));
  if (!pedido) return;

  await apiFetch(`pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'Contrato em Execução',
      parecerAgente: `${pedido.parecerAgente} [Contrato executado e propriedade registada em nome de: ${pedido.tipoPropriedade}]`
    })
  });

  if (pedido.automovelId) {
    await apiFetch(`automoveis/${pedido.automovelId}`, {
      method: 'PATCH',
      body: JSON.stringify({ proprietarioAtual: pedido.tipoPropriedade })
    });
  }

  await carregarTodosDados();
};

function renderizarFrota() {
  const container = document.getElementById('listaFrotaCards');
  container.innerHTML = '';

  estado.automoveis.forEach(auto => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-primary-subtle text-primary">${auto.matricula}</span>
            <span class="badge bg-dark">Placa: ${auto.placa}</span>
          </div>
          <h5 class="fw-bold mb-1">${auto.marca} ${auto.modelo}</h5>
          <p class="text-muted small mb-2">Ano de Fabricação: <strong>${auto.ano}</strong></p>
          <div class="d-flex justify-content-between align-items-center pt-2 border-top">
            <span class="small text-secondary">
              <i class="bi bi-key-fill me-1"></i>Propriedade: <strong>${auto.proprietarioAtual}</strong>
            </span>
            <span class="fw-bold text-success">R$ ${auto.diaria}/dia</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  limparFormularioCliente();
  document.getElementById('pedidoDataInicio').valueAsDate = new Date();
  carregarTodosDados();

  document.getElementById('btnAddRendimento').addEventListener('click', () => adicionarCampoRendimento());
  document.getElementById('btnCancelarEdicaoCliente').addEventListener('click', limparFormularioCliente);

  document.getElementById('formCliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('clienteId').value;

    const rendimentos = [];
    document.querySelectorAll('#listaRendimentosInputs .rendimento-row').forEach(row => {
      const entidade = row.querySelector('.input-entidade').value.trim();
      const valor = parseFloat(row.querySelector('.input-valor').value) || 0;
      if (entidade) rendimentos.push({ entidade, valor });
    });

    const payload = {
      nome: document.getElementById('clienteNome').value.trim(),
      rg: document.getElementById('clienteRg').value.trim(),
      cpf: document.getElementById('clienteCpf').value.trim(),
      endereco: document.getElementById('clienteEndereco').value.trim(),
      profissao: document.getElementById('clienteProfissao').value.trim(),
      rendimentos
    };

    if (id) {
      await apiFetch(`clientes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiFetch('clientes', { method: 'POST', body: JSON.stringify(payload) });
    }

    limparFormularioCliente();
    await carregarTodosDados();
  });

  document.getElementById('pedidoRequerCredito').addEventListener('change', (e) => {
    document.getElementById('blocoContratoCredito').classList.toggle('d-none', !e.target.checked);
  });

  document.getElementById('pedidoAutomovelId').addEventListener('change', atualizarSimulacaoValor);
  document.getElementById('pedidoDias').addEventListener('input', atualizarSimulacaoValor);

  document.getElementById('btnCancelarEdicaoPedido').addEventListener('click', () => {
    document.getElementById('formPedido').reset();
    document.getElementById('pedidoId').value = '';
    document.getElementById('blocoContratoCredito').classList.add('d-none');
    document.getElementById('formPedidoTitulo').innerHTML = '<i class="bi bi-calendar2-check-fill me-2"></i>Introduzir Pedido de Aluguel';
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
      clienteId: Number(document.getElementById('pedidoClienteId').value) || document.getElementById('pedidoClienteId').value,
      automovelId: Number(document.getElementById('pedidoAutomovelId').value) || document.getElementById('pedidoAutomovelId').value,
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
        ? 'Pedido modificado pelo utilizador. Reencaminhado para nova avaliação financeira.'
        : 'Aguardando avaliação do agente financeiro.'
    };

    if (id) {
      await apiFetch(`pedidos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiFetch('pedidos', { method: 'POST', body: JSON.stringify(payload) });
    }

    document.getElementById('btnCancelarEdicaoPedido').click();
    await carregarTodosDados();
  });

  document.getElementById('formAutomovel').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      matricula: document.getElementById('autoMatricula').value.trim(),
      marca: document.getElementById('autoMarca').value.trim(),
      modelo: document.getElementById('autoModelo').value.trim(),
      ano: Number(document.getElementById('autoAno').value),
      placa: document.getElementById('autoPlaca').value.trim().toUpperCase(),
      proprietarioAtual: document.getElementById('autoProprietario').value,
      diaria: Number(document.getElementById('autoDiaria').value)
    };
    await apiFetch('automoveis', { method: 'POST', body: JSON.stringify(payload) });
    document.getElementById('formAutomovel').reset();
    await carregarTodosDados();
  });
});