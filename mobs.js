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
//              · brute (Gros brigand : saut qui étourdit + course) · chef (Chef des voleurs) · gardien (Gardien de la crypte)
//    immunePhysique  true = les attaques physiques ne lui font rien (seule la magie peut le tuer)
//    mres        résistance magique : réduit les dégâts magiques reçus (min. 1)
//    slowMs      le joueur touché est ralenti pendant ce temps (ms)
//              · dasher (fonce, mord, recule) · static (ne bouge pas, frappe si on est à côté)
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

  // ----- Grotte des voleurs (donjon) : PV × difficulté, dégâts × (1 + 0,4 × (difficulté − 1)) -----
  voleur: {                                    // plus rapide que le brigand, moins résistant, même attaque
    name: "Voleur", rarity: "commun",
    hp: 120, atk: 25, armor: 1, mres: 2, stepMs: 180, atkMs: 1400, xp: 8, gold: 3, kind: "chase",
    loot: [["bourse", 0.3], ["dague_brisee", 0.05]],
  },
  gros_brigand: {                              // mini-boss : lent mais très résistant, sa masse touche aussi autour de lui
    name: "Gros brigand", rarity: "rare",
    hp: 900, atk: 45, armor: 10, mres: 4, stepMs: 900, atkMs: 2400, xp: 80, gold: 25, kind: "brute", slam: true,
    // saute sur la zone du joueur (dégâts + étourdit) toutes les leapMs ; court (sprintStepMs) pendant sprintMs, toutes les sprintEvery
    leapMs: 9000, leapAtk: 40, leapRadius: 1, stunMs: 1500, sprintMs: 3000, sprintStepMs: 230, sprintEvery: 11000,
    loot: [["epee", 0.5], ["bouclier", 0.5], ["ceinture_brigand", 0.15]],
  },
  chef_voleurs: {                              // boss : mord puis recule ; charge en ligne toutes les 9 s ; enragé sous 50 % ; renforts à 50 % et 25 %
    name: "Chef des voleurs", rarity: "epique",
    hp: 1000, atk: 32, chargeAtk: 55, chargeMs: 9000, armor: 8, mres: 6, stepMs: 220, atkMs: 1600, fleeMs: 1200, fleeSteps: 3,
    howlMs: 13000, howlRange: 4, fearMs: 1800,  // hurlement du loup : les joueurs à 4 cases ou moins s'enfuient pendant 1,8 s
    xp: 300, gold: 100, kind: "chef",
    loot: [["dague_chef", 0.25], ["croc_loup_chef", 0.4]],
  },

  // ----- Crypte du cimetière (mini-donjon) -----
  squelette: {                                 // rapide et bien protégé contre les coups physiques
    name: "Squelette", rarity: "commun",
    hp: 160, atk: 28, armor: 12, mres: 3, stepMs: 220, atkMs: 1300, xp: 18, kind: "chase",
    loot: [["os_ancien", 0.35]],
  },
  chauve_souris: {                             // très rapide : mord puis s'envole un peu plus loin
    name: "Chauve-souris de crypte", rarity: "ordinaire",
    hp: 60, atk: 15, stepMs: 150, atkMs: 1200, xp: 6, kind: "dasher", fleeMs: 1100, fleeSteps: 3,
    loot: [["aile_chauve_souris", 0.25]],
  },
  gardien_crypte: {                            // mini-boss : grand coup sur 3 cases toutes les 6 s ; sous 50 % bouclier (physique ÷ 2) ; à 30 % 2 squelettes
    name: "Gardien de la crypte", rarity: "rare",
    hp: 1100, atk: 35, sweepAtk: 50, sweepMs: 6000, armor: 14, mres: 4, stepMs: 600, atkMs: 1800, xp: 150, gold: 50, kind: "gardien",
    loot: [["lame_gardien", 0.2], ["fleur_noire", 1]],
  },

  renard_neiges: {                             // Renard des neiges : comme le louveteau (mord quand on le frappe, puis s'enfuit), mais bien plus rapide et plus fort
    name: "Renard des neiges", rarity: "commun",
    hp: 260, atk: 38, armor: 4, mres: 3, stepMs: 160, atkMs: 1300, xp: 25, kind: "hitrun", fleeMs: 2500, fleeSteps: 6,
    loot: [["fourrure_renard", 0.1], ["cuir", 0.04]],
  },

  // ----- Terres des Gobelins -----
  loup: {                                      // Loup : comme un gros louveteau, mais il ne s'enfuit pas et frappe fort
    name: "Loup", rarity: "commun",
    hp: 320, atk: 42, armor: 6, mres: 3, stepMs: 230, atkMs: 1300, xp: 22, kind: "chase",
    loot: [["pelage_sombre", 0.2], ["dent_loup", 0.1]],
  },
  araignee: {                                  // Araignée géante : rapide, tisse des toiles (qui ralentissent), morsure qui empoisonne (dégâts magiques) et ralentit
    name: "Araignée géante", rarity: "commun",
    hp: 380, atk: 38, armor: 8, mres: 8, stepMs: 200, atkMs: 1400, xp: 28, kind: "chase", slowMs: 1500, poisonDps: 10, poisonMs: 3000, webs: true,
    loot: [["poison_araignee", 0.04], ["patte_velue", 0.25]],
  },
  // ----- Marais (Terres des Gobelins) -----
  slime: {                                     // Slime : lent, très résistant à la magie (mieux vaut le frapper à l'épée), ralentit le joueur qu'il touche
    name: "Slime", rarity: "commun",
    hp: 450, atk: 45, armor: 5, mres: 70, stepMs: 900, atkMs: 1600, xp: 30, kind: "chase", slowMs: 2500,
    loot: [["gel_hydro", 0.05]],
  },
  feu_follet: {                                // Feu follet : rapide, bondit sur le joueur et le brûle (burnDps dégâts par seconde pendant burnMs)
    name: "Feu follet", rarity: "rare",
    hp: 150, atk: 35, armor: 30, mres: 30, stepMs: 170, atkMs: 1500, xp: 35, kind: "dasher", fleeMs: 1200, fleeSteps: 3, burnDps: 8, burnMs: 3000,
    loot: [["poussiere_spectrale", 0.33], ["larme_fantomatique", 0.03]],
  },
  plante_carnivore: {                          // Plante carnivore : se cache sous une nymphéa lunaire (1 sur 2) ; ne bouge pas, mord si on est à côté
    name: "Plante carnivore", rarity: "commun",
    hp: 500, atk: 40, mres: 45, stepMs: 1000, atkMs: 1400, xp: 40, kind: "static",
    loot: [["nymphea_lunaire", 0.5]],
  },

  korygan: {                                   // Korygan : rapide, fonce sur le joueur, mord, puis recule d'un bond
    name: "Korygan", rarity: "commun",
    hp: 200, atk: 35, armor: 7, mres: 7, stepMs: 170, atkMs: 1500, xp: 12, kind: "dasher", fleeMs: 1300, fleeSteps: 3,
    loot: [["dague_brisee", 0.07], ["soulier_malicieux", 0.03]],
  },

  zombie: {                                    // Zombie : lent, mais ralentit le joueur qu'il frappe
    name: "Zombie", rarity: "ordinaire",
    hp: 350, atk: 25, armor: 15, mres: 4, stepMs: 1000, atkMs: 1800, xp: 15, kind: "chase", slowMs: 3000,
    loot: [["oeil_zombie", 0.07], ["chair_pourrie", 0.8]],
  },

  poisson: {                                   // Poisson sauteur : saute hors du lac, gigote sur la rive et frappe très vite (sans bouger)
    name: "Poisson sauteur", rarity: "ordinaire",
    hp: 300, atk: 1, armor: 25, mres: 4, stepMs: 1000, atkMs: 350, xp: 4, kind: "static",
    loot: [["ecaille_brillante", 0.01]],
  },

  spectre: {                                   // Spectre décevant : court sur le joueur comme un rat ; immunisé au physique, seule la magie le tue
    name: "Spectre décevant", rarity: "ordinaire",
    hp: 50, atk: 25, stepMs: 300, atkMs: 1400, xp: 7, kind: "chase", immunePhysique: true,
    loot: [["essence_maussade", 0.12]],
  },
};

