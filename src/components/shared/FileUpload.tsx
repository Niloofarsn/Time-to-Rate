import { useRef } from "react";
import "./FileUpload.css";

export function FileUpload({ onFile }: { onFile: (fileName: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="file-upload" onClick={() => inputRef.current?.click()}>
      <i className="bi bi-cloud-arrow-up" aria-hidden />
      <p className="file-upload__text">Clicca o trascina un file in quest'area per caricarlo</p>
      <p className="file-upload__hint muted">Un singolo file. Dimensione massima 2MB.</p>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f.name);
          e.target.value = "";
        }}
      />
    </div>
  );
}
