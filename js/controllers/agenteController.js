import { apiFetch } from '../api/httpClient.js';
import { exigirPerfil, encerrarSessao } from '../auth/session.js';

let sessao = null;
let estado = {
  clientes: [],
  automoveis: [],
  agentes: [],
  pedidos: []
};

async function carregarDadosAgente() {
  const [clientes, automoveis, agentes, pedidos] = await Promise.all([
    apiFetch('clientes'),
    apiFetch('automoveis'),
    apiFetch('agentes'),
    apiFetch('pedidos')
  ]);

  estado = { clientes, automoveis, agentes, pedidos };
  renderizarTabelaAvaliacao();
  renderizarFrota();
}

function renderizarTabelaAvaliacao() {
  const tbody = document.getElementById('tabelaAgentesBody');
  tbody.innerHTML = '';

  if (estado.pedidos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum pedido registado.</td></tr>';
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
        <div class="fw-bold">${cliente ? cliente.nome : 'Removido'}</div>
        <div class="small text-muted">${cliente ? cliente.profissao : ''}</div>
        <span class="badge bg-success-subtle text-success mt-1">
          Renda: R$ ${rendaTotal.toLocaleString('pt-BR')}
        </span>
      </td>
      <td>
        <div class="fw-semibold">${auto ? `${auto.marca} ${auto.modelo}` : 'N/A'}</div>
        <div class="small text-muted">Placa: ${auto ? auto.placa : '-'}</div>
        <span class="badge bg-secondary mt-1">Contrato: ${pedido.tipoPropriedade}</span>
      </td>
      <td>
        <div class="fw-bold text-primary">R$ ${Number(pedido.valorTotal).toLocaleString('pt-BR')}</div>
        ${pedido.requerCredito && pedido.contratoCredito ? `
          <div class="small text-dark mt-1">
            <strong>Crédito:</strong> ${banco ? banco.nome : 'Banco'}<br>
            ${pedido.contratoCredito.parcelas}x (${pedido.contratoCredito.taxaJuros}% a.m.)
          </div>
        ` : '<span class="badge bg-light text-secondary border">Sem Crédito</span>'}
      </td>
      <td>
        <div class="fw-bold small mb-1">${pedido.status}</div>
        <div class="small text-muted">${pedido.parecerAgente}</div>
      </td>
      <td class="text-center">
        <div class="d-flex flex-column gap-1">
          <button class="btn btn-sm btn-success btn-aprovar" data-id="${pedido.id}">
            <i class="bi bi-hand-thumbs-up-fill me-1"></i>Aprovar
          </button>
          <button class="btn btn-sm btn-danger btn-rejeitar" data-id="${pedido.id}">
            <i class="bi bi-hand-thumbs-down-fill me-1"></i>Rejeitar
          </button>
          ${pedido.status.includes('Aprovado') ? `
            <button class="btn btn-sm btn-dark btn-executar" data-id="${pedido.id}">
              <i class="bi bi-file-earmark-check me-1"></i>Executar Contrato
            </button>
          ` : ''}
        </div>
      </td>
    `;

    tr.querySelector('.btn-aprovar').addEventListener('click', () => avaliarPedido(pedido.id, true));
    tr.querySelector('.btn-rejeitar').addEventListener('click', () => avaliarPedido(pedido.id, false));

    const btnExec = tr.querySelector('.btn-executar');
    if (btnExec) btnExec.addEventListener('click', () => executarContrato(pedido.id));

    tbody.appendChild(tr);
  });
}

async function avaliarPedido(id, aprovado) {
  const parecer = prompt(
    aprovado ? 'Informe o parecer financeiro POSITIVO:' : 'Informe o motivo da REPROVAÇÃO:',
    aprovado
      ? `Aprovado financeiramente por ${sessao.nome}.`
      : `Reprovado na análise de crédito por ${sessao.nome}.`
  );
  if (parecer === null) return;

  await apiFetch(`pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: aprovado ? 'Aprovado - Aguardando Execução' : 'Rejeitado na Análise Financeira',
      parecerAgente: parecer
    })
  });

  await carregarDadosAgente();
}

async function executarContrato(id) {
  const pedido = estado.pedidos.find(p => String(p.id) === String(id));
  if (!pedido) return;

  await apiFetch(`pedidos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'Contrato em Execução',
      parecerAgente: `${pedido.parecerAgente} [Executado por ${sessao.nome} — Propriedade: ${pedido.tipoPropriedade}]`
    })
  });

  if (pedido.automovelId) {
    await apiFetch(`automoveis/${pedido.automovelId}`, {
      method: 'PATCH',
      body: JSON.stringify({ proprietarioAtual: pedido.tipoPropriedade })
    });
  }

  await carregarDadosAgente();
}

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
          <p class="text-muted small mb-2">Ano: <strong>${auto.ano}</strong></p>
          <div class="d-flex justify-content-between align-items-center pt-2 border-top">
            <span class="small text-secondary">Propriedade: <strong>${auto.proprietarioAtual}</strong></span>
            <span class="fw-bold text-success">R$ ${auto.diaria}/dia</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  sessao = exigirPerfil('AGENTE');
  if (!sessao) return;

  document.getElementById('headerNomeAgente').innerHTML = `<i class="bi bi-building-check me-1"></i>${sessao.nome} (${sessao.tipoAgente})`;
  document.getElementById('btnLogout').addEventListener('click', encerrarSessao);

  await carregarDadosAgente();

  document.getElementById('formAutomovel').addEventListener('submit', async (e) => {
    e.preventDefault();
    await apiFetch('automoveis', {
      method: 'POST',
      body: JSON.stringify({
        matricula: document.getElementById('autoMatricula').value.trim(),
        marca: document.getElementById('autoMarca').value.trim(),
        modelo: document.getElementById('autoModelo').value.trim(),
        ano: Number(document.getElementById('autoAno').value),
        placa: document.getElementById('autoPlaca').value.trim().toUpperCase(),
        proprietarioAtual: document.getElementById('autoProprietario').value,
        diaria: Number(document.getElementById('autoDiaria').value)
      })
    });
    document.getElementById('formAutomovel').reset();
    await carregarDadosAgente();
  });
});