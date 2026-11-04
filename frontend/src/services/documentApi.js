const API_PREFIX = '/api';

async function request(path, userId, options = {}) {
  const headers = new Headers(options.headers);
  if (userId) headers.set('X-User-Id', userId);

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.';
    try {
      const payload = await response.json();
      message = payload.error?.message || message;
    } catch {
      // Mantém a mensagem padrão quando a resposta não contém JSON.
    }
    throw new Error(message);
  }

  return response;
}

export async function listDocuments(userId) {
  const response = await request('/documents', userId);
  return response.json();
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', userId, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function downloadDocument(id, userId) {
  const response = await request(
    `/documents/${encodeURIComponent(id)}/download`,
    userId,
  );
  return response.blob();
}