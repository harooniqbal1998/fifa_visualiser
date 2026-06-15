import type { Team } from "@/types";

export const teams: Team[] = [
  { id: "mex", name: "Mexico", group: "A" },
  { id: "rsa", name: "South Africa", group: "A" },
  { id: "kor", name: "South Korea", group: "A" },
  { id: "den", name: "Denmark", group: "A" },

  { id: "can", name: "Canada", group: "B" },
  { id: "qat", name: "Qatar", group: "B" },
  { id: "sui", name: "Switzerland", group: "B" },
  { id: "ecu", name: "Ecuador", group: "B" },

  { id: "bra", name: "Brazil", group: "C" },
  { id: "mar", name: "Morocco", group: "C" },
  { id: "hai", name: "Haiti", group: "C" },
  { id: "sco", name: "Scotland", group: "C" },

  { id: "usa", name: "United States", group: "D" },
  { id: "aus", name: "Australia", group: "D" },
  { id: "par", name: "Paraguay", group: "D" },
  { id: "tur", name: "Turkey", group: "D" },

  { id: "ger", name: "Germany", group: "E" },
  { id: "cuw", name: "Curaçao", group: "E" },
  { id: "civ", name: "Ivory Coast", group: "E" },
  { id: "pol", name: "Poland", group: "E" },

  { id: "ned", name: "Netherlands", group: "F" },
  { id: "jpn", name: "Japan", group: "F" },
  { id: "tun", name: "Tunisia", group: "F" },
  { id: "ukr", name: "Ukraine", group: "F" },

  { id: "bel", name: "Belgium", group: "G" },
  { id: "egy", name: "Egypt", group: "G" },
  { id: "irn", name: "Iran", group: "G" },
  { id: "nzl", name: "New Zealand", group: "G" },

  { id: "esp", name: "Spain", group: "H" },
  { id: "cpv", name: "Cape Verde", group: "H" },
  { id: "ksa", name: "Saudi Arabia", group: "H" },
  { id: "uru", name: "Uruguay", group: "H" },

  { id: "fra", name: "France", group: "I" },
  { id: "sen", name: "Senegal", group: "I" },
  { id: "nor", name: "Norway", group: "I" },
  { id: "bol", name: "Bolivia", group: "I" },

  { id: "arg", name: "Argentina", group: "J" },
  { id: "alg", name: "Algeria", group: "J" },
  { id: "aut", name: "Austria", group: "J" },
  { id: "jor", name: "Jordan", group: "J" },

  { id: "por", name: "Portugal", group: "K" },
  { id: "uzb", name: "Uzbekistan", group: "K" },
  { id: "col", name: "Colombia", group: "K" },
  { id: "cro", name: "Croatia", group: "K" },

  { id: "eng", name: "England", group: "L" },
  { id: "gha", name: "Ghana", group: "L" },
  { id: "pan", name: "Panama", group: "L" },
  { id: "crc", name: "Costa Rica", group: "L" },
];

export const teamsById: Record<string, Team> = Object.fromEntries(
  teams.map((team) => [team.id, team]),
);
