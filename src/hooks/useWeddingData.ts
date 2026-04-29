import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { WeddingSettings, WeddingEvent } from "@/lib/wedding-types";

import couplePlaceholder from "@/assets/couple-placeholder.jpg";
import floral1 from "@/assets/floral-1.jpg";
import floral2 from "@/assets/floral-2.jpg";

export function useWeddingData() {
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, e] = await Promise.all([api.getSettings(), api.listEvents()]);
        setSettings({
          ...s,
          gallery_images: Array.isArray(s.gallery_images) ? s.gallery_images : [],
          cover_image_url: s.cover_image_url || couplePlaceholder,
          couple_photo_url: s.couple_photo_url || couplePlaceholder,
          invitation_image_1: s.invitation_image_1 || floral1,
          invitation_image_2: s.invitation_image_2 || floral2,
        });
        setEvents(e);
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { settings, events, loading, error };
}

export const fallbackGallery = [couplePlaceholder, floral1, floral2, couplePlaceholder];
