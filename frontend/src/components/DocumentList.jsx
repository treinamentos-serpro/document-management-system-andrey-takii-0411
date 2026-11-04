import { DownloadButton } from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function DocumentList({ documents, userId, isLoading }) {
  if (isLoading) {
    return <p className="list-message" role="status">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-mark" aria-hidden="true">—</span>
        <p>Nenhum documento por aqui.</p>
        <span>Os arquivos enviados aparecerão nesta lista.</span>
      </div>
    );
  }

  return (
    <ul className="document-list" aria-label="Documentos enviados">
      {documents.map((document) => (
        <li className="document-row" key={document.id}>
          <div className="document-type" aria-hidden="true">DOC</div>
          <div className="document-info">
            <span className="document-name" title={document.originalName}>
              {document.originalName}
            </span>
            <span className="document-meta">
              {formatSize(document.size)} <span aria-hidden="true">·</span>{' '}
              <time dateTime={document.uploadedAt}>{formatDate(document.uploadedAt)}</time>
            </span>
          </div>
          <DownloadButton
            documentId={document.id}
            fileName={document.originalName}
            userId={userId}
          />
        </li>
      ))}
    </ul>
  );
}