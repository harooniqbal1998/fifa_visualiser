"use client";

import { useEffect, useMemo, useState } from "react";
import type { Snapshot, Team } from "@/types";
import { getGroupStandings } from "@/lib/tournament";
import { PetalCanvas } from "@/components/viz/petal/petal-canvas";
import {
  DEFAULT_PETAL_CONFIG,
  loadPetalConfigFromStorage,
  mergePetalConfig,
  type PetalLayoutConfig,
} from "@/components/viz/petal/petal-config";
import { PetalTuningPanel } from "@/components/viz/petal/petal-tuning-panel";

type PetalVisualizationProps = {
  teams: Team[];
  snapshot: Snapshot;
};

export function PetalVisualization({ teams, snapshot }: PetalVisualizationProps) {
  const [config, setConfig] = useState<PetalLayoutConfig>(() => mergePetalConfig({}));
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  useEffect(() => {
    setConfig(mergePetalConfig(loadPetalConfigFromStorage()));
  }, []);

  const standings = useMemo(
    () => getGroupStandings(snapshot.day),
    [snapshot.day],
  );

  const bracketDepths = snapshot.bracketDepths ?? {};

  return (
    <section className="relative min-h-0 min-w-0 flex-1">
      <PetalCanvas
        teams={teams}
        probabilities={snapshot.probabilities}
        standings={standings}
        bracketDepths={bracketDepths}
        config={config}
      />
      <PetalTuningPanel
        config={config}
        onChange={setConfig}
        collapsed={panelCollapsed}
        onCollapsedChange={setPanelCollapsed}
      />
    </section>
  );
}

export { DEFAULT_PETAL_CONFIG };