// Où apparaissent les monstres : "colonne,ligne" de la zone  →  quels monstres, et combien au maximum en même temps
//   area (facultatif) = rectangle où ils restent (x, y, largeur, hauteur en cases)
//   rate (facultatif) = apparitions plus rapides (2 = deux fois plus vite) · nightRate / nightMax = pareil, mais la nuit
export const MONSTER_ZONES = {
  "1,1":  [{ type: "rat", max: 5 }],                                                     // Champs
  "1,0":  [{ type: "rat", max: 5 }],                                                     // Champs du père Castor
  "2,0":  [{ type: "louveteau", max: 3 }],                                               // Forêt
  "3,1":  [{ type: "louveteau", max: 3 }],
  "3,0":  [{ type: "fee", max: 2 }],
  "-2,2": [{ type: "fee", max: 3, rate: 2, nightMax: 5, nightRate: 4 }],                 // Embouchure (cercle de pierres) : 2× plus vite que la Forêt sombre, 4× la nuit (5 max)                                                     // Forêt sombre (rareté commune : apparaît plus rarement)                                               // Forêt (2e ligne)
  "2,2":  [{ type: "vache", max: 3, area: { x: 14, y: 10, w: 8, h: 4 } }],              // Pâturage rocailleux (enclos)
  "-3,0": [{ type: "rat", max: 5 }],                                                     // Champs (zone 2)
  "-1,0": [{ type: "louveteau", max: 3 }],                                               // Forêt (zone 2)
  "-4,1": [{ type: "golem", max: 2 }],                                                   // Terre rocheuse
  "-4,2": [{ type: "spectre", max: 3 }],                                                 // Vieux château
  "-3,-3": [{ type: "korygan", max: 3 }],                                                // Forêt de pin
  "-4,-1": [{ type: "zombie", max: 3 }],                                                 // Cimetière ancien
  "-4,-3": [{ type: "zombie", max: 3 }],                                                 // Tour des cauchemars
  "-2,-3": [{ type: "renard_neiges", max: 3 }],                                          // Forêt enneigée
  "-1,-3": [{ type: "renard_neiges", max: 3 }],                                          // Forêt enneigée (cabane)
  "-1,-2": [{ type: "renard_neiges", max: 3 }],                                          // Cole de Faimur
  "-1,-1": [{ type: "vache", max: 3, area: { x: 3, y: 11, w: 6, h: 3 } },               // Lac profond : champ de vaches
            { type: "poisson", max: 3, nearWater: true }],                               //   et poissons sauteurs sur la rive
  "-3,2": [{ type: "spectre", max: 3, area: { x: 1, y: 1, w: 13, h: 14 } }],              // Campement désert : seulement la partie gauche (à gauche de la falaise)
  "-1,1": [{ type: "vache", max: 3, area: { x: 14, y: 10, w: 8, h: 4 } }],              // Pâturage du canal (enclos)
  "-2,3": [{ type: "loup", max: 3 }, { type: "fee", max: 2, nightMax: 4, nightRate: 2 }],  // Bois ancien (plus de fées la nuit)
  "-2,5": [{ type: "loup", max: 3 }],                                                    // Forêt (sud)
  "-3,3": [{ type: "araignee", max: 4 }],                                                // Antre des araignées
  "-1,3": [{ type: "slime", max: 3 }, { type: "feu_follet", max: 2 }],                   // Marais boueux
  "-2,4": [{ type: "slime", max: 3 }, { type: "feu_follet", max: 2 }],                   // Marais boueux (sud)
  "-1,4": [{ type: "slime", max: 3 }, { type: "feu_follet", max: 2 }],                   // Marais profond
};

// Cases où se tiennent les 3 brigands dans la cachette [x, y]
export const BRIGAND_SPOTS = [[8, 5], [15, 10], [16, 6]];
