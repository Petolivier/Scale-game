// =====================================================================
//  MOBS.JS — tous les monstres du jeu au même endroit
//  À mettre dans le même dossier que index.html (sur GitHub).
//  Pour changer un monstre, modifie simplement les chiffres ci-dessous.
// =====================================================================
//
//  Légende des champs :
//    name      nom affiché
//    rarity    ordinaire / commun / rare / epique / legendaire / ultime  (règle aussi la vitesse d'apparition)
//    hp        points de vie            atk   dégâts d'une attaque
//    armor     armure physique (facultatif)
//    stepMs    ms entre deux pas (plus petit = plus rapide)       atkMs   ms entre deux attaques
//    xp        XP gagnée en le tuant
//    kind      comportement : chase (poursuit) · hitrun (frappe et fuit) · passive (n'attaque que si on le frappe) · sight (attaque à vue)
//    loot      [objet, chance]  ex. ["cuir", 0.07] = 7 %
// =====================================================================

// Délai (en ms) entre deux apparitions, selon la rareté du monstre
export const SPAWN_MS = { ordinaire: 7000, commun: 14000, rare: 28000, epique: 60000, legendaire: 120000, ultime: 240000 };

export const MONSTER_TYPES = {

  rat: {
    name: "Rat", rarity: "ordinaire",
    hp: 50, atk: 10, stepMs: 320, atkMs: 1400, xp: 1, kind: "chase",
    loot: [["queue_rat", 0.07], ["peau_rat", 0.15]],
  },

  louveteau: {
    name: "Louveteau", rarity: "ordinaire",
    hp: 100, atk: 18, stepMs: 260, atkMs: 1500, xp: 5, kind: "hitrun", fleeMs: 3000, fleeSteps: 5,
    loot: [["os_louveteau", 0.02], ["dent_loup", 0.05]],
  },

  vache: {
    name: "Vache", rarity: "commun",
    hp: 800, atk: 20, stepMs: 420, atkMs: 1800, xp: 7, kind: "passive",
    loot: [["corne", 0.02], ["cuir", 0.07]],
  },

  brigand: {                                   // les 3 brigands de la cachette (apparaissent à des places fixes)
    name: "Brigand", rarity: "rare",
    hp: 200, atk: 25, armor: 3, stepMs: 280, atkMs: 1400, xp: 0, kind: "sight", sight: 7,
    loot: [],
  },
};

// Où apparaissent les monstres : "colonne,ligne" de la zone  →  quels monstres, et combien au maximum en même temps
//   area (facultatif) = rectangle où ils restent (x, y, largeur, hauteur en cases)
export const MONSTER_ZONES = {
  "1,1":  [{ type: "rat", max: 5 }],                                                     // Champs
  "1,0":  [{ type: "rat", max: 5 }],                                                     // Champs du père Castor
  "2,0":  [{ type: "louveteau", max: 3 }],                                               // Forêt
  "3,1":  [{ type: "louveteau", max: 3 }],                                               // Forêt (2e ligne)
  "2,2":  [{ type: "vache", max: 3, area: { x: 14, y: 10, w: 8, h: 4 } }],              // Pâturage rocailleux (enclos)
  "-1,1": [{ type: "vache", max: 3, area: { x: 14, y: 10, w: 8, h: 4 } }],              // Pâturage du canal (enclos)
};

// Cases où se tiennent les 3 brigands dans la cachette [x, y]
export const BRIGAND_SPOTS = [[8, 5], [15, 10], [16, 6]];
