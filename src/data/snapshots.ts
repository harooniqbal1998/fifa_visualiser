import type { Snapshot } from "@/types";

export const snapshots: Snapshot[] = [
  {
    "day": 0,
    "probabilities": {
      "mex": 1.59,
      "rsa": 0.05,
      "kor": 0.24,
      "cze": 0.14,
      "can": 0.34,
      "bih": 0.14,
      "qat": 0.05,
      "sui": 1.2,
      "bra": 8.31,
      "mar": 1.59,
      "hai": 0.05,
      "sco": 0.24,
      "usa": 1.1,
      "par": 0.14,
      "aus": 0.14,
      "tur": 1.1,
      "ger": 4.95,
      "cuw": 0.05,
      "civ": 0.34,
      "ecu": 0.82,
      "ned": 4.47,
      "jpn": 1.68,
      "swe": 0.34,
      "tun": 0.05,
      "bel": 1.97,
      "egy": 0.24,
      "irn": 0.14,
      "nzl": 0.05,
      "esp": 16.28,
      "cpv": 0.05,
      "ksa": 0.05,
      "uru": 0.91,
      "fra": 15.42,
      "sen": 0.62,
      "irq": 0.05,
      "nor": 2.26,
      "arg": 8.5,
      "alg": 0.14,
      "aut": 0.43,
      "jor": 0.05,
      "por": 10.71,
      "cod": 0.14,
      "uzb": 0.05,
      "col": 1.68,
      "eng": 10.13,
      "cro": 0.82,
      "gha": 0.14,
      "pan": 0.05
    },
    "possibleOpponents": {
      "mex": [
        "rsa",
        "kor",
        "cze"
      ],
      "rsa": [
        "mex",
        "kor",
        "cze"
      ],
      "kor": [
        "mex",
        "rsa",
        "cze"
      ],
      "cze": [
        "mex",
        "rsa",
        "kor"
      ],
      "can": [
        "bih",
        "qat",
        "sui"
      ],
      "bih": [
        "can",
        "qat",
        "sui"
      ],
      "qat": [
        "can",
        "bih",
        "sui"
      ],
      "sui": [
        "can",
        "bih",
        "qat"
      ],
      "bra": [
        "mar",
        "hai",
        "sco"
      ],
      "mar": [
        "bra",
        "hai",
        "sco"
      ],
      "hai": [
        "bra",
        "mar",
        "sco"
      ],
      "sco": [
        "bra",
        "mar",
        "hai"
      ],
      "usa": [
        "par",
        "aus",
        "tur"
      ],
      "par": [
        "usa",
        "aus",
        "tur"
      ],
      "aus": [
        "usa",
        "par",
        "tur"
      ],
      "tur": [
        "usa",
        "par",
        "aus"
      ],
      "ger": [
        "cuw",
        "civ",
        "ecu"
      ],
      "cuw": [
        "ger",
        "civ",
        "ecu"
      ],
      "civ": [
        "ger",
        "cuw",
        "ecu"
      ],
      "ecu": [
        "ger",
        "cuw",
        "civ"
      ],
      "ned": [
        "jpn",
        "swe",
        "tun"
      ],
      "jpn": [
        "ned",
        "swe",
        "tun"
      ],
      "swe": [
        "ned",
        "jpn",
        "tun"
      ],
      "tun": [
        "ned",
        "jpn",
        "swe"
      ],
      "bel": [
        "egy",
        "irn",
        "nzl"
      ],
      "egy": [
        "bel",
        "irn",
        "nzl"
      ],
      "irn": [
        "bel",
        "egy",
        "nzl"
      ],
      "nzl": [
        "bel",
        "egy",
        "irn"
      ],
      "esp": [
        "cpv",
        "ksa",
        "uru"
      ],
      "cpv": [
        "esp",
        "ksa",
        "uru"
      ],
      "ksa": [
        "esp",
        "cpv",
        "uru"
      ],
      "uru": [
        "esp",
        "cpv",
        "ksa"
      ],
      "fra": [
        "sen",
        "irq",
        "nor"
      ],
      "sen": [
        "fra",
        "irq",
        "nor"
      ],
      "irq": [
        "fra",
        "sen",
        "nor"
      ],
      "nor": [
        "fra",
        "sen",
        "irq"
      ],
      "arg": [
        "alg",
        "aut",
        "jor"
      ],
      "alg": [
        "arg",
        "aut",
        "jor"
      ],
      "aut": [
        "arg",
        "alg",
        "jor"
      ],
      "jor": [
        "arg",
        "alg",
        "aut"
      ],
      "por": [
        "cod",
        "uzb",
        "col"
      ],
      "cod": [
        "por",
        "uzb",
        "col"
      ],
      "uzb": [
        "por",
        "cod",
        "col"
      ],
      "col": [
        "por",
        "cod",
        "uzb"
      ],
      "eng": [
        "cro",
        "gha",
        "pan"
      ],
      "cro": [
        "eng",
        "gha",
        "pan"
      ],
      "gha": [
        "eng",
        "cro",
        "pan"
      ],
      "pan": [
        "eng",
        "cro",
        "gha"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 1,
    "probabilities": {
      "mex": 0.36,
      "rsa": 0.01,
      "kor": 0.93,
      "cze": 0,
      "can": 0.04,
      "bih": 0,
      "qat": 0.03,
      "sui": 1.76,
      "bra": 7.88,
      "mar": 2.9,
      "hai": 0,
      "sco": 0.13,
      "usa": 1.36,
      "par": 0.09,
      "aus": 0.3,
      "tur": 0,
      "ger": 4.39,
      "cuw": 0,
      "civ": 0.04,
      "ecu": 0.41,
      "ned": 5.92,
      "jpn": 1.37,
      "swe": 0,
      "tun": 0.04,
      "bel": 6.15,
      "egy": 0.3,
      "irn": 0.91,
      "nzl": 0,
      "esp": 13.18,
      "cpv": 0.01,
      "ksa": 0.01,
      "uru": 1.82,
      "fra": 11.4,
      "sen": 1.06,
      "irq": 0,
      "nor": 0.21,
      "arg": 12.49,
      "alg": 0.12,
      "aut": 0.32,
      "jor": 0,
      "por": 7.64,
      "cod": 0,
      "uzb": 0.02,
      "col": 2.42,
      "eng": 10.17,
      "cro": 3.74,
      "gha": 0.01,
      "pan": 0.07
    },
    "possibleOpponents": {
      "mex": [
        "kor",
        "cze"
      ],
      "rsa": [
        "kor",
        "cze"
      ],
      "kor": [
        "mex",
        "rsa"
      ],
      "cze": [
        "mex",
        "rsa"
      ],
      "can": [
        "qat",
        "sui"
      ],
      "bih": [
        "qat",
        "sui"
      ],
      "qat": [
        "can",
        "bih"
      ],
      "sui": [
        "can",
        "bih"
      ],
      "bra": [
        "hai",
        "sco"
      ],
      "mar": [
        "hai",
        "sco"
      ],
      "hai": [
        "bra",
        "mar"
      ],
      "sco": [
        "bra",
        "mar"
      ],
      "usa": [
        "par",
        "aus",
        "tur"
      ],
      "par": [
        "usa",
        "aus",
        "tur"
      ],
      "aus": [
        "usa",
        "par",
        "tur"
      ],
      "tur": [
        "usa",
        "par",
        "aus"
      ],
      "ger": [
        "cuw",
        "civ",
        "ecu"
      ],
      "cuw": [
        "ger",
        "civ",
        "ecu"
      ],
      "civ": [
        "ger",
        "cuw",
        "ecu"
      ],
      "ecu": [
        "ger",
        "cuw",
        "civ"
      ],
      "ned": [
        "jpn",
        "swe",
        "tun"
      ],
      "jpn": [
        "ned",
        "swe",
        "tun"
      ],
      "swe": [
        "ned",
        "jpn",
        "tun"
      ],
      "tun": [
        "ned",
        "jpn",
        "swe"
      ],
      "bel": [
        "egy",
        "irn",
        "nzl"
      ],
      "egy": [
        "bel",
        "irn",
        "nzl"
      ],
      "irn": [
        "bel",
        "egy",
        "nzl"
      ],
      "nzl": [
        "bel",
        "egy",
        "irn"
      ],
      "esp": [
        "cpv",
        "ksa",
        "uru"
      ],
      "cpv": [
        "esp",
        "ksa",
        "uru"
      ],
      "ksa": [
        "esp",
        "cpv",
        "uru"
      ],
      "uru": [
        "esp",
        "cpv",
        "ksa"
      ],
      "fra": [
        "sen",
        "irq",
        "nor"
      ],
      "sen": [
        "fra",
        "irq",
        "nor"
      ],
      "irq": [
        "fra",
        "sen",
        "nor"
      ],
      "nor": [
        "fra",
        "sen",
        "irq"
      ],
      "arg": [
        "alg",
        "aut",
        "jor"
      ],
      "alg": [
        "arg",
        "aut",
        "jor"
      ],
      "aut": [
        "arg",
        "alg",
        "jor"
      ],
      "jor": [
        "arg",
        "alg",
        "aut"
      ],
      "por": [
        "cod",
        "uzb",
        "col"
      ],
      "cod": [
        "por",
        "uzb",
        "col"
      ],
      "uzb": [
        "por",
        "cod",
        "col"
      ],
      "col": [
        "por",
        "cod",
        "uzb"
      ],
      "eng": [
        "cro",
        "gha",
        "pan"
      ],
      "cro": [
        "eng",
        "gha",
        "pan"
      ],
      "gha": [
        "eng",
        "cro",
        "pan"
      ],
      "pan": [
        "eng",
        "cro",
        "gha"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 2,
    "probabilities": {
      "mex": 0.35,
      "rsa": 0.01,
      "kor": 0.9,
      "cze": 0,
      "can": 0.04,
      "bih": 0,
      "qat": 0.03,
      "sui": 1.71,
      "bra": 8.04,
      "mar": 2.91,
      "hai": 0,
      "sco": 0.13,
      "usa": 1.71,
      "par": 0.04,
      "aus": 0.41,
      "tur": 0,
      "ger": 4.88,
      "cuw": 0,
      "civ": 0.11,
      "ecu": 0.22,
      "ned": 5.99,
      "jpn": 1.39,
      "swe": 0,
      "tun": 0,
      "bel": 5.9,
      "egy": 0.28,
      "irn": 0.87,
      "nzl": 0,
      "esp": 13,
      "cpv": 0.01,
      "ksa": 0.01,
      "uru": 1.78,
      "fra": 11.35,
      "sen": 1.08,
      "irq": 0,
      "nor": 0.21,
      "arg": 12.34,
      "alg": 0.12,
      "aut": 0.31,
      "jor": 0,
      "por": 7.58,
      "cod": 0,
      "uzb": 0.02,
      "col": 2.38,
      "eng": 10.11,
      "cro": 3.68,
      "gha": 0,
      "pan": 0.07
    },
    "possibleOpponents": {
      "mex": [
        "kor",
        "cze"
      ],
      "rsa": [
        "kor",
        "cze"
      ],
      "kor": [
        "mex",
        "rsa"
      ],
      "cze": [
        "mex",
        "rsa"
      ],
      "can": [
        "qat",
        "sui"
      ],
      "bih": [
        "qat",
        "sui"
      ],
      "qat": [
        "can",
        "bih"
      ],
      "sui": [
        "can",
        "bih"
      ],
      "bra": [
        "hai",
        "sco"
      ],
      "mar": [
        "hai",
        "sco"
      ],
      "hai": [
        "bra",
        "mar"
      ],
      "sco": [
        "bra",
        "mar"
      ],
      "usa": [
        "aus",
        "tur"
      ],
      "par": [
        "aus",
        "tur"
      ],
      "aus": [
        "usa",
        "par"
      ],
      "tur": [
        "usa",
        "par"
      ],
      "ger": [
        "civ",
        "ecu"
      ],
      "cuw": [
        "civ",
        "ecu"
      ],
      "civ": [
        "ger",
        "cuw"
      ],
      "ecu": [
        "ger",
        "cuw"
      ],
      "ned": [
        "swe",
        "tun"
      ],
      "jpn": [
        "swe",
        "tun"
      ],
      "swe": [
        "ned",
        "jpn"
      ],
      "tun": [
        "ned",
        "jpn"
      ],
      "bel": [
        "egy",
        "irn",
        "nzl"
      ],
      "egy": [
        "bel",
        "irn",
        "nzl"
      ],
      "irn": [
        "bel",
        "egy",
        "nzl"
      ],
      "nzl": [
        "bel",
        "egy",
        "irn"
      ],
      "esp": [
        "cpv",
        "ksa",
        "uru"
      ],
      "cpv": [
        "esp",
        "ksa",
        "uru"
      ],
      "ksa": [
        "esp",
        "cpv",
        "uru"
      ],
      "uru": [
        "esp",
        "cpv",
        "ksa"
      ],
      "fra": [
        "sen",
        "irq",
        "nor"
      ],
      "sen": [
        "fra",
        "irq",
        "nor"
      ],
      "irq": [
        "fra",
        "sen",
        "nor"
      ],
      "nor": [
        "fra",
        "sen",
        "irq"
      ],
      "arg": [
        "alg",
        "aut",
        "jor"
      ],
      "alg": [
        "arg",
        "aut",
        "jor"
      ],
      "aut": [
        "arg",
        "alg",
        "jor"
      ],
      "jor": [
        "arg",
        "alg",
        "aut"
      ],
      "por": [
        "cod",
        "uzb",
        "col"
      ],
      "cod": [
        "por",
        "uzb",
        "col"
      ],
      "uzb": [
        "por",
        "cod",
        "col"
      ],
      "col": [
        "por",
        "cod",
        "uzb"
      ],
      "eng": [
        "cro",
        "gha",
        "pan"
      ],
      "cro": [
        "eng",
        "gha",
        "pan"
      ],
      "gha": [
        "eng",
        "cro",
        "pan"
      ],
      "pan": [
        "eng",
        "cro",
        "gha"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 3,
    "probabilities": {
      "mex": 0.33,
      "rsa": 0.01,
      "kor": 0.86,
      "cze": 0,
      "can": 0.04,
      "bih": 0,
      "qat": 0.03,
      "sui": 1.69,
      "bra": 7.92,
      "mar": 2.86,
      "hai": 0,
      "sco": 0.13,
      "usa": 1.71,
      "par": 0.04,
      "aus": 0.41,
      "tur": 0,
      "ger": 4.77,
      "cuw": 0,
      "civ": 0.1,
      "ecu": 0.2,
      "ned": 5.96,
      "jpn": 1.37,
      "swe": 0,
      "tun": 0,
      "bel": 5.87,
      "egy": 0.34,
      "irn": 0.76,
      "nzl": 0,
      "esp": 12.43,
      "cpv": 0.01,
      "ksa": 0.02,
      "uru": 1.84,
      "fra": 12.48,
      "sen": 0.68,
      "irq": 0,
      "nor": 0.35,
      "arg": 13.2,
      "alg": 0.12,
      "aut": 0.33,
      "jor": 0,
      "por": 7.4,
      "cod": 0,
      "uzb": 0.02,
      "col": 2.35,
      "eng": 9.7,
      "cro": 3.62,
      "gha": 0,
      "pan": 0.07
    },
    "possibleOpponents": {
      "mex": [
        "kor",
        "cze"
      ],
      "rsa": [
        "kor",
        "cze"
      ],
      "kor": [
        "mex",
        "rsa"
      ],
      "cze": [
        "mex",
        "rsa"
      ],
      "can": [
        "qat",
        "sui"
      ],
      "bih": [
        "qat",
        "sui"
      ],
      "qat": [
        "can",
        "bih"
      ],
      "sui": [
        "can",
        "bih"
      ],
      "bra": [
        "hai",
        "sco"
      ],
      "mar": [
        "hai",
        "sco"
      ],
      "hai": [
        "bra",
        "mar"
      ],
      "sco": [
        "bra",
        "mar"
      ],
      "usa": [
        "aus",
        "tur"
      ],
      "par": [
        "aus",
        "tur"
      ],
      "aus": [
        "usa",
        "par"
      ],
      "tur": [
        "usa",
        "par"
      ],
      "ger": [
        "civ",
        "ecu"
      ],
      "cuw": [
        "civ",
        "ecu"
      ],
      "civ": [
        "ger",
        "cuw"
      ],
      "ecu": [
        "ger",
        "cuw"
      ],
      "ned": [
        "swe",
        "tun"
      ],
      "jpn": [
        "swe",
        "tun"
      ],
      "swe": [
        "ned",
        "jpn"
      ],
      "tun": [
        "ned",
        "jpn"
      ],
      "bel": [
        "irn",
        "nzl"
      ],
      "egy": [
        "irn",
        "nzl"
      ],
      "irn": [
        "bel",
        "egy"
      ],
      "nzl": [
        "bel",
        "egy"
      ],
      "esp": [
        "ksa",
        "uru"
      ],
      "cpv": [
        "ksa",
        "uru"
      ],
      "ksa": [
        "esp",
        "cpv"
      ],
      "uru": [
        "esp",
        "cpv"
      ],
      "fra": [
        "irq",
        "nor"
      ],
      "sen": [
        "irq",
        "nor"
      ],
      "irq": [
        "fra",
        "sen"
      ],
      "nor": [
        "fra",
        "sen"
      ],
      "arg": [
        "alg",
        "aut",
        "jor"
      ],
      "alg": [
        "arg",
        "aut",
        "jor"
      ],
      "aut": [
        "arg",
        "alg",
        "jor"
      ],
      "jor": [
        "arg",
        "alg",
        "aut"
      ],
      "por": [
        "cod",
        "uzb",
        "col"
      ],
      "cod": [
        "por",
        "uzb",
        "col"
      ],
      "uzb": [
        "por",
        "cod",
        "col"
      ],
      "col": [
        "por",
        "cod",
        "uzb"
      ],
      "eng": [
        "cro",
        "gha",
        "pan"
      ],
      "cro": [
        "eng",
        "gha",
        "pan"
      ],
      "gha": [
        "eng",
        "cro",
        "pan"
      ],
      "pan": [
        "eng",
        "cro",
        "gha"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 4,
    "probabilities": {
      "mex": 0.3,
      "rsa": 0,
      "kor": 0.8,
      "cze": 0,
      "can": 0.04,
      "bih": 0,
      "qat": 0.03,
      "sui": 1.63,
      "bra": 7.39,
      "mar": 2.73,
      "hai": 0,
      "sco": 0.12,
      "usa": 1.67,
      "par": 0.04,
      "aus": 0.39,
      "tur": 0,
      "ger": 4.61,
      "cuw": 0,
      "civ": 0.09,
      "ecu": 0.18,
      "ned": 5.77,
      "jpn": 1.27,
      "swe": 0,
      "tun": 0,
      "bel": 5.7,
      "egy": 0.31,
      "irn": 0.72,
      "nzl": 0,
      "esp": 11.95,
      "cpv": 0.01,
      "ksa": 0.01,
      "uru": 1.71,
      "fra": 12.11,
      "sen": 0.62,
      "irq": 0,
      "nor": 0.32,
      "arg": 13.88,
      "alg": 0.07,
      "aut": 0.45,
      "jor": 0,
      "por": 6.62,
      "cod": 0,
      "uzb": 0.01,
      "col": 3.21,
      "eng": 13.41,
      "cro": 1.81,
      "gha": 0.02,
      "pan": 0.01
    },
    "possibleOpponents": {
      "mex": [
        "kor",
        "cze"
      ],
      "rsa": [
        "kor",
        "cze"
      ],
      "kor": [
        "mex",
        "rsa"
      ],
      "cze": [
        "mex",
        "rsa"
      ],
      "can": [
        "qat",
        "sui"
      ],
      "bih": [
        "qat",
        "sui"
      ],
      "qat": [
        "can",
        "bih"
      ],
      "sui": [
        "can",
        "bih"
      ],
      "bra": [
        "hai",
        "sco"
      ],
      "mar": [
        "hai",
        "sco"
      ],
      "hai": [
        "bra",
        "mar"
      ],
      "sco": [
        "bra",
        "mar"
      ],
      "usa": [
        "aus",
        "tur"
      ],
      "par": [
        "aus",
        "tur"
      ],
      "aus": [
        "usa",
        "par"
      ],
      "tur": [
        "usa",
        "par"
      ],
      "ger": [
        "civ",
        "ecu"
      ],
      "cuw": [
        "civ",
        "ecu"
      ],
      "civ": [
        "ger",
        "cuw"
      ],
      "ecu": [
        "ger",
        "cuw"
      ],
      "ned": [
        "swe",
        "tun"
      ],
      "jpn": [
        "swe",
        "tun"
      ],
      "swe": [
        "ned",
        "jpn"
      ],
      "tun": [
        "ned",
        "jpn"
      ],
      "bel": [
        "irn",
        "nzl"
      ],
      "egy": [
        "irn",
        "nzl"
      ],
      "irn": [
        "bel",
        "egy"
      ],
      "nzl": [
        "bel",
        "egy"
      ],
      "esp": [
        "ksa",
        "uru"
      ],
      "cpv": [
        "ksa",
        "uru"
      ],
      "ksa": [
        "esp",
        "cpv"
      ],
      "uru": [
        "esp",
        "cpv"
      ],
      "fra": [
        "irq",
        "nor"
      ],
      "sen": [
        "irq",
        "nor"
      ],
      "irq": [
        "fra",
        "sen"
      ],
      "nor": [
        "fra",
        "sen"
      ],
      "arg": [
        "aut",
        "jor"
      ],
      "alg": [
        "aut",
        "jor"
      ],
      "aut": [
        "arg",
        "alg"
      ],
      "jor": [
        "arg",
        "alg"
      ],
      "por": [
        "uzb",
        "col"
      ],
      "cod": [
        "uzb",
        "col"
      ],
      "uzb": [
        "por",
        "cod"
      ],
      "col": [
        "por",
        "cod"
      ],
      "eng": [
        "gha",
        "pan"
      ],
      "cro": [
        "gha",
        "pan"
      ],
      "gha": [
        "eng",
        "cro"
      ],
      "pan": [
        "eng",
        "cro"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 5,
    "probabilities": {
      "mex": 0.38,
      "rsa": 0,
      "kor": 0.49,
      "cze": 0,
      "can": 0.08,
      "bih": 0,
      "qat": 0.01,
      "sui": 1.95,
      "bra": 7.8,
      "mar": 3.46,
      "hai": 0,
      "sco": 0.09,
      "usa": 1.87,
      "par": 0.04,
      "aus": 0.41,
      "tur": 0,
      "ger": 4.69,
      "cuw": 0,
      "civ": 0.09,
      "ecu": 0.17,
      "ned": 5.4,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 5.53,
      "egy": 0.29,
      "irn": 0.63,
      "nzl": 0,
      "esp": 11.93,
      "cpv": 0.01,
      "ksa": 0.01,
      "uru": 1.7,
      "fra": 11.98,
      "sen": 0.6,
      "irq": 0,
      "nor": 0.31,
      "arg": 13.65,
      "alg": 0.07,
      "aut": 0.44,
      "jor": 0,
      "por": 6.41,
      "cod": 0,
      "uzb": 0.01,
      "col": 3.08,
      "eng": 13.39,
      "cro": 1.8,
      "gha": 0.02,
      "pan": 0.01
    },
    "possibleOpponents": {
      "mex": [
        "cze"
      ],
      "rsa": [
        "kor"
      ],
      "kor": [
        "rsa"
      ],
      "cze": [
        "mex"
      ],
      "can": [
        "sui"
      ],
      "bih": [
        "qat"
      ],
      "qat": [
        "bih"
      ],
      "sui": [
        "can"
      ],
      "bra": [
        "sco"
      ],
      "mar": [
        "hai"
      ],
      "hai": [
        "mar"
      ],
      "sco": [
        "bra"
      ],
      "usa": [
        "aus",
        "tur"
      ],
      "par": [
        "aus",
        "tur"
      ],
      "aus": [
        "usa",
        "par"
      ],
      "tur": [
        "usa",
        "par"
      ],
      "ger": [
        "civ",
        "ecu"
      ],
      "cuw": [
        "civ",
        "ecu"
      ],
      "civ": [
        "ger",
        "cuw"
      ],
      "ecu": [
        "ger",
        "cuw"
      ],
      "ned": [
        "swe",
        "tun"
      ],
      "jpn": [
        "swe",
        "tun"
      ],
      "swe": [
        "ned",
        "jpn"
      ],
      "tun": [
        "ned",
        "jpn"
      ],
      "bel": [
        "irn",
        "nzl"
      ],
      "egy": [
        "irn",
        "nzl"
      ],
      "irn": [
        "bel",
        "egy"
      ],
      "nzl": [
        "bel",
        "egy"
      ],
      "esp": [
        "ksa",
        "uru"
      ],
      "cpv": [
        "ksa",
        "uru"
      ],
      "ksa": [
        "esp",
        "cpv"
      ],
      "uru": [
        "esp",
        "cpv"
      ],
      "fra": [
        "irq",
        "nor"
      ],
      "sen": [
        "irq",
        "nor"
      ],
      "irq": [
        "fra",
        "sen"
      ],
      "nor": [
        "fra",
        "sen"
      ],
      "arg": [
        "aut",
        "jor"
      ],
      "alg": [
        "aut",
        "jor"
      ],
      "aut": [
        "arg",
        "alg"
      ],
      "jor": [
        "arg",
        "alg"
      ],
      "por": [
        "uzb",
        "col"
      ],
      "cod": [
        "uzb",
        "col"
      ],
      "uzb": [
        "por",
        "cod"
      ],
      "col": [
        "por",
        "cod"
      ],
      "eng": [
        "gha",
        "pan"
      ],
      "cro": [
        "gha",
        "pan"
      ],
      "gha": [
        "eng",
        "cro"
      ],
      "pan": [
        "eng",
        "cro"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 6,
    "probabilities": {
      "mex": 0.39,
      "rsa": 0,
      "kor": 0.45,
      "cze": 0,
      "can": 0.07,
      "bih": 0,
      "qat": 0.01,
      "sui": 1.92,
      "bra": 7.6,
      "mar": 3.15,
      "hai": 0,
      "sco": 0.08,
      "usa": 2.52,
      "par": 0.06,
      "aus": 0.22,
      "tur": 0,
      "ger": 5.3,
      "cuw": 0,
      "civ": 0.06,
      "ecu": 0.09,
      "ned": 5.8,
      "jpn": 1.38,
      "swe": 0,
      "tun": 0,
      "bel": 5.31,
      "egy": 0.3,
      "irn": 0.6,
      "nzl": 0,
      "esp": 11.69,
      "cpv": 0.01,
      "ksa": 0.01,
      "uru": 1.65,
      "fra": 11.54,
      "sen": 0.64,
      "irq": 0,
      "nor": 0.32,
      "arg": 13.81,
      "alg": 0.07,
      "aut": 0.43,
      "jor": 0,
      "por": 6.33,
      "cod": 0,
      "uzb": 0.01,
      "col": 3.03,
      "eng": 13.39,
      "cro": 1.75,
      "gha": 0.02,
      "pan": 0.01
    },
    "possibleOpponents": {
      "mex": [
        "cze"
      ],
      "rsa": [
        "kor"
      ],
      "kor": [
        "rsa"
      ],
      "cze": [
        "mex"
      ],
      "can": [
        "sui"
      ],
      "bih": [
        "qat"
      ],
      "qat": [
        "bih"
      ],
      "sui": [
        "can"
      ],
      "bra": [
        "sco"
      ],
      "mar": [
        "hai"
      ],
      "hai": [
        "mar"
      ],
      "sco": [
        "bra"
      ],
      "usa": [
        "tur"
      ],
      "par": [
        "aus"
      ],
      "aus": [
        "par"
      ],
      "tur": [
        "usa"
      ],
      "ger": [
        "ecu"
      ],
      "cuw": [
        "civ"
      ],
      "civ": [
        "cuw"
      ],
      "ecu": [
        "ger"
      ],
      "ned": [
        "tun"
      ],
      "jpn": [
        "swe"
      ],
      "swe": [
        "jpn"
      ],
      "tun": [
        "ned"
      ],
      "bel": [
        "irn",
        "nzl"
      ],
      "egy": [
        "irn",
        "nzl"
      ],
      "irn": [
        "bel",
        "egy"
      ],
      "nzl": [
        "bel",
        "egy"
      ],
      "esp": [
        "ksa",
        "uru"
      ],
      "cpv": [
        "ksa",
        "uru"
      ],
      "ksa": [
        "esp",
        "cpv"
      ],
      "uru": [
        "esp",
        "cpv"
      ],
      "fra": [
        "irq",
        "nor"
      ],
      "sen": [
        "irq",
        "nor"
      ],
      "irq": [
        "fra",
        "sen"
      ],
      "nor": [
        "fra",
        "sen"
      ],
      "arg": [
        "aut",
        "jor"
      ],
      "alg": [
        "aut",
        "jor"
      ],
      "aut": [
        "arg",
        "alg"
      ],
      "jor": [
        "arg",
        "alg"
      ],
      "por": [
        "uzb",
        "col"
      ],
      "cod": [
        "uzb",
        "col"
      ],
      "uzb": [
        "por",
        "cod"
      ],
      "col": [
        "por",
        "cod"
      ],
      "eng": [
        "gha",
        "pan"
      ],
      "cro": [
        "gha",
        "pan"
      ],
      "gha": [
        "eng",
        "cro"
      ],
      "pan": [
        "eng",
        "cro"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 7,
    "probabilities": {
      "mex": 0.4,
      "rsa": 0,
      "kor": 0.46,
      "cze": 0,
      "can": 0.08,
      "bih": 0,
      "qat": 0.01,
      "sui": 1.97,
      "bra": 7.53,
      "mar": 3.14,
      "hai": 0,
      "sco": 0.1,
      "usa": 2.65,
      "par": 0.06,
      "aus": 0.2,
      "tur": 0,
      "ger": 5.32,
      "cuw": 0,
      "civ": 0.06,
      "ecu": 0.09,
      "ned": 5.76,
      "jpn": 1.38,
      "swe": 0,
      "tun": 0,
      "bel": 5.23,
      "egy": 0.32,
      "irn": 0.53,
      "nzl": 0,
      "esp": 12.05,
      "cpv": 0.01,
      "ksa": 0.01,
      "uru": 0.65,
      "fra": 12.06,
      "sen": 0.34,
      "irq": 0,
      "nor": 0.58,
      "arg": 13.48,
      "alg": 0.08,
      "aut": 0.45,
      "jor": 0,
      "por": 6.42,
      "cod": 0,
      "uzb": 0.02,
      "col": 3.11,
      "eng": 13.6,
      "cro": 1.82,
      "gha": 0.02,
      "pan": 0.02
    },
    "possibleOpponents": {
      "mex": [
        "cze"
      ],
      "rsa": [
        "kor"
      ],
      "kor": [
        "rsa"
      ],
      "cze": [
        "mex"
      ],
      "can": [
        "sui"
      ],
      "bih": [
        "qat"
      ],
      "qat": [
        "bih"
      ],
      "sui": [
        "can"
      ],
      "bra": [
        "sco"
      ],
      "mar": [
        "hai"
      ],
      "hai": [
        "mar"
      ],
      "sco": [
        "bra"
      ],
      "usa": [
        "tur"
      ],
      "par": [
        "aus"
      ],
      "aus": [
        "par"
      ],
      "tur": [
        "usa"
      ],
      "ger": [
        "ecu"
      ],
      "cuw": [
        "civ"
      ],
      "civ": [
        "cuw"
      ],
      "ecu": [
        "ger"
      ],
      "ned": [
        "tun"
      ],
      "jpn": [
        "swe"
      ],
      "swe": [
        "jpn"
      ],
      "tun": [
        "ned"
      ],
      "bel": [
        "nzl"
      ],
      "egy": [
        "irn"
      ],
      "irn": [
        "egy"
      ],
      "nzl": [
        "bel"
      ],
      "esp": [
        "uru"
      ],
      "cpv": [
        "ksa"
      ],
      "ksa": [
        "cpv"
      ],
      "uru": [
        "esp"
      ],
      "fra": [
        "nor"
      ],
      "sen": [
        "irq"
      ],
      "irq": [
        "sen"
      ],
      "nor": [
        "fra"
      ],
      "arg": [
        "aut",
        "jor"
      ],
      "alg": [
        "aut",
        "jor"
      ],
      "aut": [
        "arg",
        "alg"
      ],
      "jor": [
        "arg",
        "alg"
      ],
      "por": [
        "uzb",
        "col"
      ],
      "cod": [
        "uzb",
        "col"
      ],
      "uzb": [
        "por",
        "cod"
      ],
      "col": [
        "por",
        "cod"
      ],
      "eng": [
        "gha",
        "pan"
      ],
      "cro": [
        "gha",
        "pan"
      ],
      "gha": [
        "eng",
        "cro"
      ],
      "pan": [
        "eng",
        "cro"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 8,
    "probabilities": {
      "mex": 0.39,
      "rsa": 0,
      "kor": 0.44,
      "cze": 0,
      "can": 0.07,
      "bih": 0,
      "qat": 0.01,
      "sui": 1.77,
      "bra": 7.37,
      "mar": 3.06,
      "hai": 0,
      "sco": 0.09,
      "usa": 2.53,
      "par": 0.05,
      "aus": 0.18,
      "tur": 0,
      "ger": 5.19,
      "cuw": 0,
      "civ": 0.06,
      "ecu": 0.09,
      "ned": 5.64,
      "jpn": 1.34,
      "swe": 0,
      "tun": 0,
      "bel": 4.88,
      "egy": 0.29,
      "irn": 0.45,
      "nzl": 0,
      "esp": 11.72,
      "cpv": 0,
      "ksa": 0.01,
      "uru": 0.59,
      "fra": 11.8,
      "sen": 0.32,
      "irq": 0,
      "nor": 0.56,
      "arg": 15.32,
      "alg": 0.11,
      "aut": 0.28,
      "jor": 0,
      "por": 7.06,
      "cod": 0,
      "uzb": 0.01,
      "col": 2.99,
      "eng": 12.6,
      "cro": 2.69,
      "gha": 0.02,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [
        "cze"
      ],
      "rsa": [
        "kor"
      ],
      "kor": [
        "rsa"
      ],
      "cze": [
        "mex"
      ],
      "can": [
        "sui"
      ],
      "bih": [
        "qat"
      ],
      "qat": [
        "bih"
      ],
      "sui": [
        "can"
      ],
      "bra": [
        "sco"
      ],
      "mar": [
        "hai"
      ],
      "hai": [
        "mar"
      ],
      "sco": [
        "bra"
      ],
      "usa": [
        "tur"
      ],
      "par": [
        "aus"
      ],
      "aus": [
        "par"
      ],
      "tur": [
        "usa"
      ],
      "ger": [
        "ecu"
      ],
      "cuw": [
        "civ"
      ],
      "civ": [
        "cuw"
      ],
      "ecu": [
        "ger"
      ],
      "ned": [
        "tun"
      ],
      "jpn": [
        "swe"
      ],
      "swe": [
        "jpn"
      ],
      "tun": [
        "ned"
      ],
      "bel": [
        "nzl"
      ],
      "egy": [
        "irn"
      ],
      "irn": [
        "egy"
      ],
      "nzl": [
        "bel"
      ],
      "esp": [
        "uru"
      ],
      "cpv": [
        "ksa"
      ],
      "ksa": [
        "cpv"
      ],
      "uru": [
        "esp"
      ],
      "fra": [
        "nor"
      ],
      "sen": [
        "irq"
      ],
      "irq": [
        "sen"
      ],
      "nor": [
        "fra"
      ],
      "arg": [
        "jor"
      ],
      "alg": [
        "aut"
      ],
      "aut": [
        "alg"
      ],
      "jor": [
        "arg"
      ],
      "por": [
        "col"
      ],
      "cod": [
        "uzb"
      ],
      "uzb": [
        "cod"
      ],
      "col": [
        "por"
      ],
      "eng": [
        "pan"
      ],
      "cro": [
        "gha"
      ],
      "gha": [
        "cro"
      ],
      "pan": [
        "eng"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 9,
    "probabilities": {
      "mex": 0.44,
      "rsa": 0.03,
      "kor": 0.2,
      "cze": 0,
      "can": 0.07,
      "bih": 0,
      "qat": 0,
      "sui": 2.01,
      "bra": 8.66,
      "mar": 3.7,
      "hai": 0,
      "sco": 0.06,
      "usa": 2.63,
      "par": 0.05,
      "aus": 0.16,
      "tur": 0,
      "ger": 5.35,
      "cuw": 0,
      "civ": 0.05,
      "ecu": 0.08,
      "ned": 5.83,
      "jpn": 1.27,
      "swe": 0,
      "tun": 0,
      "bel": 4.61,
      "egy": 0.24,
      "irn": 0.43,
      "nzl": 0,
      "esp": 11.57,
      "cpv": 0,
      "ksa": 0.01,
      "uru": 0.58,
      "fra": 11.59,
      "sen": 0.27,
      "irq": 0,
      "nor": 0.53,
      "arg": 14.89,
      "alg": 0.1,
      "aut": 0.25,
      "jor": 0,
      "por": 6.69,
      "cod": 0,
      "uzb": 0.01,
      "col": 2.83,
      "eng": 12.19,
      "cro": 2.59,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [],
      "kor": [],
      "cze": [],
      "can": [],
      "bih": [],
      "qat": [],
      "sui": [],
      "bra": [],
      "mar": [],
      "hai": [],
      "sco": [],
      "usa": [
        "tur"
      ],
      "par": [
        "aus"
      ],
      "aus": [
        "par"
      ],
      "tur": [
        "usa"
      ],
      "ger": [
        "ecu"
      ],
      "cuw": [
        "civ"
      ],
      "civ": [
        "cuw"
      ],
      "ecu": [
        "ger"
      ],
      "ned": [
        "tun"
      ],
      "jpn": [
        "swe"
      ],
      "swe": [
        "jpn"
      ],
      "tun": [
        "ned"
      ],
      "bel": [
        "nzl"
      ],
      "egy": [
        "irn"
      ],
      "irn": [
        "egy"
      ],
      "nzl": [
        "bel"
      ],
      "esp": [
        "uru"
      ],
      "cpv": [
        "ksa"
      ],
      "ksa": [
        "cpv"
      ],
      "uru": [
        "esp"
      ],
      "fra": [
        "nor"
      ],
      "sen": [
        "irq"
      ],
      "irq": [
        "sen"
      ],
      "nor": [
        "fra"
      ],
      "arg": [
        "jor"
      ],
      "alg": [
        "aut"
      ],
      "aut": [
        "alg"
      ],
      "jor": [
        "arg"
      ],
      "por": [
        "col"
      ],
      "cod": [
        "uzb"
      ],
      "uzb": [
        "cod"
      ],
      "col": [
        "por"
      ],
      "eng": [
        "pan"
      ],
      "cro": [
        "gha"
      ],
      "gha": [
        "cro"
      ],
      "pan": [
        "eng"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 10,
    "probabilities": {
      "mex": 0.41,
      "rsa": 0.03,
      "kor": 0.14,
      "cze": 0,
      "can": 0.07,
      "bih": 0,
      "qat": 0,
      "sui": 2.01,
      "bra": 8.52,
      "mar": 3.51,
      "hai": 0,
      "sco": 0.04,
      "usa": 1.77,
      "par": 0.07,
      "aus": 0.2,
      "tur": 0,
      "ger": 3.97,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.43,
      "ned": 6.79,
      "jpn": 1.22,
      "swe": 0,
      "tun": 0,
      "bel": 4.7,
      "egy": 0.26,
      "irn": 0.41,
      "nzl": 0,
      "esp": 11.65,
      "cpv": 0,
      "ksa": 0.01,
      "uru": 0.59,
      "fra": 12.7,
      "sen": 0.17,
      "irq": 0,
      "nor": 0.56,
      "arg": 14.93,
      "alg": 0.09,
      "aut": 0.23,
      "jor": 0,
      "por": 6.8,
      "cod": 0,
      "uzb": 0.01,
      "col": 2.89,
      "eng": 12.14,
      "cro": 2.58,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [],
      "kor": [],
      "cze": [],
      "can": [],
      "bih": [],
      "qat": [],
      "sui": [],
      "bra": [],
      "mar": [],
      "hai": [],
      "sco": [],
      "usa": [],
      "par": [],
      "aus": [],
      "tur": [],
      "ger": [],
      "cuw": [],
      "civ": [],
      "ecu": [],
      "ned": [],
      "jpn": [],
      "swe": [],
      "tun": [],
      "bel": [
        "nzl"
      ],
      "egy": [
        "irn"
      ],
      "irn": [
        "egy"
      ],
      "nzl": [
        "bel"
      ],
      "esp": [
        "uru"
      ],
      "cpv": [
        "ksa"
      ],
      "ksa": [
        "cpv"
      ],
      "uru": [
        "esp"
      ],
      "fra": [
        "nor"
      ],
      "sen": [
        "irq"
      ],
      "irq": [
        "sen"
      ],
      "nor": [
        "fra"
      ],
      "arg": [
        "jor"
      ],
      "alg": [
        "aut"
      ],
      "aut": [
        "alg"
      ],
      "jor": [
        "arg"
      ],
      "por": [
        "col"
      ],
      "cod": [
        "uzb"
      ],
      "uzb": [
        "cod"
      ],
      "col": [
        "por"
      ],
      "eng": [
        "pan"
      ],
      "cro": [
        "gha"
      ],
      "gha": [
        "cro"
      ],
      "pan": [
        "eng"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 11,
    "probabilities": {
      "mex": 0.41,
      "rsa": 0.02,
      "kor": 0.1,
      "cze": 0,
      "can": 0.06,
      "bih": 0,
      "qat": 0,
      "sui": 1.83,
      "bra": 8.7,
      "mar": 2.9,
      "hai": 0,
      "sco": 0.05,
      "usa": 1.26,
      "par": 0.05,
      "aus": 0.26,
      "tur": 0,
      "ger": 3.02,
      "cuw": 0,
      "civ": 0.09,
      "ecu": 0.4,
      "ned": 5.74,
      "jpn": 1.27,
      "swe": 0,
      "tun": 0,
      "bel": 4.71,
      "egy": 0.23,
      "irn": 0.26,
      "nzl": 0,
      "esp": 13.81,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 14.07,
      "sen": 0.22,
      "irq": 0,
      "nor": 0.38,
      "arg": 17.75,
      "alg": 0.06,
      "aut": 0.15,
      "jor": 0,
      "por": 6.06,
      "cod": 0,
      "uzb": 0.01,
      "col": 2.4,
      "eng": 11.66,
      "cro": 2.05,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [],
      "kor": [],
      "cze": [],
      "can": [],
      "bih": [],
      "qat": [],
      "sui": [],
      "bra": [],
      "mar": [],
      "hai": [],
      "sco": [],
      "usa": [],
      "par": [],
      "aus": [],
      "tur": [],
      "ger": [],
      "cuw": [],
      "civ": [],
      "ecu": [],
      "ned": [],
      "jpn": [],
      "swe": [],
      "tun": [],
      "bel": [],
      "egy": [],
      "irn": [],
      "nzl": [],
      "esp": [],
      "cpv": [],
      "ksa": [],
      "uru": [],
      "fra": [],
      "sen": [],
      "irq": [],
      "nor": [],
      "arg": [
        "jor"
      ],
      "alg": [
        "aut"
      ],
      "aut": [
        "alg"
      ],
      "jor": [
        "arg"
      ],
      "por": [
        "col"
      ],
      "cod": [
        "uzb"
      ],
      "uzb": [
        "cod"
      ],
      "col": [
        "por"
      ],
      "eng": [
        "pan"
      ],
      "cro": [
        "gha"
      ],
      "gha": [
        "cro"
      ],
      "pan": [
        "eng"
      ]
    },
    "bracketDepths": {
      "mex": 0,
      "rsa": 0,
      "kor": 0,
      "cze": 0,
      "can": 0,
      "bih": 0,
      "qat": 0,
      "sui": 0,
      "bra": 0,
      "mar": 0,
      "hai": 0,
      "sco": 0,
      "usa": 0,
      "par": 0,
      "aus": 0,
      "tur": 0,
      "ger": 0,
      "cuw": 0,
      "civ": 0,
      "ecu": 0,
      "ned": 0,
      "jpn": 0,
      "swe": 0,
      "tun": 0,
      "bel": 0,
      "egy": 0,
      "irn": 0,
      "nzl": 0,
      "esp": 0,
      "cpv": 0,
      "ksa": 0,
      "uru": 0,
      "fra": 0,
      "sen": 0,
      "irq": 0,
      "nor": 0,
      "arg": 0,
      "alg": 0,
      "aut": 0,
      "jor": 0,
      "por": 0,
      "cod": 0,
      "uzb": 0,
      "col": 0,
      "eng": 0,
      "cro": 0,
      "gha": 0,
      "pan": 0
    },
    "eliminatedTeamIds": []
  },
  {
    "day": 12,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.83,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.58,
      "egy": 0.24,
      "irn": 0.15,
      "nzl": 0,
      "esp": 12.79,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.81,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.3,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.67,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 13,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0.1,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.31,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.68,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 14,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.83,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.58,
      "egy": 0.24,
      "irn": 0.15,
      "nzl": 0,
      "esp": 12.79,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.81,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.3,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.67,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 15,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0.05,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.32,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 16,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0.02,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.81,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.83,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.33,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [
        "sco"
      ],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [
        "mex"
      ],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 17,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0.05,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.32,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 18,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0.05,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.32,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 19,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0.1,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.31,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.68,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 20,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0.02,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.81,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.83,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.33,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [
        "sco"
      ],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [
        "mex"
      ],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 21,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.83,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.58,
      "egy": 0.24,
      "irn": 0.15,
      "nzl": 0,
      "esp": 12.79,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.81,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.3,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.67,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 22,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0.05,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.32,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 23,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0.1,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.31,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.68,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 24,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0.02,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.81,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.83,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.33,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [
        "sco"
      ],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [
        "mex"
      ],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 25,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0.05,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.32,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 26,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.83,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.58,
      "egy": 0.24,
      "irn": 0.15,
      "nzl": 0,
      "esp": 12.79,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.81,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.3,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.67,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 27,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0.1,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.31,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.68,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 28,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0.02,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.81,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.83,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.33,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [
        "sco"
      ],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [
        "mex"
      ],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 29,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0.1,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.31,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.68,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 30,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0.1,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.31,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.68,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 31,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0.02,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.81,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.83,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.33,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [
        "sco"
      ],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [
        "mex"
      ],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 32,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.83,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.58,
      "egy": 0.24,
      "irn": 0.15,
      "nzl": 0,
      "esp": 12.79,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.81,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.3,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.67,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 33,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0.05,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.22,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.18,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.32,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.26,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.69,
      "cro": 1.76,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 34,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.83,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.58,
      "egy": 0.24,
      "irn": 0.15,
      "nzl": 0,
      "esp": 12.79,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.81,
      "sen": 0,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.3,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.67,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "nzl",
      "ksa",
      "uru",
      "sen",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  },
  {
    "day": 35,
    "probabilities": {
      "mex": 0.34,
      "rsa": 0.02,
      "kor": 0,
      "cze": 0,
      "can": 0.05,
      "bih": 0,
      "qat": 0,
      "sui": 2.08,
      "bra": 8.21,
      "mar": 2.84,
      "hai": 0,
      "sco": 0,
      "usa": 1.21,
      "par": 0.05,
      "aus": 0.27,
      "tur": 0,
      "ger": 2.95,
      "cuw": 0,
      "civ": 0.08,
      "ecu": 0.4,
      "ned": 5.62,
      "jpn": 1.17,
      "swe": 0,
      "tun": 0,
      "bel": 4.59,
      "egy": 0.24,
      "irn": 0,
      "nzl": 0,
      "esp": 12.8,
      "cpv": 0.01,
      "ksa": 0,
      "uru": 0,
      "fra": 13.82,
      "sen": 0.1,
      "irq": 0,
      "nor": 0.35,
      "arg": 18.31,
      "alg": 0.13,
      "aut": 0.15,
      "jor": 0,
      "por": 4.25,
      "cod": 0,
      "uzb": 0,
      "col": 3.52,
      "eng": 14.68,
      "cro": 1.75,
      "gha": 0.01,
      "pan": 0
    },
    "possibleOpponents": {
      "mex": [],
      "rsa": [
        "can"
      ],
      "kor": [],
      "cze": [],
      "can": [
        "rsa"
      ],
      "bih": [
        "usa"
      ],
      "qat": [],
      "sui": [
        "alg"
      ],
      "bra": [
        "jpn"
      ],
      "mar": [
        "ned"
      ],
      "hai": [],
      "sco": [],
      "usa": [
        "bih"
      ],
      "par": [
        "ger"
      ],
      "aus": [
        "egy"
      ],
      "tur": [],
      "ger": [
        "par"
      ],
      "cuw": [],
      "civ": [
        "nor"
      ],
      "ecu": [
        "bel"
      ],
      "ned": [
        "mar"
      ],
      "jpn": [
        "bra"
      ],
      "swe": [
        "fra"
      ],
      "tun": [],
      "bel": [
        "ecu"
      ],
      "egy": [
        "aus"
      ],
      "irn": [],
      "nzl": [],
      "esp": [
        "aut"
      ],
      "cpv": [
        "arg"
      ],
      "ksa": [],
      "uru": [],
      "fra": [
        "swe"
      ],
      "sen": [],
      "irq": [],
      "nor": [
        "civ"
      ],
      "arg": [
        "cpv"
      ],
      "alg": [
        "sui"
      ],
      "aut": [
        "esp"
      ],
      "jor": [],
      "por": [
        "cro"
      ],
      "cod": [
        "eng"
      ],
      "uzb": [],
      "col": [
        "gha"
      ],
      "eng": [
        "cod"
      ],
      "cro": [
        "por"
      ],
      "gha": [
        "col"
      ],
      "pan": []
    },
    "bracketDepths": {
      "mex": 1,
      "rsa": 1,
      "kor": 1,
      "cze": 1,
      "can": 1,
      "bih": 1,
      "qat": 1,
      "sui": 1,
      "bra": 1,
      "mar": 1,
      "hai": 1,
      "sco": 1,
      "usa": 1,
      "par": 1,
      "aus": 1,
      "tur": 1,
      "ger": 1,
      "cuw": 1,
      "civ": 1,
      "ecu": 1,
      "ned": 1,
      "jpn": 1,
      "swe": 1,
      "tun": 1,
      "bel": 1,
      "egy": 1,
      "irn": 1,
      "nzl": 1,
      "esp": 1,
      "cpv": 1,
      "ksa": 1,
      "uru": 1,
      "fra": 1,
      "sen": 1,
      "irq": 1,
      "nor": 1,
      "arg": 1,
      "alg": 1,
      "aut": 1,
      "jor": 1,
      "por": 1,
      "cod": 1,
      "uzb": 1,
      "col": 1,
      "eng": 1,
      "cro": 1,
      "gha": 1,
      "pan": 1
    },
    "eliminatedTeamIds": [
      "kor",
      "cze",
      "qat",
      "hai",
      "sco",
      "tur",
      "cuw",
      "tun",
      "irn",
      "nzl",
      "ksa",
      "uru",
      "irq",
      "jor",
      "uzb",
      "pan"
    ]
  }
] as Snapshot[];

export const snapshotsByDay: Record<number, Snapshot> = Object.fromEntries(
  snapshots.map((snapshot) => [snapshot.day, snapshot]),
);
