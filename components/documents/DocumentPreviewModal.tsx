"use client";

import { Download } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { useDocumentsStore } from "@/hooks/use-documents-store";

export function DocumentPreviewModal() {
  const { previewDocument, setPreviewDocument } = useDocumentsStore();

  if (!previewDocument) return null;

  const isPDF = previewDocument.file_type === "application/pdf";
  const isImage = previewDocument.file_type.startsWith("image/");
  const isWord =
    previewDocument.file_type === "application/msword" ||
    previewDocument.file_type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return (
    <Modal
      open={!!previewDocument}
      onClose={() => setPreviewDocument(null)}
      title={previewDocument.file_name}
      size="xl"
      className="border-navy-700/50 bg-charcoal-900 [&_h2]:text-ivory-100 [&>div:first-child]:border-navy-700/50 [&>div:last-child]:border-navy-700/50 [&_p.text-charcoal-400]:text-ivory-500 [&_button.text-charcoal-400]:text-ivory-500 [&_button.text-charcoal-400:hover]:bg-navy-800 [&_button.text-charcoal-400:hover]:text-ivory-200"
      footer={
        <div className="flex justify-end gap-3">
          <a
            href={previewDocument.file_url}
            download={previewDocument.file_name}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              icon={<Download className="h-4 w-4" />}
            >
              Download
            </Button>
          </a>
          <Button onClick={() => setPreviewDocument(null)}>Close</Button>
        </div>
      }
    >
      <div className="flex items-center justify-center">
        {isPDF && (
          <iframe
            src={previewDocument.file_url}
            title={previewDocument.file_name}
            className="h-[70vh] w-full rounded-lg border border-navy-700/30"
          />
        )}

        {isImage && (
          <img
            src={previewDocument.file_url}
            alt={previewDocument.file_name}
            className="max-h-[70vh] rounded-lg object-contain"
          />
        )}

        {isWord && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-sans text-body text-ivory-400">
              Preview is not available for Word documents.
            </p>
            <a
              href={previewDocument.file_url}
              download={previewDocument.file_name}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4"
            >
              <Button icon={<Download className="h-4 w-4" />}>
                Download to View
              </Button>
            </a>
          </div>
        )}

        {!isPDF && !isImage && !isWord && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-sans text-body text-ivory-400">
              Preview is not available for this file type.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
