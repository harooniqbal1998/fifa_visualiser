import { TournamentView } from "@/components/tournament-view";

export default function Home() {
  return (
    <div className="flex h-full min-h-dvh w-full flex-1 bg-background">
      <TournamentView />
    </div>
  );
}
