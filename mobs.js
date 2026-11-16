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
//              · ranged (tireur : se met à portée, tire, puis recule — utilise range, fleeMs, fleeSteps ; atk = dégâts MAGIQUES par missile)
//              · roller (golem : charge son attaque, puis roule en ligne droite sur le joueur ou jusqu'à un obstacle)
//    immunePhysique  true = les attaques physiques ne lui font rien (seule la magie peut le tuer)
//    gold      pièces d'or toujours lâchées (facultatif)
//    loot      [objet, chance]  ex. ["cuir", 0.07] = 7 %   (plusieurs objets séparés par | = un seul tiré au hasard)
//
//  Le contour coloré autour d'un monstre = sa rareté : ordinaire (gris) · commun (vert) · rare (bleu) · epique (violet)
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
    name: "Vache", rarity: "ordinaire",
    hp: 800, atk: 20, stepMs: 420, atkMs: 1800, xp: 7, kind: "passive",
    loot: [["corne", 0.02], ["cuir", 0.07]],
  },

  brigand: {                                   // les 3 brigands de la cachette (apparaissent à des places fixes)
    name: "Brigand", rarity: "commun",
    hp: 200, atk: 25, armor: 3, stepMs: 280, atkMs: 1400, xp: 10, kind: "sight", sight: 7,
    gold: 5,
    loot: [["epee", 0.1], ["bouclier", 0.1]],     // Épée rouillée · Bouclier en bois (10 % chacun : à toi de régler)
  },

  fee: {                                       // Fée ténébreuse : tire 3 petits missiles violets, puis recule
    name: "Fée ténébreuse", rarity: "commun",
    hp: 80, atk: 14, stepMs: 300, atkMs: 2800, xp: 7, kind: "ranged", range: 4, missiles: 3, fleeMs: 1800, fleeSteps: 3,
    loot: [["poussiere_jaune|poussiere_rose|poussiere_bleue|poussiere_verte", 0.75], ["aile_fee", 0.05]],
  },

  golem: {                                     // Mini golem en pierre : charge, puis roule en ligne droite ; s'assomme contre un obstacle
    name: "Mini golem en pierre", rarity: "commun",
    hp: 400, atk: 100, armor: 25, stepMs: 650, atkMs: 1800, xp: 20, kind: "roller", windMs: 1000, rollMs: 75, stunMs: 2200, range: 7,
    loot: [["pierre", 0.8]],
  },

  spectre: {                                   // Spectre décevant : court sur le joueur comme un rat ; immunisé au physique, seule la magie le tue
    name: "Spectre décevant", rarity: "ordinaire",
    hp: 50, atk: 25, stepMs: 300, atkMs: 1400, xp: 7, kind: "chase", immunePhysique: true,
    loot: [["essence_maussade", 0.12]],
  },
};

// Où apparaissent les monstres : "colonne,ligne" de la zone  →  quels monstres, et combien au maximum en même temps
//   area (facultatif) = rectangle où ils restent (x, y, largeur, hauteur en cases)
export const MONSTER_ZONES = {
  "1,1":  [{ type: "rat", max: 5 }],                                                     // Champs
  "1,0":  [{ type: "rat", max: 5 }],                                                     // Champs du père Castor
  "2,0":  [{ type: "louveteau", max: 3 }],                                               // Forêt
  "3,1":  [{ type: "louveteau", max: 3 }],
  "3,0":  [{ type: "fee", max: 2 }],                                                     // Forêt sombre (rareté commune : apparaît plus rarement)                                               // Forêt (2e ligne)
  "2,2":  [{ type: "vache", max: 3, area: { x: 14, y: 10, w: 8, h: 4 } }],              // Pâturage rocailleux (enclos)
  "-3,0": [{ type: "rat", max: 5 }],                                                     // Champs (zone 2)
  "-1,0": [{ type: "louveteau", max: 3 }],                                               // Forêt (zone 2)
  "-4,1": [{ type: "golem", max: 2 }],                                                   // Terre rocheuse
  "-4,2": [{ type: "spectre", max: 3 }],                                                 // Vieux château
  "-1,1": [{ type: "vache", max: 3, area: { x: 14, y: 10, w: 8, h: 4 } }],              // Pâturage du canal (enclos)
};

// Cases où se tiennent les 3 brigands dans la cachette [x, y]
export const BRIGAND_SPOTS = [[8, 5], [15, 10], [16, 6]];
