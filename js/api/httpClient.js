const API_URL = 'http://localhost:3000';

export async function apiFetch(recurso, opcoes = {}) {
  const alertaErro = document.getElementById('apiErrorAlert');
  try {
    const resposta = await fetch(`${API_URL}/${recurso}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    if (alertaErro) {
      alertaErro.classList.add('d-none');
    }

    return await resposta.json();
  } catch (erro) {
    if (alertaErro) {
      alertaErro.classList.remove('d-none');
    }
    throw erro;
  }
}