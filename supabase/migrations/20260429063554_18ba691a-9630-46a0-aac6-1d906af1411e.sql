
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Wedding settings (single row)
CREATE TABLE public.wedding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_name TEXT NOT NULL DEFAULT 'Անի',
  groom_name TEXT NOT NULL DEFAULT 'Արամ',
  wedding_date TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '90 days'),
  cover_image_url TEXT,
  couple_photo_url TEXT,
  invitation_text TEXT NOT NULL DEFAULT 'Սիրով հրավիրում ենք Ձեզ մեր հարսանիքին',
  invitation_image_1 TEXT,
  invitation_image_2 TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  thank_you_text TEXT NOT NULL DEFAULT 'Շնորհակալություն',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wedding_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wedding settings" ON public.wedding_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can update wedding settings" ON public.wedding_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert wedding settings" ON public.wedding_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Events (ceremony, reception, etc)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RSVPs
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('groom','bride')),
  attending BOOLEAN NOT NULL,
  guest_count INT NOT NULL DEFAULT 1 CHECK (guest_count > 0 AND guest_count < 50),
  event_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit rsvp" ON public.rsvps
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view rsvps" ON public.rsvps
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rsvps" ON public.rsvps
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed initial wedding settings row + events
INSERT INTO public.wedding_settings (bride_name, groom_name) VALUES ('Անի', 'Արամ');

INSERT INTO public.events (title, event_time, address, description, display_order) VALUES
  ('Պսակադրություն', (now() + INTERVAL '90 days')::date + INTERVAL '14 hours', 'Սուրբ Գայանե եկեղեցի, Էջմիածին', 'Եկեղեցական արարողություն', 1),
  ('Լուսանկարահանում', (now() + INTERVAL '90 days')::date + INTERVAL '16 hours', 'Կասկադ, Երևան', 'Համատեղ լուսանկարներ', 2),
  ('Հարսանյաց հանդիսություն', (now() + INTERVAL '90 days')::date + INTERVAL '19 hours', 'Ռեստորան «Արարատ», Երևան', 'Տոնական ընթրիք եւ պարեր', 3);
