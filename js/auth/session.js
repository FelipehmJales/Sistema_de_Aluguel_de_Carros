const CHAVE_SESSAO = 'drivesys_usuario_logado';

export function salvarSessao(usuario, perfil) {
  const dadosSessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: perfil,
    tipoAgente: usuario.tipo || null
  };
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(dadosSessao));
}

export function obterSessao() {
  const dados = sessionStorage.getItem(CHAVE_SESSAO);
  return dados ? JSON.parse(dados) : null;
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  window.location.href = 'index.html';
}

export function exigirPerfil(perfilRequerido) {
  const sessao = obterSessao();
  if (!sessao) {
    window.location.href = 'index.html';
    return null;
  }
  if (sessao.perfil !== perfilRequerido) {
    window.location.href = sessao.perfil === 'CLIENTE' ? 'cliente.html' : 'agente.html';
    return null;
  }
  return sessao;
}