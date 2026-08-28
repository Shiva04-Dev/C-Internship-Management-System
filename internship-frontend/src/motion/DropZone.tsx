import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { FileText, Upload } from "lucide-react";
import { prefersReducedMotion } from "./reducedMotion";

export interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  accept?: string;
  label?: string;
  hint?: string;
}

export default function DropZone({
  onFileSelect,
  selectedFile,
  accept = ".pdf",
  label = "UPLOAD RESUME",
  hint = "PDF only, up to 5MB",
}: DropZoneProps) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);

  useGSAP(
    () => {
      if (!zoneRef.current || prefersReducedMotion()) return;

      gsap.to(zoneRef.current, {
        scale: isDragOver ? 1.03 : 1,
        boxShadow: isDragOver ? "0 0 24px rgba(0,243,255,0.35)" : "0 0 0px rgba(0,243,255,0)",
        borderColor: isDragOver ? "rgba(0,243,255,0.7)" : "rgba(0,243,255,0.2)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    { dependencies: [isDragOver] }
  );

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragOver(true);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <div
      ref={zoneRef}
      role="button"
      tabIndex={0}
      aria-label={`${label}, ${hint}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      className="retro-dropzone relative p-8 text-center cursor-pointer"
      style={{
        border: "2px dashed rgba(0,243,255,0.2)",
        background: "rgba(0,243,255,0.02)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        onClick={(e) => e.stopPropagation()}
        className="hidden"
      />
      {selectedFile ? (
        <>
          <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: "#00cc66" }} />
          <p className="font-['Share_Tech_Mono'] text-sm" style={{ color: "#00cc66" }}>
            {selectedFile.name}
          </p>
          <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: "rgba(100,120,140,0.5)" }}>
            Click or drop to change
          </p>
        </>
      ) : (
        <>
          <Upload className="h-10 w-10 mx-auto mb-3" style={{ color: isDragOver ? "#00f3ff" : "rgba(0,243,255,0.3)" }} />
          <p className="font-['Orbitron'] text-xs text-white tracking-widest">{label}</p>
          <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: "rgba(100,120,140,0.5)" }}>
            {hint}
          </p>
        </>
      )}
    </div>
  );
}
