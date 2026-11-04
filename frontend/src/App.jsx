import { useEffect, useState } from 'react';
import { DocumentList } from './components/DocumentList.jsx';
import { UploadComponent } from './components/UploadComponent.jsx';
import { listDocuments, uploadDocument } from './services/documentApi.js';
import './App.css';

const DEFAULT_USER_ID = 'usuario-local';

export default function App() {
  const [userId, setUserId] = useState(
    () => localStorage.getItem('dms-user-id') || DEFAULT_USER_ID,
  );
  const [draftUserId, setDraftUserId] = useState(userId);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    localStorage.setItem('dms-user-id', userId);
  }, [userId]);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setLoadError('');

    listDocuments(userId)
      .then((items) => {
        if (isCurrent) setDocuments(items);
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [userId, refreshVersion]);

  function changeUser(event) {
    event.preventDefault();
    const nextUserId = draftUserId.trim();
    if (nextUserId) {
      setNotice('');
      setUserId(nextUserId);
    }
  }

  async function handleUpload(file) {
    await uploadDocument(file, userId);
    setNotice('Documento enviado.');
    setRefreshVersion((version) => version + 1);
  }

  return (
    <main className="app-shell">
      <header className="masthead">
        <div className="masthead-inner">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">D</span>
            <span>Arquivo / DMS</span>
          </div>
          <form className="identity-form" onSubmit={changeUser}>
            <label htmlFor="user-id">Usuário local</label>
            <input
              id="user-id"
              value={draftUserId}
              onChange={(event) => setDraftUserId(event.target.value)}
              required
            />
            <button type="submit">Acessar</button>
          </form>
        </div>
        <div className="intro">
          <p className="eyebrow">SEUS ARQUIVOS, EM UM SÓ LUGAR</p>
          <h1>Documentos</h1>
          <p className="intro-copy">Envie, organize e recupere seus documentos.</p>
        </div>
      </header>

      <div className="workspace">
        <section className="upload-section" aria-labelledby="upload-heading">
          <div className="section-heading">
            <span className="section-index">01</span>
            <div>
              <p className="eyebrow">ADICIONAR AO ARQUIVO</p>
              <h2 id="upload-heading">Enviar documento</h2>
            </div>
          </div>
          <UploadComponent onUpload={handleUpload} />
          {notice && <p className="success-message" role="status">{notice}</p>}
        </section>

        <section className="documents-section" aria-labelledby="documents-heading">
          <div className="section-heading documents-heading">
            <span className="section-index">02</span>
            <div>
              <p className="eyebrow">BIBLIOTECA PESSOAL</p>
              <h2 id="documents-heading">Seus documentos</h2>
            </div>
            <button
              className="refresh-button"
              type="button"
              onClick={() => setRefreshVersion((version) => version + 1)}
              disabled={isLoading}
            >
              Atualizar
            </button>
          </div>
          {loadError ? (
            <div className="error-message" role="alert">
              <span>{loadError}</span>
              <button type="button" onClick={() => setRefreshVersion((version) => version + 1)}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <DocumentList
              documents={documents}
              userId={userId}
              isLoading={isLoading}
            />
          )}
        </section>
      </div>
      <footer className="page-footer">
        <span>Armazenamento local</span>
        <span>Usuário: {userId}</span>
      </footer>
    </main>
  );
}
