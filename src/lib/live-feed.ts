import { create } from "zustand";
import { spawnBurst } from "@/lib/show-runtime";

export type LiveEvent = {
  id: number;
  name: string;
  city: string;
  action: string;
  co2: number;
};

const CAST: Omit<LiveEvent, "id">[] = [
  { name: "Anna M.", city: "Berlin", action: "Radelt 6,2 km zur Arbeit", co2: 1.4 },
  { name: "Lukas T.", city: "Hamburg", action: "Kauft im Partner-Bioladen ein", co2: 0.8 },
  { name: "Sophie K.", city: "München", action: "Nimmt U-Bahn statt Auto", co2: 2.1 },
  { name: "Jonas B.", city: "Köln", action: "Senkt den Strom um 12 %", co2: 1.9 },
  { name: "Lena S.", city: "Berlin", action: "Teilt Lastenrad mit Nachbarn", co2: 2.6 },
  { name: "Max R.", city: "München", action: "Löst Partner-QR im Café ein", co2: 0.4 },
  { name: "Mira H.", city: "Heidelberg", action: "Fährt 11 km mit dem Rad", co2: 2.4 },
  { name: "Theo W.", city: "Stuttgart", action: "Geht zu Fuß in die Stadt", co2: 0.9 },
  { name: "Nora F.", city: "Freiburg", action: "Foto-Proof: Unverpackt-Laden", co2: 0.6 },
  { name: "Elias K.", city: "Leipzig", action: "Streak: 14 Tage ÖPNV", co2: 3.1 },
  { name: "Clara D.", city: "Dresden", action: "Health Connect: 8 km Rad", co2: 1.8 },
  { name: "Paul S.", city: "Frankfurt", action: "Spart Heizenergie über Nacht", co2: 2.2 },
];

let cursor = 0;
let seq = 1;

type FeedState = {
  events: LiveEvent[];
  co2: number;
  users: number;
  pushNext: () => void;
};

export const useFeed = create<FeedState>((set) => ({
  events: [],
  co2: 1_284_750,
  users: 2_847,
  pushNext: () => {
    const src = CAST[cursor % CAST.length];
    cursor += 1;
    spawnBurst();
    set((s) => ({
      events: [{ ...src, id: seq++ }, ...s.events].slice(0, 6),
      co2: s.co2 + Math.round(src.co2 * 12),
      users: s.users + (seq % 5 === 0 ? 1 : 0),
    }));
  },
}));
