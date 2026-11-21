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
//              · diver (vole, plonge, se repose) · burrow (sous le sable) · skittish (s'enfuit, n'attaque pas)
//              · gobshoot (tireurs gobelins : tirs esquivables) · gobthief (vole de l'or) · trollboss (Kragg et son troll)
//    selfDmg   PV perdus par le monstre à chaque attaque · sleep  (passif) dort sans bouger · spitMs/spitRange/spitAtk  crachat de venin
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
  gardien_crypte: {                            // mini-boss : frappe le sol toutes les 5,5 s (onde de choc de 4 cases tout autour) ; sous 50 % bouclier (physique ÷ 2) ; à 30 % 2 squelettes
    name: "Gardien de la crypte", rarity: "rare",
    hp: 1500, atk: 42, sweepAtk: 70, sweepMs: 5500, armor: 16, mres: 6, stepMs: 560, atkMs: 1700, xp: 180, gold: 60, kind: "gardien", slowMs: 1200,
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
  plante_carnivore: {                          // Plante carnivore : se cache sous une nymphéa lunaire (1 sur 2) ; ne bouge pas, mord jusqu’à 2 cases (tige)
    name: "Plante carnivore", rarity: "commun",
    hp: 500, atk: 40, mres: 45, stepMs: 1000, atkMs: 1400, xp: 40, kind: "static", reach: 2, firstMult: 2,   // tige : frappe à 2 cases ; 1re morsure ×2
    loot: [["nymphea_lunaire", 0.5]],
  },

  korygan: {                                   // Korygan : rapide, fonce sur le joueur, mord, puis recule d'un bond
    name: "Korygan", rarity: "commun",
    hp: 200, atk: 35, armor: 7, mres: 7, stepMs: 170, atkMs: 1500, xp: 12, kind: "dasher", fleeMs: 1300, fleeSteps: 3,
    loot: [["dague_brisee", 0.07], ["soulier_malicieux", 0.05]],
  },

  zombie: {                                    // Zombie : lent, mais ralentit le joueur qu'il frappe
    name: "Zombie", rarity: "ordinaire",
    hp: 350, atk: 25, armor: 15, mres: 4, stepMs: 1000, atkMs: 1800, xp: 15, kind: "chase", slowMs: 3000,
    loot: [["oeil_zombie", 0.07], ["chair_pourrie", 0.8]],
  },

  // ----- Terres désolées (accessibles tôt, mais dangereuses : à affronter après un premier donjon) -----
  zombie_desseche: {                           // Zombie desséché : plus solide et plus fort que le zombie, mais il perd des PV à chaque attaque (jamais sous 1 PV)
    name: "Zombie desséché", rarity: "commun",
    hp: 600, atk: 50, armor: 20, mres: 6, stepMs: 800, atkMs: 1800, xp: 30, kind: "chase", slowMs: 3000, selfDmg: 25,
    loot: [["oeil_zombie", 0.07], ["chair_pourrie", 0.8]],
  },
  charognard: {                                // Charognard : vole au-dessus des obstacles (intouchable en vol), plonge sur le joueur puis se repose 1 s au sol
    name: "Charognard", rarity: "commun",
    hp: 180, atk: 70, armor: 4, mres: 4, stepMs: 260, atkMs: 1500, xp: 35, kind: "diver", diveEvery: 3500, windMs: 800, diveStepMs: 70, restMs: 1100,
    loot: [["plume_charognard", 0.15]],
  },
  // ----- Désert de Kechmara -----
  chameau: {                                   // Chameau : n'attaque jamais, s'enfuit quand on le frappe
    name: "Chameau", rarity: "ordinaire",
    hp: 500, atk: 0, stepMs: 520, atkMs: 9999, xp: 5, kind: "skittish", fleeStepMs: 230, fleeMs: 6000,
    loot: [["cuir", 0.07]],
  },
  ver_sables: {                                // Ver des sables : invisible sous le sable, sort à côté du joueur (le sable ondule 0,6 s avant), reste dehors 3 s
    name: "Ver des sables", rarity: "commun",
    hp: 300, atk: 55, armor: 10, mres: 10, stepMs: 420, atkMs: 1200, xp: 32, kind: "burrow", emergeMs: 600, outMs: 3000,
    loot: [["glande_corrosive", 0.05]],
  },
  scorpion: {                                  // Scorpion des dunes : rapide, piqûre empoisonnée
    name: "Scorpion des dunes", rarity: "commun",
    hp: 280, atk: 40, armor: 12, mres: 5, stepMs: 170, atkMs: 1300, xp: 30, kind: "chase", poisonDps: 8, poisonMs: 4000,
    loot: [["dard_scorpion", 0.07], ["pince_scorpion", 0.03]],
  },
  pillard: {                                   // Pillard du désert (épée) : attaque à vue. À la Frontière de sable, ils attaquent aussi les gardes
    name: "Pillard du désert", rarity: "commun",
    hp: 450, atk: 50, armor: 10, mres: 6, stepMs: 240, atkMs: 1400, xp: 40, gold: 8, kind: "sight", sight: 6,
    loot: [["epee_courte", 0.06], ["arc_desert", 0.12]],
  },
  pillard_archer: {                            // Pillard du désert (arc) : tire des flèches (dégâts physiques) à 5 cases, puis recule
    name: "Pillard archer", rarity: "commun",
    hp: 320, atk: 45, armor: 6, mres: 6, stepMs: 260, atkMs: 2600, xp: 40, gold: 8, kind: "ranged", range: 5, missiles: 1, arrow: true, fleeMs: 1500, fleeSteps: 2,
    loot: [["epee_courte", 0.06], ["arc_desert", 0.12]],
  },
  scarabee: {                                  // Scarabée géant : dort, n'attaque que si on le frappe. Très résistant
    name: "Scarabée géant", rarity: "commun",
    hp: 1500, atk: 60, armor: 30, mres: 20, stepMs: 600, atkMs: 1700, xp: 30, kind: "passive", sleep: true,
    loot: [["carapace_doree", 0.05]],
  },
  cobra: {                                     // Cobra géant : très dangereux, résiste à la magie, mord (poison) et crache du venin à distance
    name: "Cobra géant", rarity: "rare",
    hp: 2500, atk: 90, armor: 15, mres: 60, stepMs: 330, atkMs: 1600, xp: 250, gold: 60, kind: "chase", poisonDps: 15, poisonMs: 5000,
    spitMs: 4500, spitRange: 5, spitAtk: 60,
    loot: [["ecaille_cobra", 0.08], ["oeil_hypnotique", 0.02]],
  },

  // ----- Mine gobeline (donjon de 15 salles) -----
  gob_guerrier: {                              // Gobelin guerrier : fonce et frappe
    name: "Gobelin guerrier", rarity: "commun",
    hp: 380, atk: 45, armor: 12, mres: 6, stepMs: 320, atkMs: 1300, xp: 40, gold: 6, kind: "chase",
    loot: [["cuir", 0.06], ["charbon", 0.05]],
  },
  gob_archer: {                                // Gobelin archer : tire sur ta case + 3 cases proches au hasard (on peut esquiver en bougeant), puis recule
    name: "Gobelin archer", rarity: "commun",
    hp: 260, atk: 40, armor: 6, mres: 6, stepMs: 300, atkMs: 2200, xp: 38, gold: 5, kind: "gobshoot", shot: "arrow", range: 5, volley: 3,   // 1 flèche sur ta case + 3 sur des cases proches au hasard
    loot: [["fleche", 0.4]],
  },
  gob_shaman: {                                // Gobelin shaman : soigne les autres gobelins et lance des boules de feu (esquivables)
    name: "Gobelin shaman", rarity: "commun",
    hp: 300, atk: 35, armor: 4, mres: 20, stepMs: 340, atkMs: 2600, xp: 45, gold: 8, kind: "gobshoot", shot: "fire", range: 5, healMs: 5000, heal: 60,
    loot: [["parchemin_soin", 0.03], ["petite_potion", 0.1]],
  },
  gob_loup: {                                  // Gobelin monté sur loup : charge en ligne droite, s'assomme contre un mur
    name: "Gobelin monté", rarity: "commun",
    hp: 520, atk: 55, armor: 10, mres: 6, stepMs: 380, atkMs: 1300, xp: 50, gold: 6, kind: "roller", windMs: 650, rollMs: 90, stunMs: 1100, range: 6,
    loot: [["pelage_sombre", 0.2], ["cuir", 0.08]],
  },
  gob_bombe: {                                 // Gobelin bombardier : lance une bombe (cercle rouge 1 s avant l'explosion, 3 × 3 cases)
    name: "Gobelin bombardier", rarity: "commun",
    hp: 220, atk: 70, armor: 4, mres: 6, stepMs: 320, atkMs: 3500, xp: 42, gold: 6, kind: "gobshoot", shot: "bomb", range: 5,
    loot: [["charbon", 0.2]],
  },
  gob_bouclier: {                              // Gobelin à bouclier : bloque 80 % des coups venant de face (il se retourne lentement : contourne-le)
    name: "Gobelin à bouclier", rarity: "commun",
    hp: 600, atk: 40, armor: 18, mres: 10, stepMs: 420, atkMs: 1500, xp: 48, gold: 6, kind: "chase", shield: true,
    loot: [["charbon", 0.08]],
  },
  gob_voleur: {                                // Gobelin voleur : te vole 10 à 30 or puis s'enfuit (tu les récupères en le battant)
    name: "Gobelin voleur", rarity: "commun",
    hp: 200, atk: 30, armor: 4, mres: 4, stepMs: 200, atkMs: 1000, xp: 35, gold: 4, kind: "gobthief", steal: [10, 30],
    loot: [["bourse", 0.5]],
  },
  grok: {                                      // mini-boss : Grok le Briseur (frappe le sol : onde de choc ; à 30 % appelle 2 guerriers)
    name: "Grok le Briseur", rarity: "epique",
    hp: 2200, atk: 55, sweepAtk: 75, sweepMs: 6000, armor: 18, mres: 8, stepMs: 520, atkMs: 1600, xp: 300, gold: 80, kind: "gardien", noShield: true,
    summonType: "gob_guerrier", summonMsg: "📯 Grok rugit : deux gobelins guerriers accourent !",
    loot: [["charbon", 0.6], ["petite_potion", 0.5]],
  },
  zulgor: {                                    // mini-boss : Zul'gor le shaman (soins + boules de feu qui laissent une traînée brûlante 6 s)
    name: "Zul'gor le shaman", rarity: "epique",
    hp: 1600, atk: 50, armor: 8, mres: 30, stepMs: 380, atkMs: 2000, xp: 300, gold: 80, kind: "gobshoot", shot: "fire", trail: true, range: 6, healMs: 6000, heal: 120, healSelf: true, selfHealMul: 0.75,   // sur lui-même : 75 % du soin
    loot: [["parchemin_soin", 1]],
  },
  troll_kragg: {                               // boss (phase 1) : le troll de Kragg charge et frappe le sol, Kragg tire depuis son dos ; sous 40 % : phase 2
    name: "Kragg et son troll", rarity: "legendaire",
    hp: 3500, atk: 70, armor: 20, mres: 12, stepMs: 480, atkMs: 1700, xp: 500, gold: 150, kind: "trollboss", windMs: 800, rollMs: 110, stunMs: 1500, range: 7,
    sweepAtk: 80, sweepMs: 7000, arrowMs: 2500, arrowAtk: 45,
    quakeMs: 13000, quakeStun: 1500,            // frappe le sol toutes les 13 s : tous les joueurs de la salle sont étourdis 1,5 s
    loot: [],
  },
  kragg: {                                     // boss (phase 2) : Kragg à pied, rapide, lance des bombes
    name: "Roi gobelin Kragg", rarity: "legendaire",
    hp: 1500, atk: 65, armor: 14, mres: 14, stepMs: 260, atkMs: 1200, xp: 700, gold: 250, kind: "gobshoot", shot: "bomb", range: 5, shotMs: 3500, melee: true,
    loot: [["couronne_gobelin", 1], ["massue_troll", 0.25]],
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
  "-5,-3": [{ type: "zombie_desseche", max: 3 }, { type: "charognard", max: 2 }],        // Terre désolée (nord)
  "-5,-2": [{ type: "zombie_desseche", max: 3 }, { type: "charognard", max: 2 }],        // Terre désolée (sud)
  "-8,-3": [{ type: "chameau", max: 2 }],                                                // Oasis
  "-8,-2": [{ type: "ver_sables", max: 2 }, { type: "scorpion", max: 2 }, { type: "scarabee", max: 2 }, { type: "chameau", max: 2 }],   // Grand désert
  "-7,-2": [{ type: "ver_sables", max: 2 }, { type: "scorpion", max: 2 }, { type: "scarabee", max: 2 }, { type: "chameau", max: 2 }],   // Entrée du désert
  "-8,-1": [{ type: "scarabee", max: 2 }, { type: "cobra", max: 1, rate: 0.25 }],      // Village en ruine (le cobra revient lentement)
  "-7,-3": [{ type: "pillard", max: 2 }, { type: "pillard_archer", max: 1 }],           // Grotte du désert
  "-6,-3": [{ type: "pillard", max: 2 }, { type: "pillard_archer", max: 1 }],           // Mont sableux
  "-5,-1": [{ type: "chameau", max: 1, area: { x: 15, y: 1, w: 8, h: 8 } }],           // Champs de dattes
  "-6,-2": [],                                                                            // Frontière de sable : les pillards arrivent par vagues (voir index.html)
  "-6,-1": [{ type: "chameau", max: 3 }],                                                // KechmaraTown : des chameaux se promènent en ville
};

// Cases où se tiennent les 3 brigands dans la cachette [x, y]
export const BRIGAND_SPOTS = [[8, 5], [15, 10], [16, 6]];
