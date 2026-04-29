import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import type { WeddingEvent } from "@/lib/wedding-types";

export const Route = createFileRoute("/admin/events")({
  component: EventsPage,
});

function EventsPage() {
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setEvents(await api.listEvents()); } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      await api.createEvent({
        title: "Նոր իրադարձություն",
        event_time: new Date().toISOString(),
        address: "Հասցե",
        latitude: null,
        longitude: null,
        map_url: null,
        description: null,
        display_order: events.length + 1,
      });
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const upd = (id: string, patch: Partial<WeddingEvent>) => {
    setEvents(events.map((e) => e.id === id ? { ...e, ...patch } : e));
  };

  const save = async (ev: WeddingEvent) => {
    setBusy(true);
    try {
      await api.updateEvent(ev.id, {
        title: ev.title, event_time: ev.event_time, address: ev.address,
        latitude: ev.latitude, longitude: ev.longitude, map_url: ev.map_url,
        description: ev.description, display_order: ev.display_order,
      });
      toast.success("Պահպանված");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Ջնջե՞լ")) return;
    try { await api.deleteEvent(id); load(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl">Իրադարձություններ</h2>
        <Button onClick={add}><Plus className="w-4 h-4 mr-1" /> Ավելացնել</Button>
      </div>
      <div className="space-y-4">
        {events.map((ev) => {
          const dt = new Date(ev.event_time);
          const dtLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          return (
            <div key={ev.id} className="bg-card rounded-xl p-4 border space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label className="text-xs">Անվանում</Label><Input value={ev.title} onChange={(e) => upd(ev.id, { title: e.target.value })} /></div>
                <div><Label className="text-xs">Ժամ</Label><Input type="datetime-local" value={dtLocal} onChange={(e) => upd(ev.id, { event_time: new Date(e.target.value).toISOString() })} /></div>
                <div className="sm:col-span-2"><Label className="text-xs">Հասցե</Label><Input value={ev.address} onChange={(e) => upd(ev.id, { address: e.target.value })} /></div>
                <div>
                  <Label className="text-xs">Լայնություն (Latitude)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={ev.latitude ?? ""}
                    onChange={(e) => upd(ev.id, { latitude: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Երկայնություն (Longitude)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={ev.longitude ?? ""}
                    onChange={(e) => upd(ev.id, { longitude: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Կարտեզի հղում (Google/Apple/Yandex)</Label>
                  <Input
                    value={ev.map_url || ""}
                    onChange={(e) => upd(ev.id, { map_url: e.target.value || null })}
                    placeholder="https://maps.google.com/?q=40.1772,44.5035"
                  />
                </div>
                <div className="sm:col-span-2"><Label className="text-xs">Նկարագրություն</Label><Textarea value={ev.description || ""} onChange={(e) => upd(ev.id, { description: e.target.value })} rows={2} /></div>
                <div><Label className="text-xs">Կարգ</Label><Input type="number" value={ev.display_order} onChange={(e) => upd(ev.id, { display_order: Number(e.target.value) })} /></div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => del(ev.id)}><Trash2 className="w-4 h-4" /></Button>
                <Button size="sm" disabled={busy} onClick={() => save(ev)}>Պահպանել</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
