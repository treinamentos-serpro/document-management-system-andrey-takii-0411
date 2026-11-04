import { useRef, useState } from 'react';

export function UploadComponent({ onUpload }) {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    try {
      await onUpload(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="file-picker">
        <span className="file-picker-symbol" aria-hidden="true">+</span>
        <span>{file ? 'Trocar arquivo' : 'Selecionar arquivo'}</span>
        <input
          ref={inputRef}
          type="file"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setError('');
          }}
        />
      </label>
      <div className="upload-details">
        <p className="selected-file" title={file?.name}>
          {file ? file.name : 'Nenhum arquivo selecionado'}
        </p>
        <button className="primary-button" type="submit" disabled={!file || isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar documento'}
        </button>
      </div>
      {error && <p className="error-message" role="alert">{error}</p>}
      <p className="upload-hint">Um arquivo por envio. Limite conforme configuração do servidor.</p>
    </form>
  );
}