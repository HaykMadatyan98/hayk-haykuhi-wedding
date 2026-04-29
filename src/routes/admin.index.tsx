import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { WeddingSettings } from "@/lib/wedding-types";

export const Route = createFileRoute("/admin/")({
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<WeddingSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [galleryText, setGalleryText] = useState("");

  useEffect(() => {
    api.getSettings().then((data) => {
      const parsed = { ...data, gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [] };
      setS(parsed);
      setGalleryText(parsed.gallery_images.join("\n"));
    }).catch((e) => toast.error(e.message));
  }, []);

  if (!s) return <p>Բեռնվում է...</p>;

  const upd = <K extends keyof WeddingSettings>(k: K, v: WeddingSettings[K]) => setS({ ...s, [k]: v });

  const save = async () => {
    setBusy(true);
    const gallery = galleryText.split("\n").map((x) => x.trim()).filter(Boolean);
    try {
      await api.updateSettings(s.id, {
        bride_name: s.bride_name,
        groom_name: s.groom_name,
        wedding_date: s.wedding_date,
        cover_image_url: s.cover_image_url,
        couple_photo_url: s.couple_photo_url,
        invitation_text: s.invitation_text,
        invitation_image_1: s.invitation_image_1,
        invitation_image_2: s.invitation_image_2,
        gallery_images: gallery,
        thank_you_text: s.thank_you_text,
      });
      toast.success("Պահպանված է");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  // Format datetime-local value
  const dt = new Date(s.wedding_date);
  const dtLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl">Հիմնական կարգավորումներ</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Հարսի անուն"><Input value={s.bride_name} onChange={(e) => upd("bride_name", e.target.value)} /></Field>
        <Field label="Փեսայի անուն"><Input value={s.groom_name} onChange={(e) => upd("groom_name", e.target.value)} /></Field>
        <Field label="Հարսանիքի օր"><Input type="datetime-local" value={dtLocal} onChange={(e) => upd("wedding_date", new Date(e.target.value).toISOString())} /></Field>
        <Field label="Շնորհակալական տեքստ"><Input value={s.thank_you_text} onChange={(e) => upd("thank_you_text", e.target.value)} /></Field>
      </div>

      <Field label="Հրավերի տեքստ"><Textarea value={s.invitation_text} onChange={(e) => upd("invitation_text", e.target.value)} rows={3} /></Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Զույգի լուսանկար (URL)"><Input value={s.couple_photo_url || ""} onChange={(e) => upd("couple_photo_url", e.target.value)} placeholder="https://..." /></Field>
        <Field label="Շապիկ (URL)"><Input value={s.cover_image_url || ""} onChange={(e) => upd("cover_image_url", e.target.value)} placeholder="https://..." /></Field>
        <Field label="Հրավեր նկար 1 (URL)"><Input value={s.invitation_image_1 || ""} onChange={(e) => upd("invitation_image_1", e.target.value)} placeholder="https://..." /></Field>
        <Field label="Հրավեր նկար 2 (URL)"><Input value={s.invitation_image_2 || ""} onChange={(e) => upd("invitation_image_2", e.target.value)} placeholder="https://..." /></Field>
      </div>

      <Field label="Պատկերասրահ (յուրաքանչյուր URL նոր տողում)">
        <Textarea value={galleryText} onChange={(e) => setGalleryText(e.target.value)} rows={5} placeholder="https://...\nhttps://..." />
      </Field>

      <Button onClick={save} disabled={busy} size="lg">{busy ? "..." : "Պահպանել"}</Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label>{children}</div>;
}
