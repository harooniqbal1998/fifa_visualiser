"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { teamsById } from "@/data/teams";
import { MAX_STARRED_TEAMS, STORAGE_KEY } from "@/lib/starred-teams/constants";

export type ToggleStarResult = "toggled" | "blocked" | "unstarred";

type StarredTeamsState = {
  starredTeamIds: string[];
  toggleStar: (teamId: string) => ToggleStarResult;
  unstar: (teamId: string) => void;
  isStarred: (teamId: string) => boolean;
};

function sanitizeStarredIds(ids: string[]): string[] {
  return ids.filter((id) => id in teamsById).slice(0, MAX_STARRED_TEAMS);
}

export const useStarredTeamsStore = create<StarredTeamsState>()(
  persist(
    (set, get) => ({
      starredTeamIds: [],

      toggleStar(teamId) {
        if (!(teamId in teamsById)) return "blocked";

        const { starredTeamIds } = get();
        if (starredTeamIds.includes(teamId)) {
          set({ starredTeamIds: starredTeamIds.filter((id) => id !== teamId) });
          return "unstarred";
        }

        if (starredTeamIds.length >= MAX_STARRED_TEAMS) {
          return "blocked";
        }

        set({ starredTeamIds: [...starredTeamIds, teamId] });
        return "toggled";
      },

      unstar(teamId) {
        const { starredTeamIds } = get();
        if (!starredTeamIds.includes(teamId)) return;
        set({ starredTeamIds: starredTeamIds.filter((id) => id !== teamId) });
      },

      isStarred(teamId) {
        return get().starredTeamIds.includes(teamId);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ starredTeamIds: state.starredTeamIds }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const sanitized = sanitizeStarredIds(state.starredTeamIds);
        if (sanitized.length !== state.starredTeamIds.length) {
          state.starredTeamIds = sanitized;
        }
      },
    },
  ),
);
