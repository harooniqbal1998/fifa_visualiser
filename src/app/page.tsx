import { Header } from "@/components/header";
import { TournamentView } from "@/components/tournament-view";

export default function Home() {
  return (
    <div className="flex h-full w-full flex-col">
      <Header />
      <TournamentView />
    </div>
  );
}
