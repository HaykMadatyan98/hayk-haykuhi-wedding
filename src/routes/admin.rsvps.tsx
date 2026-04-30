import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Rsvp, WeddingEvent } from "@/lib/wedding-types";

export const Route = createFileRoute("/admin/rsvps")({
  component: RsvpsPage,
});

type SideFilter = "all" | "groom" | "bride";
type AttendingFilter = "all" | "yes" | "no";

function RsvpsPage() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<SideFilter>("all");
  const [attending, setAttending] = useState<AttendingFilter>("all");
  const [eventId, setEventId] = useState<string>("all");
  const [createdFrom, setCreatedFrom] = useState<string>("");
  const [createdTo, setCreatedTo] = useState<string>("");

  useEffect(() => {
    api.listRsvps().then(setRsvps).catch((e: any) => toast.error(e.message));
    api.listEvents().then(setEvents).catch((e: any) => toast.error(e.message));
  }, []);

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title || "—";

  const filteredRsvps = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = createdFrom ? new Date(`${createdFrom}T00:00:00`) : null;
    const to = createdTo ? new Date(`${createdTo}T23:59:59.999`) : null;

    return rsvps.filter((r) => {
      if (q && !r.guest_name.toLowerCase().includes(q)) return false;
      if (side !== "all" && r.side !== side) return false;
      if (attending !== "all" && r.attending !== (attending === "yes")) return false;
      if (eventId !== "all" && !r.event_ids.includes(eventId)) return false;

      if (from || to) {
        const createdAt = new Date(r.created_at);
        if (from && createdAt < from) return false;
        if (to && createdAt > to) return false;
      }

      return true;
    });
  }, [attending, createdFrom, createdTo, eventId, query, rsvps, side]);

  const totalAttending = filteredRsvps
    .filter((r) => r.attending)
    .reduce((sum, r) => sum + r.guest_count, 0);

  const clearFilters = () => {
    setQuery("");
    setSide("all");
    setAttending("all");
    setEventId("all");
    setCreatedFrom("");
    setCreatedTo("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="font-display text-3xl">
          Պատասխաններ ({filteredRsvps.length}{filteredRsvps.length !== rsvps.length ? ` / ${rsvps.length}` : ""})
        </h2>
        <div className="flex gap-3 text-sm">
          <Badge variant="secondary">Կգան՝ {totalAttending} հոգի</Badge>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
          <div className="lg:col-span-2">
            <Label className="text-xs">Որոնում (անուն)</Label>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Օր. Արմեն" />
          </div>

          <div>
            <Label className="text-xs">Կողմ</Label>
            <Select value={side} onValueChange={(v) => setSide(v as SideFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Բոլորը" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Բոլորը</SelectItem>
                <SelectItem value="groom">Փեսա</SelectItem>
                <SelectItem value="bride">Հարս</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Կգա</Label>
            <Select value={attending} onValueChange={(v) => setAttending(v as AttendingFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Բոլորը" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Բոլորը</SelectItem>
                <SelectItem value="yes">Այո</SelectItem>
                <SelectItem value="no">Ոչ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Փուլ</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Բոլորը" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Բոլորը</SelectItem>
                {events
                  .slice()
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 lg:col-span-6 flex-wrap items-end">
            <div>
              <Label className="text-xs">Սկսած</Label>
              <Input type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Մինչև</Label>
              <Input type="date" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} />
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={clearFilters}>
              Մաքրել
            </Button>
          </div>
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
            {filteredRsvps.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Դեռ պատասխաններ չկան</td></tr>
            )}
            {filteredRsvps.map((r) => (
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
