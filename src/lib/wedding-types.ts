export type WeddingSettings = {
  id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  cover_image_url: string | null;
  couple_photo_url: string | null;
  invitation_text: string;
  invitation_image_1: string | null;
  invitation_image_2: string | null;
  gallery_images: string[];
  thank_you_text: string;
  updated_at: string;
};

export type WeddingEvent = {
  id: string;
  title: string;
  event_time: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  description: string | null;
  display_order: number;
};

export type Rsvp = {
  id: string;
  guest_name: string;
  side: 'groom' | 'bride';
  attending: boolean;
  guest_count: number;
  event_ids: string[];
  created_at: string;
};
