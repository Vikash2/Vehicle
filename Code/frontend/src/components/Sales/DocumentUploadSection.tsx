import { useRef, useState } from 'react';
import { Upload, X, Eye, FileText } from 'lucide-react';
import type { Booking, DocumentStatus, DocumentFile } from '../../types/booking';
import { useBookings } from '../../state/BookingContext';

interface DocumentUploadSectionProps {
  booking: Booking;
}

const DOCUMENT_LABELS: Record<keyof DocumentStatus, string> = {
  aadharCard: 'Aadhaar Card',
  addressProof: 'Address Proof',
  passportPhotos: 'Passport Photos',
};

export default function DocumentUploadSection({ booking }: DocumentUploadSectionProps) {
  const { uploadDocument, removeDocument } = useBookings();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [preview, setPreview] = useState<{ label: string; file: DocumentFile } | null>(null);

  const handleFile = (docType: keyof DocumentStatus, file: File) => {
    if (file.size > 10 * 1024 * 1024) return alert('Max file size is 10MB');
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) return alert('Only JPG, PNG, GIF or PDF allowed');

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadDocument(booking.id, docType, {
        name: file.name,
        type: file.type,
        data: e.target?.result as string,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-[var(--text-primary)]">Documents</h3>

      {(Object.keys(DOCUMENT_LABELS) as (keyof DocumentStatus)[]).map((docType) => {
        const file = booking.documents[docType]?.file;
        const label = DOCUMENT_LABELS[docType];

        return (
          <div key={docType} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">{label}</p>

            {file ? (
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-500 shrink-0" />
                <span className="text-sm text-[var(--text-primary)] truncate flex-1">{file.name}</span>
                <button
                  onClick={() => setPreview({ label, file })}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => removeDocument(booking.id, docType)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                  title="Remove"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRefs.current[docType]?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--text-muted)] hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <Upload size={16} />
                Upload file
              </button>
            )}

            <input
              ref={(el) => { fileInputRefs.current[docType] = el; }}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(docType, f);
                e.target.value = '';
              }}
            />
          </div>
        );
      })}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-gray-900">{preview.label}</span>
              <button onClick={() => setPreview(null)} className="p-1 hover:bg-gray-100 rounded transition">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center">
              {preview.file.type.startsWith('image/') ? (
                <img src={preview.file.data} alt={preview.file.name} className="max-w-full h-auto rounded" />
              ) : (
                <div className="text-center p-8">
                  <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-700 font-medium mb-4">{preview.file.name}</p>
                  <a
                    href={preview.file.data}
                    download={preview.file.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <Upload size={16} /> Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
