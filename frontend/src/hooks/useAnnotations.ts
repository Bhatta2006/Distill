import { useEffect } from "react";
import { useAnnotationStore } from "../store/useAnnotationStore";
import { getAnnotations } from "../api/annotations";

export function useAnnotations(docId: string | null) {
  const { setHighlights, setDrawings } = useAnnotationStore();

  useEffect(() => {
    if (!docId) return;
    getAnnotations(docId).then(({ highlights, drawings }) => {
      setHighlights(highlights);
      setDrawings(drawings);
    });
  }, [docId]);
}
