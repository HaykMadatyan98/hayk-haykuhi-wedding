import { useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { WeddingEvent } from "@/lib/wedding-types";

const schema = z.object({
  guest_name: z.string().trim().min(2, "Նվազագույնը 2 նիշ").max(100),
  side: z.enum(["groom", "bride"]),
  attending: z.enum(["yes", "no"]),
  guest_count: z.number().int().min(1).max(20),
  event_ids: z.array(z.string()),
});

export function RsvpForm({ events, onDone }: { events: WeddingEvent[]; onDone: () => void }) {
  const [name, setName] = useState("");
  const [side, setSide] = useState<"groom" | "bride">("bride");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [count, setCount] = useState(1);
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const showStages = side === "groom" && attending === "yes";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      guest_name: name,
      side,
      attending,
      guest_count: count,
      event_ids: showStages ? eventIds : [],
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await api.submitRsvp({
        guest_name: parsed.data.guest_name,
        side: parsed.data.side,
        attending: parsed.data.attending === "yes",
        guest_count: parsed.data.guest_count,
        event_ids: parsed.data.event_ids,
      });
      toast.success("Շնորհակալություն!");
      onDone();
    } catch (err: any) {
      toast.error(err.message || "Չհաջողվեց ուղարկել");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-xl mx-auto bg-card/90 backdrop-blur rounded-3xl p-6 sm:p-10 shadow-romantic border border-primary/20">
      <div className="space-y-2">
        <Label htmlFor="name">Անուն Ազգանուն</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
      </div>

      <div className="space-y-2">
        <Label>Ո՞ր կողմից եք</Label>
        <RadioGroup value={side} onValueChange={(v) => setSide(v as "groom" | "bride")} className="flex gap-6">
          <div className="flex items-center space-x-2"><RadioGroupItem value="bride" id="s-b" /><Label htmlFor="s-b" className="font-normal">Հարսի կողմից</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="groom" id="s-g" /><Label htmlFor="s-g" className="font-normal">Փեսայի կողմից</Label></div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Կգա՞ք</Label>
        <RadioGroup value={attending} onValueChange={(v) => setAttending(v as "yes" | "no")} className="flex gap-6">
          <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="a-y" /><Label htmlFor="a-y" className="font-normal">Այո</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="a-n" /><Label htmlFor="a-n" className="font-normal">Ոչ</Label></div>
        </RadioGroup>
      </div>

      {attending === "yes" && (
        <div className="space-y-2">
          <Label htmlFor="count">Քանի՞ հոգի</Label>
          <Input id="count" type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
      )}

      {showStages && (
        <div className="space-y-3">
          <Label>Որ փուլերին կմասնակցեք</Label>
          <div className="space-y-2">
            {events.map((ev) => (
              <label key={ev.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition">
                <Checkbox
                  checked={eventIds.includes(ev.id)}
                  onCheckedChange={(c) => setEventIds((prev) => (c ? [...prev, ev.id] : prev.filter((x) => x !== ev.id)))}
                />
                <span className="text-sm">
                  <span className="font-medium">{ev.title}</span>
                  <span className="block text-muted-foreground text-xs">{ev.address}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? "Ուղարկվում է..." : "Ուղարկել պատասխանը"}
      </Button>
    </form>
  );
}
