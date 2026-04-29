import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import type { Rsvp, WeddingEvent } from "@/lib/wedding-types";

export const Route = createFileRoute("/admin/rsvps")({
  component: RsvpsPage,
});

function RsvpsPage() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [events, setEvents] = useState<WeddingEvent[]>([]);

  useEffect(() => {
    api.listRsvps().then(setRsvps).catch(() => {});
    api.listEvents().then(setEvents).catch(() => {});
  }, []);

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title || "—";

  const totalAttending = rsvps.filter((r) => r.attending).reduce((sum, r) => sum + r.guest_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="font-display text-3xl">Պատասխաններ ({rsvps.length})</h2>
        <div className="flex gap-3 text-sm">
          <Badge variant="secondary">Կգան՝ {totalAttending} հոգի</Badge>
        </div>
      </div>
      <div className="overflow-x-auto bg-card rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Անուն</th>
              <th className="p-3">Կողմ</th>
              <th className="p-3">Կգա</th>
              <th className="p-3">Հոգի</th>
              <th className="p-3">Փուլեր</th>
              <th className="p-3">Ամսաթիվ</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Դեռ պատասխաններ չկան</td></tr>
            )}
            {rsvps.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.guest_name}</td>
                <td className="p-3">{r.side === "groom" ? "Փեսա" : "Հարս"}</td>
                <td className="p-3">{r.attending ? <Badge>Այո</Badge> : <Badge variant="outline">Ոչ</Badge>}</td>
                <td className="p-3">{r.guest_count}</td>
                <td className="p-3 text-xs">{r.event_ids.length > 0 ? r.event_ids.map(eventTitle).join(", ") : "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("hy-AM")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
