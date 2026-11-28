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

  lievre: {                                    // Lièvre blanc (Montagnes glacées) : n'attaque jamais, détale quand on le frappe… et les renards le chassent
    name: "Lièvre blanc", rarity: "ordinaire",
    hp: 120, atk: 0, stepMs: 380, atkMs: 9999, xp: 6, kind: "skittish", fleeStepMs: 170, fleeMs: 4000,
    loot: [["patte_lievre", 0.25], ["fourrure_renard", 0.05]],
  },

  // ----- Montagnes glacées (avant le Tombeau d'Anubis en difficulté : ça pique !) -----
  loup_neiges: {                               // Loup des neiges : chasse en meute (par 2), sa morsure glace (le thermomètre descend)
    name: "Loup des neiges", rarity: "commun",
    hp: 780, atk: 71, armor: 10, mres: 8, stepMs: 210, atkMs: 1250, xp: 60, kind: "chase", charge: 1.5, fastStepMs: 160, chill: 6,
    loot: [["croc_givre", 0.15], ["fourrure_renard", 0.06]],
  },
  ours_hiver: {                                // Ours d'hiver : énorme et lent, sa première attaque est une charge dévastatrice
    name: "Ours d'hiver", rarity: "rare",
    hp: 1880, atk: 109, armor: 18, mres: 8, stepMs: 380, atkMs: 1700, xp: 150, kind: "chase", charge: 1.8, fastStepMs: 240,
    loot: [["griffe_glace", 0.2], ["cuir", 0.3], ["graisse_ours", 0.25]],
  },
  elan: {                                      // Élan : paisible… mais si on le frappe, il fonce avec ses bois
    name: "Élan", rarity: "commun",
    hp: 1380, atk: 92, armor: 12, mres: 6, stepMs: 300, atkMs: 1600, xp: 69, kind: "passive",
    loot: [["bois_elan", 0.2], ["cuir", 0.2]],
  },
  aigle_cimes: {                               // Aigle des cimes : comme le faucon, en bien plus fort (le sifflet de chasse l'attrape en vol)
    name: "Aigle des cimes", rarity: "commun",
    hp: 520, atk: 80, armor: 6, mres: 6, stepMs: 220, atkMs: 1300, xp: 65, kind: "diver", diveEvery: 4200, windMs: 750, diveStepMs: 65, restMs: 1500,
    loot: [["plume_aigle", 0.25], ["serre_faucon", 0.08]],
  },
  golem_glace: {                               // Golem de glace : charge et roule ; son choc glace (ralentit, le thermomètre descend)
    name: "Golem de glace", rarity: "rare",
    hp: 1620, atk: 150, armor: 32, mres: 6, stepMs: 600, atkMs: 1800, xp: 138, kind: "roller", windMs: 900, rollMs: 70, stunMs: 2000, range: 7, slowMs: 1500, chill: 10,
    loot: [["coeur_glace", 0.1], ["quartz_bleu", 0.3]],
  },
  esprit_blizzard: {                           // Esprit du blizzard : tourbillon de neige, mord puis s'éloigne ; il aspire ta chaleur
    name: "Esprit du blizzard", rarity: "rare",
    hp: 650, atk: 67, armor: 2, mres: 30, stepMs: 190, atkMs: 1200, xp: 94, kind: "dasher", fleeMs: 1000, fleeSteps: 3, physMul: 0.6, chill: 14, slowMs: 1200,
    loot: [["essence_blizzard", 0.15]],
  },
  yeti: {                                      // Yéti : bondit sur toi (zone rouge : écarte-toi !), puis court ; ses coups touchent autour de lui
    name: "Yéti", rarity: "epique",
    hp: 4000, atk: 138, armor: 20, mres: 12, stepMs: 420, atkMs: 1700, xp: 400, kind: "brute", slam: true, chill: 10,
    leapMs: 8000, leapAtk: 110, leapRadius: 1, stunMs: 1200, sprintMs: 2600, sprintStepMs: 200, sprintEvery: 10000, sprintMsg: "💨 Le Yéti se met à courir en rugissant !",
    loot: [["fourrure_yeti", 0.6], ["griffe_glace", 0.3]],
  },
  draugr: {                                    // Draugr : mort-vivant viking, lent mais cuirassé ; plus nombreux la nuit
    name: "Draugr", rarity: "commun",
    hp: 950, atk: 85, armor: 22, mres: 6, stepMs: 330, atkMs: 1450, xp: 75, kind: "chase", stunHit: 600,
    loot: [["os_ancien", 0.3], ["hache_viking", 0.012], ["piece_viking", 0.25]],
  },
  ours_polaire: {                              // Ours polaire : le roi de la banquise
    name: "Ours polaire", rarity: "rare",
    hp: 2380, atk: 121, armor: 16, mres: 10, stepMs: 340, atkMs: 1600, xp: 188, kind: "chase", charge: 2, fastStepMs: 220, chill: 6,
    loot: [["griffe_glace", 0.25], ["graisse_ours", 0.35], ["fourrure_yeti", 0.05]],
  },
  mammouth: {                                  // Mammouth laineux : comme une vache (paisible tant qu'on ne le frappe pas)… mais ÉNORME. Taille au hasard (2,6 à 4,6 m)
    name: "Mammouth laineux", rarity: "rare",
    hp: 3250, atk: 132, armor: 20, mres: 8, stepMs: 520, atkMs: 1900, xp: 250, kind: "passive", slam: true, sizeMin: 2.6, sizeMax: 4.6,
    loot: [["defense_mammouth", 0.25], ["laine_mammouth", 0.6]],
  },
  wendigo: {                                   // Wendigo : ne sort que la nuit ; son cri glace le sang (tu t'enfuis), puis il fonce
    name: "Wendigo", rarity: "epique",
    hp: 3500, atk: 144, armor: 14, mres: 18, stepMs: 240, atkMs: 1300, xp: 425, kind: "chase", charge: 1.6, fastStepMs: 150, chill: 12,
    screamMs: 11000, screamFear: 1600, screamRange: 4,
    loot: [["crane_wendigo", 0.5], ["essence_corruption", 0.03]],
  },
  geant_givre: {                               // Géant de givre (mini-boss du Mont maudit) : onde de choc glacée, bouclier de glace sous 50 %, golems à 30 %
    name: "Géant de givre", rarity: "epique",
    hp: 8750, atk: 161, sweepAtk: 120, sweepMs: 6500, armor: 26, mres: 16, stepMs: 520, atkMs: 1800, xp: 1125, kind: "gardien", slowMs: 1600, chill: 12,
    summonType: "golem_glace", summonMsg: "🧊 Le Géant de givre frappe le sol : deux golems de glace se dressent !",
    shieldMsg: "🧊 Le Géant de givre se couvre de glace : les coups physiques font moitié moins mal… la magie passe !",
    loot: [["coeur_givre_geant", 1], ["fourrure_yeti", 0.5]],
  },
  esprit_lac: {                                // Esprit du lac : n'apparaît dans la Clairière gelée que la NUIT, pendant une AURORE BORÉALE
    name: "Esprit du lac", rarity: "epique",
    hp: 900, atk: 66, armor: 4, mres: 25, stepMs: 280, atkMs: 2400, xp: 180, kind: "ranged", range: 4, missiles: 3, fleeMs: 1500, fleeSteps: 3,
    loot: [["larme_aurore", 0.4]],
  },
  // ----- L'arène de la Forteresse viking -----
  champion_viking: {                           // Hrolf, le champion de l'arène : bondit, court, frappe tout autour de lui
    name: "Hrolf le champion", rarity: "epique",
    hp: 4200, atk: 110, armor: 22, mres: 12, stepMs: 400, atkMs: 1500, xp: 0, kind: "brute", slam: true,
    leapMs: 7000, leapAtk: 100, leapRadius: 1, stunMs: 1200, sprintMs: 2500, sprintStepMs: 190, sprintEvery: 9000, sprintMsg: "💨 Hrolf charge en hurlant !",
    loot: [],
  },
  jarl: {                                      // le Jarl Thorvald : onde de choc, bouclier sous 50 %, deux berserkers à 30 %
    name: "Jarl Thorvald", rarity: "legendaire",
    hp: 6500, atk: 125, sweepAtk: 110, sweepMs: 6000, armor: 26, mres: 16, stepMs: 380, atkMs: 1500, xp: 0, kind: "gardien", slowMs: 1000,
    summonType: "berserker", summonMsg: "📯 Le Jarl souffle dans son cor : deux berserkers sautent dans l'arène !",
    shieldMsg: "🛡️ Le Jarl lève son bouclier runique : les coups physiques font moitié moins mal… la magie passe !",
    loot: [],
  },
  berserker: {                                 // Berserker : rapide, frappe deux fois
    name: "Berserker", rarity: "rare",
    hp: 700, atk: 60, armor: 8, mres: 4, stepMs: 200, atkMs: 1200, xp: 0, kind: "chase", doubleHit: true,
    loot: [],
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
    hp: 2500, atk: 90, armor: 15, mres: 60, stepMs: 330, atkMs: 1600, xp: 250, kind: "chase", poisonDps: 15, poisonMs: 5000,
    spitMs: 4500, spitRange: 5, spitAtk: 60,
    loot: [["ecaille_cobra", 0.08], ["oeil_hypnotique", 0.02]],
  },

  // ----- Repaire des Sables (donjon de 15 salles, Grotte du désert) -----
  brigand_cimeterre: {                         // Brigand au cimeterre : deux coups rapides d'affilée, puis une pause
    name: "Brigand au cimeterre", rarity: "commun",
    hp: 860, atk: 58, armor: 14, mres: 8, stepMs: 260, atkMs: 1700, xp: 74, gold: 10, kind: "chase", doubleHit: true,
    loot: [["foulard_sable", 0.25], ["bourse", 0.12], ["epee_courte", 0.04]],
  },
  lanceur_couteaux: {                          // Lanceur de couteaux : 3 couteaux sur ta case et autour, puis il recule
    name: "Lanceur de couteaux", rarity: "commun",
    hp: 600, atk: 50, armor: 8, mres: 8, stepMs: 280, atkMs: 2500, xp: 70, gold: 9, kind: "gobshoot", shot: "knife", range: 5, volley: 2,
    loot: [["foulard_sable", 0.25], ["bourse", 0.12]],
  },
  brigand_fumigene: {                          // Brigand fumigène : disparaît dans la fumée et réapparaît dans ton dos
    name: "Brigand fumigène", rarity: "commun",
    hp: 660, atk: 60, armor: 10, mres: 10, stepMs: 280, atkMs: 1500, xp: 72, gold: 10, kind: "chase", blinkMs: 6500,
    loot: [["foulard_sable", 0.25], ["bourse", 0.12]],
  },
  porteur_jarres: {                            // Porteur de jarres : lance des jarres d'huile, la flaque s'enflamme
    name: "Porteur de jarres", rarity: "commun",
    hp: 720, atk: 56, armor: 10, mres: 8, stepMs: 320, atkMs: 3200, xp: 72, gold: 10, kind: "gobshoot", shot: "jar", range: 5,
    loot: [["foulard_sable", 0.25], ["bourse", 0.12]],
  },
  dresseur_scorpions: {                        // Dresseur de scorpions : appelle 2 scorpions toutes les 10 s (4 au maximum)
    name: "Dresseur de scorpions", rarity: "rare",
    hp: 900, atk: 54, armor: 10, mres: 10, stepMs: 300, atkMs: 1600, xp: 90, gold: 14, kind: "chase", summonMs: 10000, summonType: "scorpion", summonMax: 4, summonN: 2,
    summonMsg: "🦂 Le dresseur siffle : des scorpions sortent du sable !",
    loot: [["foulard_sable", 0.3], ["dard_scorpion", 0.2], ["pince_scorpion", 0.1]],
  },
  garde_tresor: {                              // Garde du trésor : bouclier de cuivre (de face, il bloque presque tout)
    name: "Garde du trésor", rarity: "rare",
    hp: 1150, atk: 64, armor: 26, mres: 12, stepMs: 420, atkMs: 1600, xp: 95, gold: 16, kind: "chase", shield: true,
    loot: [["foulard_sable", 0.3], ["bourse", 0.25]],
  },
  kassim: {                                    // mini-boss : Kassim l'Œil de faucon — flèches, tir chargé en ligne, charognards à 66 % et 33 %
    name: "Kassim l'Œil de faucon", rarity: "epique",
    hp: 3400, atk: 58, armor: 14, mres: 12, stepMs: 300, atkMs: 2000, xp: 420, gold: 90, kind: "kassim", shot: "arrow", range: 6, volley: 2,
    chargedMs: 7000, chargedAtk: 105, windMs: 950, summonMsg: "🦅 Kassim siffle : deux charognards fondent du plafond !",
    loot: [["arc_kassim", 0.35], ["plume_charognard", 1], ["foulard_sable", 1]],
  },
  zarkan: {                                    // boss : Zarkan, le Roi des Sables — charges en ligne, tourbillon, sable (aveugle), tempête, jarres enflammées
    name: "Zarkan, le Roi des Sables", rarity: "legendaire",
    hp: 6500, atk: 80, armor: 22, mres: 18, stepMs: 420, atkMs: 1400, xp: 1000, gold: 260, kind: "zarkan", sweepAtk: 70, sweepMs: 1e12, noShield: true,
    dashAtk: 95, spinAtk: 62, sandAtk: 40, jarAtk: 60,
    summonType: "porteur_jarres", summonMsg: "🏺 Zarkan appelle ses porteurs de jarres !",
    loot: [["cimeterre_zarkan", 0.5], ["turban_roi_sables", 0.35], ["foulard_sable", 1]],
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
    hp: 1600, atk: 50, armor: 8, mres: 30, stepMs: 380, atkMs: 2000, xp: 300, gold: 80, kind: "gobshoot", shot: "fire", trail: true, range: 6, healMs: 6000, heal: 120, healSelf: true, selfHeal: 50,   // sur lui-même : seulement 50 PV
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

  // ---------- Cité royale ----------
  sanglier: {                                  // Sanglier : charge en ligne droite, s'assomme s'il rate (contourne-le)
    name: "Sanglier", rarity: "ordinaire",
    hp: 240, atk: 30, armor: 5, mres: 3, stepMs: 320, atkMs: 1400, xp: 16, kind: "roller", windMs: 700, rollMs: 110, stunMs: 1300, range: 5,
    loot: [["cuir", 0.08]],
  },
  faucon: {                                    // Faucon : tourne dans le ciel (intouchable), pique sur toi puis se pose un instant
    name: "Faucon", rarity: "commun",
    hp: 130, atk: 28, armor: 2, mres: 4, stepMs: 240, atkMs: 1300, xp: 18, kind: "diver", diveEvery: 3800, windMs: 700, diveStepMs: 70, restMs: 1300,
    loot: [["plume_faucon", 0.25], ["serre_faucon", 0.05]],
  },
  loup_maudit: {                               // Loup maudit : pelage d'ombre, yeux violets ; plus fort qu'un loup
    name: "Loup maudit", rarity: "rare",
    hp: 520, atk: 55, armor: 10, mres: 10, stepMs: 220, atkMs: 1200, xp: 40, kind: "chase",
    charge: 1.6, fastStepMs: 150,                // 1re attaque : une charge (× 1,6), puis il court plus vite
    loot: [["pelage_sombre", 0.3], ["dent_loup", 0.15], ["essence_corruption", 0.01]],
  },
  champignon_rampant: {                        // Champignon rampant : lent, mais ses spores empoisonnent et ralentissent (forêt des elfs)
    name: "Champignon rampant", rarity: "commun",
    hp: 700, atk: 50, armor: 12, mres: 6, stepMs: 520, atkMs: 1500, xp: 42, kind: "chase", poisonDps: 10, poisonMs: 4000, slowMs: 1000,
    loot: [["gros_champignon", 0.4], ["poison_araignee", 0.05]],
  },
  fee_farceuse: {                              // Fée farceuse : vise, puis tire un rayon arc-en-ciel en ligne droite (sors de la ligne !), puis recule
    name: "Fée farceuse", rarity: "rare",
    hp: 340, atk: 30, laserAtk: 70, armor: 4, mres: 18, stepMs: 260, atkMs: 3200, windMs: 800, xp: 48, kind: "laser", range: 6, fleeMs: 1200, fleeSteps: 2,
    loot: [["poussiere_jaune|poussiere_rose|poussiere_bleue|poussiere_verte", 0.75], ["aile_fee", 0.06]],
  },
  gardien_mousse: {                            // Gardien des mousses : golem de pierre moussu, lent et très résistant aux coups (la magie passe mieux)
    name: "Gardien des mousses", rarity: "rare",
    hp: 1100, atk: 66, armor: 28, mres: 4, stepMs: 480, atkMs: 1700, xp: 60, kind: "chase", rockMs: 5500, rockAtk: 70,   // lance des rochers (zone 3 × 3)
    loot: [["mousse_ancienne", 0.4], ["caillou", 0.2]],
  },
  crabe_geant: {                               // Crabe géant : carapace dure, pinces puissantes (plage de Balné)
    name: "Crabe géant", rarity: "commun",
    hp: 620, atk: 54, armor: 30, mres: 6, stepMs: 300, atkMs: 1400, xp: 40, kind: "chase",
    loot: [["pince_crabe", 0.4]],
  },
  mouette_enragee: {                           // Mouette enragée : comme les oiseaux (tourne en l'air, pique, se pose), mais plus forte
    name: "Mouette enragée", rarity: "rare",
    hp: 300, atk: 58, armor: 4, mres: 6, stepMs: 220, atkMs: 1200, xp: 34, kind: "diver", diveEvery: 3200, windMs: 600, diveStepMs: 60, restMs: 1200,
    loot: [["plume_argentee", 0.03], ["oeuf_mouette", 0.06]],
  },
  coquille_sj: {                               // Coquille Saint-Jacques monstrueuse : sautille, carapace dure, morsure très forte (cueillette sur la plage)
    name: "Coquille Saint-Jacques", rarity: "rare",
    hp: 480, atk: 82, armor: 34, mres: 8, stepMs: 600, atkMs: 1500, xp: 38, kind: "chase",
    loot: [["perle_rare", 0.02]],
  },
  sanglier_corrompu: {                         // Sanglier corrompu : charge, et recharge aussitôt tant qu'il ne t'a pas touché
    name: "Sanglier corrompu", rarity: "rare",
    hp: 900, atk: 72, armor: 14, mres: 8, stepMs: 300, atkMs: 1400, xp: 62, kind: "roller", windMs: 600, rollMs: 90, stunMs: 1200, range: 6, untilHit: true, maxRecharge: 3, chargeCd: 2500,
    loot: [["cuir", 0.3], ["essence_corruption", 0.01]],
  },
  corbeau: {                                   // Corbeau : oiseau lent mais costaud ; après chaque attaque, son cri appelle un autre corbeau (6 au maximum)
    name: "Corbeau", rarity: "commun",
    hp: 420, atk: 75, armor: 4, mres: 8, stepMs: 340, atkMs: 2400, xp: 46, kind: "diver", diveEvery: 5500, windMs: 900, diveStepMs: 95, restMs: 1600, callKin: 6,
    loot: [["plume_noire", 0.04], ["oeil_corbeau", 0.008]],
  },
  millepattes: {                               // mini-boss : Mille-pattes des profondeurs — poison, très rapide, attaques souterraines (antre de la Tanière sombre)
    name: "Mille-pattes des profondeurs", rarity: "epique",
    hp: 3800, atk: 66, armor: 18, mres: 10, stepMs: 170, atkMs: 1100, xp: 600, kind: "millepattes", poisonDps: 14, poisonMs: 4000, burrowMs: 6500, emergeAtk: 95,
    loot: [["carapace_millepattes", 1], ["venin_profondeurs", 0.4], ["croc_millepattes", 0.15], ["anneau_chitine", 0.05]],
  },
  scarabee_sacre: {                            // Tombeau d'Anubis : petit scarabée bleu et or, rapide, en groupe
    name: "Scarabée sacré", rarity: "commun",
    hp: 300, atk: 44, armor: 14, mres: 10, stepMs: 210, atkMs: 1100, xp: 34, gold: 4, kind: "chase", slowMs: 1200,   // sa morsure ralentit
    loot: [["scarabee_or", 0.04]],
  },
  chacal_anubis: {                             // Tombeau d'Anubis : guerrier à tête de chacal, rapide, sa lance perce l'armure
    name: "Chacal d'Anubis", rarity: "commun",
    hp: 680, atk: 66, armor: 12, mres: 10, stepMs: 250, atkMs: 1300, xp: 72, gold: 9, kind: "chase", curse: true,   // malédiction
    loot: [["croc_chacal", 0.3], ["bandelette", 0.1]],
  },
  pretre_anubis: {                             // Tombeau d'Anubis : prêtre masqué, lance des flammes sacrées (esquivables) et soigne les siens
    name: "Prêtre d'Anubis", rarity: "rare",
    hp: 560, atk: 60, armor: 6, mres: 26, stepMs: 340, atkMs: 2400, xp: 85, gold: 12, kind: "gobshoot", shot: "fire", range: 5, healMs: 6000, heal: 120, curse: true,   // malédiction, et il repousse ce qui l'approche
    loot: [["papyrus_funeraire", 0.12], ["bandelette", 0.25], ["ankh_or", 0.01]],
  },
  ushebti: {                                   // Tombeau d'Anubis : statuette de faïence animée, bloque les coups de face
    name: "Ouchebti", rarity: "rare",
    hp: 1300, atk: 70, armor: 28, mres: 16, stepMs: 440, atkMs: 1600, xp: 105, gold: 14, kind: "chase", shield: true,
    loot: [["scarabee_or", 0.06], ["ankh_or", 0.008]],
  },
  ammit: {                                     // mini-boss (fin de la partie 1 du Tombeau d'Anubis) : Ammit, la Dévoreuse des cœurs
    name: "Ammit, la Dévoreuse", rarity: "epique",
    hp: 5600, atk: 74, sweepAtk: 96, sweepMs: 5200, armor: 20, mres: 14, stepMs: 380, atkMs: 1500, xp: 700, gold: 170, kind: "gardien", slowMs: 1200, curse: true, dashAtk: 105, grabAtk: 32,
    summonType: "chacal_anubis", summonMsg: "🐊 Ammit rugit : deux chacals d'Anubis surgissent des sarcophages !", shieldMsg: "🛡️ Ammit se couvre d'un voile d'or : les coups physiques font moitié moins mal !",
    loot: [["coeur_ammit", 1], ["khepesh_ammit", 0.12], ["ankh_or", 0.25], ["scarabee_or", 0.5]],
  },
  momie_royale: {                              // Tombeau d'Anubis (partie 2) : momie au masque d'or, ses bandelettes maudites ralentissent et empoisonnent
    name: "Momie royale", rarity: "rare",
    hp: 1600, atk: 80, armor: 18, mres: 12, stepMs: 520, atkMs: 1600, xp: 125, gold: 16, kind: "chase", slowMs: 1500, poisonMs: 3000, poisonDps: 14,
    loot: [["bandelette", 0.4], ["scarabee_or", 0.05], ["masque_funeraire", 0.015]],
  },
  chat_bastet: {                               // Tombeau d'Anubis (partie 2) : chat sacré, bondit, griffe et s'enfuit
    name: "Chat de Bastet", rarity: "commun",
    hp: 520, atk: 62, armor: 8, mres: 14, stepMs: 115, atkMs: 850, xp: 60, gold: 7, kind: "dasher", fleeMs: 900, fleeSteps: 3, focusInt: true,   // très rapides, ils visent l'Intelligence la plus haute (sans tenir compte des provocations)
    loot: [["bandelette", 0.1], ["scarabee_or", 0.03]],
  },
  uraeus: {                                    // Tombeau d'Anubis (partie 2) : cobra sacré, morsure empoisonnée
    name: "Uraeus", rarity: "commun",
    hp: 780, atk: 72, armor: 16, mres: 24, stepMs: 250, atkMs: 1150, xp: 75, gold: 8, kind: "chase", poisonMs: 4000, poisonDps: 17,
    loot: [["ecaille_cobra", 0.1], ["scarabee_or", 0.02]],
  },
  sekhmet: {                                   // mini-boss (fin de la partie 2) : Sekhmet, la lionne de guerre — bondit sur un joueur, onde de choc, bouclier, chats
    name: "Sekhmet, la lionne de guerre", rarity: "epique",
    hp: 7600, atk: 82, sweepAtk: 100, sweepMs: 6000, armor: 22, mres: 18, stepMs: 320, atkMs: 1300, xp: 950, gold: 230, kind: "gardien", slowMs: 1000,
    leapMs: 7500, leapAtk: 115, leapMsg: "🦁 Sekhmet bondit… et va retomber sur {P} ! Écarte-toi de son ombre !",
    summonType: "chat_bastet", summonMsg: "🦁 Sekhmet rugit : deux chats de Bastet bondissent des colonnes !", shieldMsg: "☀️ Sekhmet s'embrase d'or : les coups physiques font moitié moins mal !",
    loot: [["griffe_sekhmet", 1], ["pectoral_sekhmet", 0.12], ["ankh_or", 0.3], ["scarabee_or", 0.6]],
  },
  garde_horus: {                               // Tombeau d'Anubis (partie 3) : archer à tête de faucon, tire puis recule
    name: "Garde d'Horus", rarity: "rare",
    hp: 760, atk: 72, armor: 12, mres: 12, stepMs: 270, atkMs: 2300, xp: 100, gold: 13, kind: "ranged", range: 5, missiles: 1, arrow: true, fleeMs: 1500, fleeSteps: 2,
    loot: [["plume_horus", 0.12], ["papyrus_funeraire", 0.08]],
  },
  ka_errant: {                                 // Tombeau d'Anubis (partie 3) : l'âme d'un pharaon — à moitié immatérielle, disparaît et réapparaît dans ton dos
    name: "Ka errant", rarity: "rare",
    hp: 820, atk: 74, armor: 14, mres: 18, stepMs: 300, atkMs: 1400, xp: 105, gold: 12, kind: "chase", physMul: 0.6, blinkMs: 7000,
    loot: [["poussiere_spectrale", 0.25], ["larme_fantomatique", 0.06], ["ankh_or", 0.006]],
  },
  scorpion_serket: {                           // Tombeau d'Anubis (partie 3) : scorpion géant de la déesse Serket, carapace épaisse, venin terrible
    name: "Scorpion de Serket", rarity: "rare",
    hp: 1500, atk: 84, armor: 28, mres: 14, stepMs: 360, atkMs: 1500, xp: 135, gold: 15, kind: "chase", poisonMs: 4000, poisonDps: 18,
    loot: [["dard_scorpion", 0.3], ["scarabee_or", 0.05]],
  },
  sablier_anubis: {                            // Tombeau d'Anubis : sorti d'un portail vert, il soigne Anubis tant qu'il n'est pas brisé
    name: "Sablier d'Anubis", rarity: "rare",
    hp: 1300, atk: 0, armor: 12, mres: 12, stepMs: 99999, atkMs: 99999, xp: 40, gold: 0, kind: "inert",
    loot: [],
  },
  anubis: {                                    // BOSS du Tombeau d'Anubis : ligne de jugement, téléportation, sables du Duat, pesée des âmes, nuit du désert des morts
    name: "Anubis, le gardien des morts", rarity: "legendaire",
    hp: 15000, atk: 92, sweepAtk: 110, sweepMs: 6500, armor: 24, mres: 24, stepMs: 340, atkMs: 1400, xp: 2500, gold: 650, kind: "anubis", slowMs: 1200,
    dashAtk: 125, sandAtk: 95, spinAtk: 105,
    summonType: "chacal_anubis", summonMsg: "🐺 Anubis appelle ses chacals !", shieldMsg: "⚖️ Anubis se drape d'or : les coups physiques font moitié moins mal !",
    loot: [["ankh_or", 1], ["papyrus_funeraire", 1], ["sceptre_ouas", 0.15], ["masque_anubis", 0.1], ["scarabee_or", 1]],
  },
  piranha: {                                   // Temple englouti : en banc, très rapide
    name: "Piranha du lac", rarity: "commun",
    hp: 260, atk: 40, armor: 6, mres: 6, stepMs: 190, atkMs: 1000, xp: 32, gold: 4, kind: "chase",
    loot: [["algue", 0.2], ["dent_piranha", 0.15]],
  },
  crabe_abysses: {                             // Temple englouti : carapace épaisse
    name: "Crabe des abysses", rarity: "commun",
    hp: 720, atk: 52, armor: 26, mres: 10, stepMs: 420, atkMs: 1500, xp: 55, gold: 7, kind: "chase",
    loot: [["algue", 0.25], ["pince_crabe", 0.2]],
  },
  meduse_spectrale: {                          // Temple englouti : dérive lentement, son contact empoisonne
    name: "Méduse spectrale", rarity: "commun",
    hp: 380, atk: 40, armor: 4, mres: 20, stepMs: 540, atkMs: 1400, xp: 45, gold: 5, kind: "chase", poisonMs: 3000, poisonDps: 10,
    loot: [["algue", 0.25], ["gelee_meduse", 0.15]],
  },
  anguille: {                                  // Temple englouti : fonce, électrocute (ralentit), repart
    name: "Anguille électrique", rarity: "commun",
    hp: 420, atk: 50, armor: 8, mres: 10, stepMs: 170, atkMs: 1200, xp: 50, gold: 6, kind: "dasher", fleeMs: 1000, fleeSteps: 3, slowMs: 900,
    loot: [["algue", 0.2], ["peau_anguille", 0.12]],
  },
  triton_dechu: {                              // Temple englouti : charge en ligne droite avec son trident
    name: "Triton déchu", rarity: "rare",
    hp: 1000, atk: 66, armor: 16, mres: 12, stepMs: 330, atkMs: 1400, xp: 95, gold: 12, kind: "roller", windMs: 800, rollMs: 95, stunMs: 1100, range: 6,
    loot: [["algue", 0.3], ["perle_rare", 0.05]],
  },
  sirene: {                                    // Temple englouti : chante (attire et blesse), garde ses distances, se soigne
    name: "Sirène des profondeurs", rarity: "rare",
    hp: 640, atk: 50, armor: 6, mres: 24, stepMs: 340, atkMs: 2400, xp: 90, gold: 12, kind: "sirene", songMs: 4200, songAtk: 52, heal: 80,
    loot: [["algue", 0.2], ["ecaille_sirene", 0.1], ["perle_rare", 0.06]],
  },
  poisson_lanterne: {                          // Temple englouti : sa lueur éclaire les abysses
    name: "Poisson-lanterne", rarity: "rare",
    hp: 720, atk: 62, armor: 10, mres: 12, stepMs: 300, atkMs: 1300, xp: 85, gold: 10, kind: "chase",
    loot: [["algue", 0.2], ["lanterne_abyssale", 0.08]],
  },
  golem_corail: {                              // Temple englouti : lent, très solide, bloque les coups de face
    name: "Golem de corail", rarity: "rare",
    hp: 1500, atk: 72, armor: 30, mres: 14, stepMs: 480, atkMs: 1700, xp: 110, gold: 14, kind: "chase", shield: true,
    loot: [["algue", 0.3], ["corail_rouge", 0.25]],
  },
  // ===== Donjon 9 : la Tour des cauchemars =====
  poupee_porcelaine: {                         // ne bouge que quand on lui tourne le dos (face à elle, elle se fige)
    name: "Poupée de porcelaine", rarity: "commun", nm: true,
    hp: 520, atk: 54, armor: 8, mres: 8, stepMs: 150, atkMs: 1100, xp: 70, gold: 8, kind: "chase",
    loot: [["eclat_porcelaine", 0.35]],
  },
  pantin: {                                    // pantin à ficelles : se relève 2 fois (la magie brûle ses ficelles)
    name: "Pantin à ficelles", rarity: "commun", nm: true,
    hp: 560, atk: 56, armor: 12, mres: 6, stepMs: 300, atkMs: 1300, xp: 75, gold: 8, kind: "chase",
    loot: [["eclat_porcelaine", 0.2]],
  },
  croque_mitaine: {                            // caché sous un lit : il t'attrape quand tu passes à côté
    name: "Croque-mitaine", rarity: "rare", nm: true, luc: 8,
    hp: 820, atk: 64, armor: 10, mres: 10, stepMs: 260, atkMs: 1300, xp: 100, gold: 12, kind: "chase",
    loot: [["sable_reve", 0.15]],
  },
  reflet_maudit: {                             // il se déplace en miroir de toi (symétrie par rapport au centre de la salle)
    name: "Reflet maudit", rarity: "rare", nm: true,
    hp: 700, atk: 66, armor: 8, mres: 14, stepMs: 220, atkMs: 1200, xp: 95, gold: 11, kind: "chase",
    loot: [["eclat_porcelaine", 0.2], ["sable_reve", 0.1]],
  },
  oeil_flottant: {                             // œil flottant : il verrouille sa cible puis lance un rayon (cache-toi derrière un pilier)
    name: "Œil flottant", rarity: "rare", nm: true, luc: 6,
    hp: 560, atk: 30, laserAtk: 92, armor: 4, mres: 18, stepMs: 380, atkMs: 3600, windMs: 1000, range: 8, fleeMs: 900, fleeSteps: 2, xp: 90, gold: 11, kind: "laser",
    loot: [["sable_reve", 0.12]],
  },
  horloger_meca: {                             // horloger mécanique : pose des zones de temps ralenti sous tes pieds
    name: "Horloger mécanique", rarity: "rare", nm: true,
    hp: 900, atk: 62, armor: 24, mres: 40, stepMs: 460, atkMs: 1500, xp: 105, gold: 13, kind: "chase",
    loot: [["engrenage_dore", 0.3]],
  },
  sablier_vivant: {                            // sablier vivant : il rembobine (soigne) les monstres proches ; tue-le en premier
    name: "Sablier vivant", rarity: "commun", nm: true,
    hp: 420, atk: 34, armor: 4, mres: 10, stepMs: 300, atkMs: 1600, xp: 70, gold: 8, kind: "chase",
    loot: [["sable_reve", 0.5]],
  },
  somnambule: {                                // somnambule : il dort… et il est très fort une fois réveillé
    name: "Somnambule", rarity: "epique", nm: true, luc: 10,
    hp: 1600, atk: 96, armor: 16, mres: 16, stepMs: 280, atkMs: 1500, xp: 180, gold: 22, kind: "chase",
    loot: [["sable_reve", 0.3]],
  },
  ombre_rampante: {                            // ombre rampante : invisible (et intouchable) loin de la lumière
    name: "Ombre rampante", rarity: "rare", nm: true, terror: true, luc: 6,
    hp: 680, atk: 70, armor: 2, mres: 12, stepMs: 240, atkMs: 1200, xp: 100, gold: 12, kind: "chase",
    loot: [["sable_reve", 0.15]],
  },
  jument_nuit: {                               // jument de la nuit : elle charge en ligne droite ; chaque charge vide 20 % de Lucidité
    name: "Jument de la nuit", rarity: "epique", nm: true, terror: true,
    hp: 1400, atk: 78, chargeAtk: 110, armor: 14, mres: 14, stepMs: 300, atkMs: 1400, xp: 170, gold: 20, kind: "chase",
    loot: [["sable_reve", 0.3]],
  },
  larve_reve: {                                // larve de rêve : elle se divise en 2 en mourant (3 générations)
    name: "Larve de rêve", rarity: "commun", nm: true,
    hp: 640, atk: 46, armor: 2, mres: 4, stepMs: 330, atkMs: 1200, xp: 45, gold: 5, kind: "chase",
    loot: [["sable_reve", 0.08]],
  },
  // ----- les boss -----
  poupee_reine: {                              // mini-boss (étage 5) : chaises musicales, thé empoisonné, éclats, ses enfants
    name: "La Poupée-Reine", rarity: "epique", nm: true,
    hp: 7000, atk: 72, sweepAtk: 80, sweepMs: 99999, armor: 14, mres: 14, stepMs: 440, atkMs: 1500, xp: 1000, gold: 220, kind: "nm_queen", noShield: true, chairAtk: 150, teaAtk: 60, shardAtk: 40,
    loot: [["eclat_porcelaine", 1], ["eclat_porcelaine", 1], ["sable_reve", 1]],
  },
  reflet_boss: {                               // boss (étage 10) : ton propre reflet
    name: "Ton Reflet", rarity: "legendaire", nm: true,
    hp: 9000, atk: 82, sweepAtk: 80, sweepMs: 99999, armor: 18, mres: 18, stepMs: 300, atkMs: 1300, xp: 1400, gold: 300, kind: "nm_reflet", noShield: true, missiles: 2,
    loot: [["sable_reve", 1], ["sable_reve", 1], ["bonnet_veilleur", 0.2]],
  },
  reflet_leurre: {                             // les faux reflets de la galerie (ils n'ont pas d'ombre)
    name: "Ton Reflet", rarity: "rare", nm: true,
    hp: 380, atk: 30, armor: 0, mres: 0, stepMs: 320, atkMs: 1600, xp: 0, gold: 0, kind: "chase",
    loot: [],
  },
  miroir_hante: {                              // les miroirs de la galerie : tant qu'il en reste, le Reflet est protégé
    name: "Miroir hanté", rarity: "rare", nm: true,
    hp: 900, atk: 0, armor: 10, mres: 10, stepMs: 99999, atkMs: 99999, xp: 0, gold: 0, kind: "static",
    loot: [],
  },
  horloger_fou: {                              // mini-boss (étage 15) : arrêt du temps, rembobinage, engrenages, minuit
    name: "L'Horloger fou", rarity: "legendaire", nm: true,
    hp: 11000, atk: 86, sweepAtk: 90, sweepMs: 99999, armor: 22, mres: 22, stepMs: 420, atkMs: 1400, xp: 1800, gold: 380, kind: "nm_horloger", noShield: true, freezeAtk: 120, gearAtk: 95, bellAtk: 100,
    loot: [["engrenage_dore", 1], ["sable_reve", 1], ["robe_veilleur", 0.2]],
  },
  pendule: {                                   // le pendule de l'Horloger : casse-le avant qu'il ne rembobine le temps
    name: "Pendule", rarity: "rare", nm: true,
    hp: 1100, atk: 0, armor: 6, mres: 6, stepMs: 99999, atkMs: 99999, xp: 0, gold: 0, kind: "static",
    loot: [],
  },
  morpheon: {                                  // BOSS FINAL : Morphéon, le Rêveur (3 phases)
    name: "Morphéon, le Rêveur", rarity: "ultime", nm: true,
    hp: 18000, atk: 96, sweepAtk: 100, sweepMs: 99999, armor: 24, mres: 24, stepMs: 520, atkMs: 1500, xp: 3200, gold: 650, kind: "nm_morpheon", noShield: true, sheepAtk: 85, holeAtk: 0,
    loot: [["sable_reve", 1], ["sable_reve", 1], ["sable_reve", 1], ["attrape_reves", 0.15]],
  },
  echo_poupee: {                               // les échos des cauchemars (phase 2 de Morphéon)
    name: "Écho de la Poupée-Reine", rarity: "epique", nm: true,
    hp: 2600, atk: 66, sweepAtk: 60, sweepMs: 99999, armor: 10, mres: 10, stepMs: 420, atkMs: 1500, xp: 0, gold: 0, kind: "nm_queen", noShield: true, echo: true, teaAtk: 55,
    loot: [],
  },
  echo_reflet: {
    name: "Écho de ton Reflet", rarity: "epique", nm: true,
    hp: 2600, atk: 70, sweepAtk: 60, sweepMs: 99999, armor: 10, mres: 10, stepMs: 320, atkMs: 1300, xp: 0, gold: 0, kind: "nm_reflet", noShield: true, echo: true, missiles: 2,
    loot: [],
  },
  echo_horloger: {
    name: "Écho de l'Horloger", rarity: "epique", nm: true,
    hp: 2600, atk: 70, sweepAtk: 60, sweepMs: 99999, armor: 10, mres: 10, stepMs: 420, atkMs: 1400, xp: 0, gold: 0, kind: "nm_horloger", noShield: true, echo: true, gearAtk: 80,
    loot: [],
  },

  pieuvre: {                                   // mini-boss du Temple englouti : tentacules qui jaillissent du sol, encre, se cache dans son trou
    name: "Pieuvre géante", rarity: "epique",
    hp: 6000, atk: 70, sweepAtk: 80, sweepMs: 99999, armor: 16, mres: 16, stepMs: 620, atkMs: 1500, xp: 800, gold: 200, kind: "pieuvre", noShield: true, tentAtk: 82, inkAtk: 50,
    summonType: "anguille", summonMsg: "🐙 La Pieuvre agite ses tentacules : deux anguilles électriques sortent des rochers !",
    loot: [["encre_pieuvre", 1], ["algue", 1], ["algue", 1], ["algue", 1], ["collier_sirene", 0.1]],
  },
  ondrael: {                                   // BOSS du Temple englouti : Ondraël, le seigneur des eaux noires (il a volé la Coupe bénite des elfes)
    name: "Ondraël, le seigneur des eaux noires", rarity: "legendaire",
    hp: 13000, atk: 86, sweepAtk: 100, sweepMs: 99999, armor: 22, mres: 22, stepMs: 360, atkMs: 1400, xp: 2200, gold: 500, kind: "ondrael",
    waveAtk: 115, bubbleAtk: 85, whirlAtk: 60, geyserAtk: 90,
    summonType: "triton_dechu", summonMsg: "🔱 Ondraël appelle ses tritons !", shieldMsg: "💧 Ondraël se couvre d'une armure d'eau : les coups physiques font moitié moins mal !",
    loot: [["algue", 1], ["algue", 1], ["algue", 1], ["algue", 1], ["algue", 1], ["perle_rare", 1], ["perle_rare", 1], ["trident_ondrael", 0.12], ["couronne_marees", 0.06]],
  },
  frere_ours: {                                // mini-boss : le frère des ourses — shaman (ronces), puis ours géant sous 80 % : frappe le sol, rugit, très très rapide
    name: "Frère des ourses", rarity: "epique",
    hp: 4200, atk: 55, armor: 11, mres: 16, stepMs: 420, atkMs: 1500, xp: 650, kind: "frereours",
    castMs: 3600, ronceAtk: 70, bearAtk: 125, bearAtkMs: 950, bearStepMs: 130, slamMs: 4800, slamAtk: 110, roarMs: 9000, roarAtk: 90,
    chargeMs: 7500, chargeWind: 1300, chargeAtk: 95,   // attaque chargée : il canalise, puis frappe 3 fois tout autour de lui (un coup physique pendant la canalisation l'étourdit 1,5 s)
    loot: [["griffe_ourse", 0.6], ["griffe_bestiale", 0.05], ["marque_nature", 0.01]],
  },
  ourse_geante: {                              // Ourse géante furieuse : charge sur toi, puis court plus vite (Tanière de la forêt)
    name: "Ourse géante furieuse", rarity: "epique",
    hp: 2400, atk: 150, armor: 18, mres: 10, stepMs: 300, atkMs: 1500, xp: 240, kind: "chase", charge: 2, fastStepMs: 190,   // frappe très fort
    loot: [["griffe_ourse", 0.6], ["griffe_bestiale", 0.05], ["marque_nature", 0.01]],
  },
  thaloryn: {                                  // boss du Cœur de la forêt : flammes vertes (plantes carnivores), ronces, coup au sol (étourdit), morsure
    name: "Thaloryn, le vieux dragon", rarity: "legendaire",
    hp: 8000, atk: 95, armor: 18, mres: 18, stepMs: 1600, atkMs: 1700, xp: 2500, kind: "dragon", big: true, fireAtk: 22, ronceAtk: 60, slamAtk: 90,
    loot: [["ecaille_brillante", 1], ["ecaille_brillante", 1], ["fleur_enchantee", 1], ["bois_enchante", 1]],
  },
  // ---------- La Vieille tour (donjon, niveau 10) ----------
  rat_geant: {                                 // Rat géant : rapide et vorace
    name: "Rat géant", rarity: "ordinaire",
    hp: 170, atk: 24, armor: 4, mres: 2, stepMs: 210, atkMs: 1300, xp: 14, kind: "chase",
    loot: [["peau_rat", 0.5]],
  },
  armure_animee: {                             // Armure animée : lente, très résistante aux coups (la magie passe mieux)
    name: "Armure animée", rarity: "commun",
    hp: 340, atk: 34, armor: 16, mres: 2, stepMs: 520, atkMs: 1600, xp: 30, gold: 5, kind: "chase",
    loot: [["page_sort", 0.06]],
  },
  armure_bouclier: {                           // Armure au bouclier : bloque 80 % des coups venant de face (contourne-la)
    name: "Armure au bouclier", rarity: "commun",
    hp: 380, atk: 32, armor: 14, mres: 4, stepMs: 480, atkMs: 1600, xp: 34, gold: 5, kind: "chase", shield: true,
    loot: [["page_sort", 0.08]],
  },
  livre_volant: {                              // Livre volant : garde ses distances et lance des pages coupantes sur ta case (esquivables)
    name: "Livre volant", rarity: "commun",
    hp: 150, atk: 28, armor: 2, mres: 14, stepMs: 300, atkMs: 2300, xp: 26, gold: 4, kind: "gobshoot", shot: "page", range: 5,
    loot: [["page_sort", 0.15]],
  },
  feu_bleu: {                                  // Feu follet bleu : fonce sur toi, mord puis s'éloigne
    name: "Feu follet bleu", rarity: "commun",
    hp: 130, atk: 28, armor: 20, mres: 25, stepMs: 180, atkMs: 1400, xp: 22, gold: 3, kind: "dasher", fleeMs: 1100, fleeSteps: 3,
    loot: [["poussiere_spectrale", 0.25]],
  },
  gargouille: {                                // Gargouille : pique sur toi, mord, puis remonte se percher
    name: "Gargouille", rarity: "rare",
    hp: 240, atk: 32, armor: 14, mres: 8, stepMs: 190, atkMs: 1400, xp: 30, gold: 5, kind: "dasher", fleeMs: 1300, fleeSteps: 3,
    loot: [["page_sort", 0.1]],
  },
  gargouille_pierre: {                         // mini-boss : frappe le sol (onde de choc), s'envole et atterrit sur le joueur aux PV max les plus bas, se change en pierre sous 50 % (physique ÷ 2), à 30 % 2 gargouilles
    name: "Gargouille de pierre", rarity: "epique",
    hp: 1700, atk: 44, sweepAtk: 62, sweepMs: 6000, leapMs: 8000, leapAtk: 75, armor: 16, mres: 8, stepMs: 500, atkMs: 1600, xp: 220, gold: 70, kind: "gardien",
    summonType: "gargouille", summonMsg: "🦇 La Gargouille de pierre pousse un cri : deux gargouilles se détachent des murs !",
    shieldMsg: "🗿 La Gargouille se change en pierre : les coups physiques font moitié moins mal… la magie passe !",
    loot: [["page_sort", 1], ["petite_potion", 0.5]],
  },
  malzar: {                                    // boss : Malzar le mage fou — téléportation, orbes visées, runes en croix, livres à 66 % et 33 %
    name: "Malzar, le mage fou", rarity: "epique",
    hp: 2600, atk: 45, armor: 8, mres: 25, stepMs: 380, atkMs: 1500, xp: 450, gold: 120, kind: "mage", range: 7,
    tpMs: 6500, shotMs: 2400, orbAtk: 52, crossMs: 5200, crossAtk: 48,
    loot: [["robe_malzar", 1], ["grimoire_dechire", 0.35], ["page_sort", 2]],
  },
  poisson: {                                   // Poisson sauteur : saute hors du lac, gigote sur la rive et frappe très vite (sans bouger)
    name: "Poisson sauteur", rarity: "ordinaire",
    hp: 300, atk: 1, armor: 25, mres: 4, stepMs: 1000, atkMs: 350, xp: 4, kind: "static",
    loot: [["ecaille_brillante", 0.01]],
  },

  // ---------- Catacombes royales (donjon, niveau 18) ----------
  squelette_guerrier: {                        // Squelette guerrier : épée rouillée et bouclier de bois
    name: "Squelette guerrier", rarity: "commun",
    hp: 480, atk: 56, armor: 16, mres: 4, stepMs: 300, atkMs: 1300, xp: 48, gold: 7, kind: "chase",
    loot: [["os_ancien", 0.3], ["dague_brisee", 0.05]],
  },
  squelette_archer: {                          // Squelette archer : tire sur ta case (esquive en bougeant), recule si on l'approche
    name: "Squelette archer", rarity: "commun",
    hp: 330, atk: 50, armor: 8, mres: 4, stepMs: 300, atkMs: 2300, xp: 46, gold: 6, kind: "gobshoot", shot: "arrow", range: 5, volley: 1, groundFire: true,   // ses flèches enflamment le sol
    loot: [["fleche", 0.3], ["os_ancien", 0.15]],
  },
  chevalier_squelette: {                       // Chevalier squelette : grand bouclier, bloque 80 % des coups de face (contourne-le)
    name: "Chevalier squelette", rarity: "rare",
    hp: 760, atk: 54, armor: 22, mres: 8, stepMs: 440, atkMs: 1500, xp: 62, gold: 9, kind: "chase", shield: true,
    loot: [["os_ancien", 0.3], ["epee_brisee", 0.15], ["dague_brisee", 0.1], ["bouclier_squelette", 0.02]],
  },
  goule: {                                     // Goule : rapide, ses griffes empoisonnent
    name: "Goule", rarity: "commun",
    hp: 420, atk: 48, armor: 8, mres: 6, stepMs: 240, atkMs: 1200, xp: 50, gold: 7, kind: "chase", poisonMs: 3000, poisonDps: 10,
    loot: [["chair_pourrie", 0.3], ["gel_hydro", 0.04]],
  },
  follet_cata: {                               // Feu follet des catacombes : fuit les joueurs et souffle les braseros allumés
    name: "Feu follet des catacombes", rarity: "commun",
    hp: 220, atk: 20, armor: 30, mres: 10, stepMs: 280, atkMs: 1500, xp: 30, gold: 4, kind: "wisp",
    loot: [["poussiere_spectrale", 0.3], ["larme_fantomatique", 0.05]],
  },
  banshee: {                                   // Banshee : son cri glace le sang (peur 1,5 s) ; à moitié immatérielle (physique ×0,6)
    name: "Banshee", rarity: "rare",
    hp: 380, atk: 42, armor: 4, mres: 14, stepMs: 300, atkMs: 1400, xp: 55, gold: 8, kind: "chase", physMul: 0.6, screamMs: 7000, screamFear: 1500, screamRange: 3,
    loot: [["larme_fantomatique", 0.12], ["poussiere_spectrale", 0.2]],
  },
  momie: {                                     // Momie : lente mais solide, ses bandelettes ralentissent
    name: "Momie", rarity: "rare",
    hp: 920, atk: 62, armor: 14, mres: 10, stepMs: 560, atkMs: 1700, xp: 70, gold: 10, kind: "chase", slowMs: 1500,
    loot: [["chair_pourrie", 0.2], ["larme_fantomatique", 0.06]],
  },
  necromancien: {                              // mini-boss : invoque des squelettes ; bouclier d'os tant que ses invocations vivent
    name: "Le Nécromancien", rarity: "epique",
    hp: 2600, atk: 50, armor: 10, mres: 22, stepMs: 380, atkMs: 1600, xp: 380, gold: 100, kind: "necro", range: 6,
    shotMs: 2500, orbAtk: 56, summonMs: 16000, summonType: "squelette_guerrier",   // invocation toutes les 16 s (au lieu de 10)
    loot: [["page_sort", 1], ["larme_fantomatique", 0.5]],
  },
  phylactere: {                                // phylactère du Roi-Liche : tant qu'il en reste un, le Roi-Liche est invulnérable
    name: "Phylactère", rarity: "rare",
    hp: 420, atk: 1, armor: 0, mres: 0, stepMs: 99999, atkMs: 99999, xp: 30, gold: 0, kind: "inert",
    loot: [],
  },
  roi_liche: {                                 // boss : téléportation, orbes de glace, runes ; 50 % : phylactères ; 20 % : zones nécrotiques et chevaliers
    name: "Le Roi-Liche Aldemar Iᵉʳ", rarity: "legendaire",
    hp: 4400, atk: 60, armor: 12, mres: 28, stepMs: 380, atkMs: 1500, xp: 650, gold: 180, kind: "liche", range: 7,
    tpMs: 7000, shotMs: 2200, orbAtk: 60, crossMs: 6000, crossAtk: 56, summonType: "squelette_guerrier", summonMsg: "💀 Le Roi-Liche lève son sceptre : deux squelettes sortent de terre !",
    loot: [["couronne_liche", 1], ["parchemin_necro", 0.4], ["bouclier_squelette", 0.35]],
  },
  // ---------- Vieux château (donjon, niveau 22) ----------
  chevalier_fantome: {                         // Chevalier fantôme : à moitié immatériel (physique ×0,6)
    name: "Chevalier fantôme", rarity: "rare",
    hp: 660, atk: 62, armor: 14, mres: 12, stepMs: 300, atkMs: 1400, xp: 64, gold: 9, kind: "chase", physMul: 0.6, blinkMs: 7000,   // disparaît et réapparaît dans ton dos
    loot: [["larme_fantomatique", 0.08], ["poussiere_spectrale", 0.2]],
  },
  garde_maudit: {                              // Garde maudit : armure noire et bouclier, bloque 80 % des coups de face
    name: "Garde maudit", rarity: "rare",
    hp: 920, atk: 60, armor: 24, mres: 10, stepMs: 460, atkMs: 1500, xp: 70, gold: 10, kind: "chase", shield: true, stunHit: 800,   // son coup étourdit 0,8 s (une fois toutes les 4 s)
    loot: [["fer", 0.15], ["dague_brisee", 0.08]],
  },
  destrier_spectral: {                         // Destrier spectral : charge en ligne droite, s'assomme contre un mur
    name: "Destrier spectral", rarity: "rare",
    hp: 700, atk: 72, armor: 12, mres: 10, stepMs: 360, atkMs: 1300, xp: 66, kind: "roller", windMs: 900, rollMs: 85, stunMs: 1100, range: 7, chain: 3,   // hennit, puis charge 3 fois d'affilée
    loot: [["cuir", 0.1], ["poussiere_spectrale", 0.15]],
  },
  cuisinier_maudit: {                          // Cuisinier maudit : gros couperet, frappe tout autour de lui
    name: "Cuisinier maudit", rarity: "rare",
    hp: 1100, atk: 70, armor: 14, mres: 8, stepMs: 480, atkMs: 1700, xp: 80, gold: 12, kind: "chase", slam: true,
    loot: [["chair_pourrie", 0.3], ["pain", 0.3]],
  },
  dame_blanche: {                              // mini-boss : la Dame blanche — cri (onde de choc qui ralentit), appelle des banshees
    name: "La Dame blanche", rarity: "epique",
    hp: 3200, atk: 56, sweepAtk: 72, sweepMs: 6000, armor: 8, mres: 20, stepMs: 420, atkMs: 1500, xp: 420, gold: 110, kind: "gardien", noShield: true, slowMs: 1500, physMul: 0.7,
    screamMs: 9000, screamFear: 1800, screamRange: 4, vanishMs: 12000, flameMs: 7000, flameAtk: 55,   // cri (peur), disparitions, pluie de feu
    summonType: "banshee", summonMsg: "😱 La Dame blanche hurle : deux banshees surgissent des murs !",
    loot: [["larme_fantomatique", 1], ["poussiere_spectrale", 1]],
  },
  baron_mordred: {                             // boss : Baron Mordred — onde de choc, lames d'ombre en croix, bouclier sous 50 %, chevaliers à 30 %
    name: "Baron Mordred, le chef du vieux château", rarity: "legendaire",
    hp: 5400, atk: 76, sweepAtk: 92, sweepMs: 7000, armor: 22, mres: 16, stepMs: 460, atkMs: 1500, xp: 800, gold: 220, kind: "baron", spikeAtk: 50, spinAtk: 58,   // pics, aspiration + tourbillon
    crossMs: 6500, crossAtk: 66, summonType: "chevalier_fantome", summonMsg: "⚔️ Baron Mordred lève son épée : deux chevaliers fantômes accourent !",
    shieldMsg: "🛡️ Le Baron s'entoure d'ombre : les coups physiques font moitié moins mal… la magie passe !",
    loot: [["epee_baron", 1], ["armure_baron", 0.4]],
  },

  spectre: {                                   // Spectre décevant : court sur le joueur comme un rat ; immunisé au physique, seule la magie le tue
    name: "Spectre décevant", rarity: "ordinaire",
    hp: 50, atk: 25, stepMs: 300, atkMs: 1400, xp: 7, kind: "chase", immunePhysique: true,
    loot: [["essence_maussade", 0.12]],
  },
  // ===== Mer agitée (v1.61) — sea: comportements spéciaux (seaMobUpdate) ; swim: 1 nage, 2 amphibie/vole, 3 spectre (traverse rochers et épaves) =====
  meduse_lanterne: {                           // dérive en bancs ; son contact paralyse ; plus solide la nuit
    name: "Méduse-lanterne", rarity: "ordinaire", sea: true, swim: 1, nightHp: 1.3,
    hp: 440, atk: 50, armor: 4, mres: 10, stepMs: 560, atkMs: 1400, xp: 46, gold: 0, kind: "chase", stunHit: 800,
    loot: [["gelee_lumineuse", 0.4], ["potion", 0.05]],
  },
  mouette_voleuse: {                           // pique la barque, vole un consommable et s'envole
    name: "Mouette voleuse", rarity: "ordinaire", sea: true, swim: 2, stealItem: true,
    hp: 420, atk: 48, armor: 4, mres: 6, stepMs: 200, atkMs: 1300, xp: 44, gold: 0, kind: "chase",
    loot: [["plume_mouette", 0.5]],
  },
  crabe_brisants: {                            // carapace frontale : −50 % de dégâts reçus de face
    name: "Crabe des brisants", rarity: "ordinaire", sea: true, frontShell: true,
    hp: 520, atk: 55, armor: 14, mres: 6, stepMs: 360, atkMs: 1400, xp: 48, gold: 0, kind: "chase",
    loot: [["pince_crabe", 0.45], ["coquillage", 0.2]],
  },
  rat_cale: {                                  // en meute : +10 % de dégâts par rat voisin ; morsure empoisonnée
    name: "Rat de cale", rarity: "ordinaire", sea: true, pack: true,
    hp: 430, atk: 50, armor: 6, mres: 4, stepMs: 230, atkMs: 1100, xp: 44, gold: 0, kind: "chase", poisonMs: 3000, poisonDps: 8,
    loot: [["queue_rat", 0.45]],
  },
  poisson_aiguille: {                          // ligne rouge, puis bond de 4 cases (traverse la barque)
    name: "Poisson-aiguille", rarity: "ordinaire", sea: true, swim: 1, lineDash: { every: 5000, len: 4, mult: 1.3 },
    hp: 460, atk: 60, armor: 6, mres: 6, stepMs: 300, atkMs: 1500, xp: 50, gold: 0, kind: "chase",
    loot: [["arete_fine", 0.4], ["maquereau_bleu", 0.3]],
  },
  loutre_chapardeuse: {                        // vole de l'or (rendu à sa mort) ; plonge 2 s quand on la frappe
    name: "Loutre chapardeuse", rarity: "ordinaire", sea: true, swim: 2, stealGold: 0.01, diveOnHit: 2000,
    hp: 480, atk: 52, armor: 6, mres: 8, stepMs: 230, atkMs: 1300, xp: 48, gold: 0, kind: "chase",
    loot: [["fourrure_loutre", 0.35], ["sac_poissons", 0.15]],
  },
  bernard_coco: {                              // se cache 2 s dans sa coquille après 3 coups
    name: "Bernard-l'ermite des cocotiers", rarity: "ordinaire", sea: true, shellAfter: 3,
    hp: 500, atk: 54, armor: 16, mres: 6, stepMs: 400, atkMs: 1500, xp: 48, gold: 0, kind: "chase",
    loot: [["noix_coco", 0.5], ["coquillage", 0.2]],
  },
  crabe_ermite: {                              // charge en ligne (3 cases), puis s'abrite 1,5 s
    name: "Crabe-ermite géant", rarity: "commun", sea: true, swim: 2, lineDash: { every: 6000, len: 3, mult: 1.2, shell: 1500 },
    hp: 780, atk: 72, armor: 20, mres: 8, stepMs: 330, atkMs: 1500, xp: 70, gold: 0, kind: "chase",
    loot: [["pince_geante", 0.4], ["coquillage", 0.2]],
  },
  requin_marteau: {                            // tourne 3 s autour de sa proie, puis charge (×2) ; sent le sang
    name: "Requin-marteau", rarity: "commun", sea: true, swim: 1, circle: 3000,
    hp: 880, atk: 80, armor: 12, mres: 8, stepMs: 230, atkMs: 1400, xp: 78, gold: 0, kind: "chase",
    loot: [["aileron_requin", 0.35], ["dent_requin", 0.2]],
  },
  calmar_encre: {                              // jet d'encre (aveugle 2 s) puis recule
    name: "Calmar à encre", rarity: "commun", sea: true, swim: 1, inkMs: 7000,
    hp: 760, atk: 70, armor: 8, mres: 14, stepMs: 300, atkMs: 1400, xp: 70, gold: 0, kind: "chase",
    loot: [["poche_encre", 0.4], ["tentacule", 0.25]],
  },
  garde_corail: {                              // épines : renvoie 15 % des dégâts de mêlée
    name: "Garde-corail", rarity: "commun", sea: true, swim: 1, thorns: 0.15,
    hp: 950, atk: 76, armor: 26, mres: 10, stepMs: 560, atkMs: 1700, xp: 76, gold: 0, kind: "chase",
    loot: [["corail_rose", 0.4], ["corail_feu", 0.08]],
  },
  noye: {                                      // surgit de l'eau, agrippe (ralentit)
    name: "Noyé", rarity: "commun", sea: true, swim: 1, undead: true,
    hp: 820, atk: 74, armor: 10, mres: 6, stepMs: 340, atkMs: 1450, xp: 72, gold: 0, kind: "chase", slowMs: 1500,
    loot: [["lueur_noye", 0.3], ["os_ancien", 0.25]],
  },
  anguille_fantome: {                          // traverse rochers et épaves ; morsure : vol de vie
    name: "Anguille fantôme", rarity: "commun", sea: true, swim: 3, lifeDrain: 0.3, undead: true,
    hp: 700, atk: 78, armor: 4, mres: 16, stepMs: 260, atkMs: 1300, xp: 74, gold: 0, kind: "chase",
    loot: [["ectoplasme", 0.3], ["ecaille_spectrale", 0.15]],
  },
  contrebandier: {                             // lance du sel (aveugle 1 s), fuit à 30 % de PV
    name: "Contrebandier du sel", rarity: "commun", sea: true, saltBlind: 1000, fleeAt: 0.3,
    hp: 860, atk: 76, armor: 14, mres: 8, stepMs: 300, atkMs: 1400, xp: 74, gold: 0, kind: "chase",
    loot: [["sel", 0.5], ["cle_planque", 0.03]],
  },
  contrebandier_barque: {                      // le même, dans sa barque sans lanterne (embuscade de nuit)
    name: "Contrebandier en barque", rarity: "commun", sea: true, swim: 1, saltBlind: 1000, fleeAt: 0.3, inBoat: true,
    hp: 860, atk: 76, armor: 14, mres: 8, stepMs: 300, atkMs: 1400, xp: 74, gold: 0, kind: "chase",
    loot: [["sel", 0.5], ["cle_planque", 0.05]],
  },
  pieuvre_grotte: {                            // tapie dans une faille : tentacule à 2 cases qui immobilise ; invisible quand elle ne bouge pas
    name: "Pieuvre de grotte", rarity: "commun", sea: true, swim: 1, rootMs: 1200, camo: true,
    hp: 900, atk: 72, armor: 10, mres: 10, stepMs: 99999, atkMs: 1600, xp: 76, gold: 0, kind: "static", reach: 2,
    loot: [["tentacule", 0.35], ["poche_encre", 0.2]],
  },
  sirene_noire: {                              // chant qui attire la barque, morsure, plonge et réapparaît
    name: "Sirène noire", rarity: "rare", sea: true, swim: 1, song: { ms: 7000, atk: 70 },
    hp: 1600, atk: 105, armor: 10, mres: 22, stepMs: 300, atkMs: 1500, xp: 150, gold: 0, kind: "chase",
    loot: [["ecaille_sirene", 0.3], ["perle_noire", 0.08], ["piece_or_ancienne", 0.02]],
  },
  serpent_de_mer: {                            // balayage en arc devant lui ; plonge sous la barque et ressort derrière
    name: "Serpent de mer", rarity: "rare", sea: true, swim: 1, sweep: { ms: 6000, atk: 120 }, diveBehind: 9000, big: true,
    hp: 1900, atk: 115, armor: 16, mres: 12, stepMs: 300, atkMs: 1500, xp: 160, gold: 0, kind: "chase",
    loot: [["ecaille_serpent", 0.5], ["croc_serpent", 0.15], ["piece_or_ancienne", 0.02]],
  },
  crabe_squelette: {                           // se reconstitue une fois, sauf si un sort l'achève
    name: "Crabe-squelette", rarity: "rare", sea: true, swim: 2, revive: true, undead: true,
    hp: 1500, atk: 100, armor: 22, mres: 6, stepMs: 360, atkMs: 1500, xp: 140, gold: 0, kind: "chase",
    loot: [["os_crabe", 0.4], ["lueur_noye", 0.2], ["piece_or_ancienne", 0.02]],
  },
  gardien_pierre: {                            // soldat de pierre d'Ys : son coup pétrifie (étourdit 1 s), insensible au poison
    name: "Gardien de pierre", rarity: "rare", sea: true, noPoison: true, stone: true,
    hp: 2100, atk: 110, armor: 30, mres: 10, stepMs: 520, atkMs: 1800, xp: 160, gold: 0, kind: "chase", stunHit: 1000,
    loot: [["fragment_nacre", 0.35], ["rune_ys", 0.1], ["piece_or_ancienne", 0.02]],
  },
  mante_corail: {                              // camouflée en corail (invisible jusqu'à 2 cases), double coup de faux
    name: "Mante-corail", rarity: "rare", sea: true, swim: 2, camo: 2, doubleHit: true,
    hp: 1700, atk: 120, armor: 14, mres: 10, stepMs: 280, atkMs: 1300, xp: 150, gold: 0, kind: "chase",
    loot: [["faux_corail", 0.25], ["corail_feu", 0.15], ["piece_or_ancienne", 0.02]],
  },
  ombre_equipage: {                            // à moitié immatérielle ; chaque coup vole 2 % de l'or
    name: "Ombre d'équipage", rarity: "rare", sea: true, swim: 2, physMul: 0.5, stealGold: 0.02, undead: true,
    hp: 1800, atk: 112, armor: 8, mres: 14, stepMs: 300, atkMs: 1400, xp: 150, gold: 0, kind: "chase",
    loot: [["piece_or_ancienne", 0.06], ["sabre_spectral", 0.05], ["ectoplasme", 0.3]],
  },
  raie_electrique: {                           // décharge en zone (rayon 2, cercle jaune 1 s avant) : étourdit
    name: "Raie électrique", rarity: "rare", sea: true, swim: 1, shock: { ms: 6000, r: 2, atk: 95, stun: 800 },
    hp: 1600, atk: 108, armor: 10, mres: 16, stepMs: 320, atkMs: 1500, xp: 145, gold: 0, kind: "chase",
    loot: [["aiguillon_raie", 0.3], ["cristal_orage", 0.1], ["piece_or_ancienne", 0.02]],
  },
  crabe_mimique: {                             // le coffre ensablé était un crabe !
    name: "Crabe-mimique", rarity: "rare", sea: true, swim: 2,
    hp: 1700, atk: 110, armor: 24, mres: 10, stepMs: 300, atkMs: 1400, xp: 150, gold: 0, kind: "chase",
    loot: [["pince_geante", 0.6], ["perle_huitre", 0.5], ["piece_or_ancienne", 0.05]],
  },
  crabe_forteresse: {                          // pinces en zone ; sous 50 % : se ferme (−80 %) et fait sortir 3 crabes
    name: "Crabe-forteresse", rarity: "epique", sea: true, swim: 2, big: true, fortress: true,
    hp: 4200, atk: 135, armor: 34, mres: 14, stepMs: 480, atkMs: 1800, xp: 380, gold: 0, kind: "chase",
    loot: [["carapace_forteresse", 0.4], ["rune_ys", 0.25], ["piece_or_ancienne", 0.02]],
  },
  capitaine_noye: {                            // appelle 3 noyés ; onde de vase (ralentit) ; sabre en arc
    name: "Capitaine noyé", rarity: "epique", sea: true, swim: 1, undead: true, captain: true, big: true,
    hp: 3800, atk: 130, armor: 18, mres: 12, stepMs: 340, atkMs: 1500, xp: 360, gold: 0, kind: "chase",
    loot: [["tricorne_noye", 0.15], ["piece_or_ancienne", 0.02]],
  },
  vieux_croc: {                                // grand requin blanc : charge à travers la barque (saignement), plonge et ressort derrière
    name: "Vieux Croc", rarity: "epique", sea: true, swim: 1, big: true, lineDash: { every: 6000, len: 6, mult: 1.4, bleed: true }, diveBehind: 10000,
    hp: 4600, atk: 145, armor: 16, mres: 10, stepMs: 220, atkMs: 1400, xp: 420, gold: 0, kind: "chase",
    loot: [["machoire_croc", 0.5], ["aileron_requin", 1], ["piece_or_ancienne", 0.02]],
  },
  tentacule_tourbillon: {                      // 4 tentacules autour du Tourbillon : saisit la barque et la tire vers l'œil
    name: "Tentacule du Tourbillon", rarity: "epique", sea: true, swim: 1, pullTo: [16, 8],
    hp: 1200, atk: 125, armor: 12, mres: 12, stepMs: 99999, atkMs: 1700, xp: 120, gold: 0, kind: "static", reach: 2,
    loot: [["ventouse_geante", 0.4], ["encre_abysses", 0.2]],
  },
  gorgonne: {                                  // MINI-BOSS (nature) : la Pieuvre du Détroit
    name: "Gorgonne, la Pieuvre du Détroit", rarity: "legendaire", sea: true, swim: 1, boss: "gorgonne", big: true,
    hp: 9000, atk: 130, armor: 20, mres: 16, stepMs: 99999, atkMs: 1800, xp: 1200, gold: 0, kind: "static", reach: 2,
    loot: [["anneau_gorgonne", 0.35], ["parchemin_eau", 0.25], ["encre_abysses", 1], ["piece_or_ancienne", 0.1]],
  },
  gorgonne_tentacule: {
    name: "Tentacule de Gorgonne", rarity: "rare", sea: true, swim: 1,
    hp: 2000, atk: 110, armor: 14, mres: 12, stepMs: 99999, atkMs: 1500, xp: 40, gold: 0, kind: "static", reach: 1,
    loot: [],
  },
  heraut_noyes: {                              // boss de la Nuit des Noyés
    name: "Héraut des Noyés", rarity: "legendaire", sea: true, swim: 1, undead: true, captain: true, big: true,
    hp: 15000, atk: 140, armor: 20, mres: 16, stepMs: 360, atkMs: 1500, xp: 1500, gold: 0, kind: "chase",
    loot: [["voile_spectrale", 0.1], ["piece_or_ancienne", 0.2], ["ectoplasme", 1]],
  },
  leviathan: {                                 // le passage du Léviathan (événement mondial)
    name: "Le Léviathan", rarity: "ultime", sea: true, swim: 1, boss: "leviathan", big: true,
    hp: 40000, atk: 150, armor: 22, mres: 18, stepMs: 99999, atkMs: 2200, xp: 0, gold: 0, kind: "static", reach: 3,
    loot: [],
  },
  isolde_rivale: {                             // Isolde Ventfort, trahie (quête « Trois éclats, deux voleurs »)
    name: "Isolde Ventfort", rarity: "epique", sea: true, swim: 2, doubleHit: true, fleeAt: 0.15,
    hp: 4000, atk: 125, armor: 18, mres: 14, stepMs: 240, atkMs: 1300, xp: 400, gold: 0, kind: "chase",
    loot: [["piece_or_ancienne", 0.5], ["perle_noire", 0.3]],
  },
  ronan_duel: {                                // Ronan Hameçon, en duel
    name: "Ronan Hameçon", rarity: "rare", sea: true, swim: 2,
    hp: 1400, atk: 80, armor: 10, mres: 8, stepMs: 300, atkMs: 1400, xp: 120, gold: 0, kind: "chase",
    loot: [["dent_requin", 1]],
  },
  sel_guerande: {                              // le chef des contrebandiers (planque de l'Île au Paf)
    name: "Sel-de-Guérande", rarity: "rare", sea: true, saltBlind: 1500, doubleHit: true,
    hp: 2200, atk: 112, armor: 18, mres: 10, stepMs: 300, atkMs: 1400, xp: 170, gold: 0, kind: "chase",
    loot: [["cle_planque", 0.5], ["cristal_sel_marin", 0.6], ["sel", 1], ["piece_or_ancienne", 0.05]],
  },
};

// Où apparaissent les monstres : "colonne,ligne" de la zone  →  quels monstres, et combien au maximum en même temps
//   area (facultatif) = rectangle où ils restent (x, y, largeur, hauteur en cases)
//   rate (facultatif) = apparitions plus rapides (2 = deux fois plus vite) · nightRate / nightMax = pareil, mais la nuit
export const MONSTER_ZONES = {
  "2,3":  [{ type: "sanglier", max: 3 }, { type: "faucon", max: 2 }],                  // Sentier animalier (Cité royale)
  "3,4":  [{ type: "loup_maudit", max: 3 }, { type: "champignon_rampant", max: 2 }, { type: "fee_farceuse", max: 2 }],   // Forêt des elfs (nord)
  "1,5":  [{ type: "loup_maudit", max: 2 }, { type: "champignon_rampant", max: 2 }, { type: "fee_farceuse", max: 2 }],   // Forêt des elfs (ouest)
  "0,5":  [{ type: "sanglier", max: 3 }, { type: "faucon", max: 2 }],                  // Sentier forestier (Cité royale)
  "4,3":  [{ type: "sanglier", max: 2 }, { type: "faucon", max: 2 }],   // Côte de Balné : Forêt
  "5,3":  [{ type: "sanglier", max: 2 }, { type: "faucon", max: 1 }],                                       // Sentier forestier (Balné)
  "7,3":  [{ type: "crabe_geant", max: 4 }, { type: "mouette_enragee", max: 2 }],                                                                // Plage
  "4,4":  [{ type: "loup_maudit", max: 3 }, { type: "fee_farceuse", max: 1 }, { type: "gardien_mousse", max: 2 }],   // Forêt hantée
  "5,4":  [{ type: "loup_maudit", max: 2 }, { type: "champignon_rampant", max: 2 }, { type: "fee_farceuse", max: 1 }],                    // Forêt moussue
  "6,4":  [{ type: "sanglier", max: 3 }],                                                                   // Champs d'oranger
  "7,4":  [{ type: "chauve_souris", max: 6, group: 3 }, { type: "mouette_enragee", max: 2 }],   // chauves-souris : par groupes de 3                                                              // Caverne au crâne
  "4,5":  [{ type: "gardien_mousse", max: 2 }, { type: "champignon_rampant", max: 2 }, { type: "loup_maudit", max: 1 }],   // Forêt profonde (ouest)
  "5,5":  [{ type: "loup_maudit", max: 3 }, { type: "ourse_geante", max: 1 }],
  "7,5":  [{ type: "thaloryn", max: 0 }],
  "202,0": [{ type: "frere_ours", max: 0 }],
  "203,0": [{ type: "millepattes", max: 0 }],                                                                // l'antre de la Tanière sombre (Marais de Spilburg)
  "-2,6":  [{ type: "loup_maudit", max: 2 }, { type: "sanglier_corrompu", max: 2 }, { type: "corbeau", max: 2 }],   // Forêt des corbeaux
  "-1,6":  [{ type: "loup_maudit", max: 3 }, { type: "sanglier_corrompu", max: 2 }],                         // Tanière sombre                                                                 // l'antre de la Tanière de la forêt (il n'apparaît qu'avec la mission)                                                                   // Cœur de la forêt : Thaloryn (apparaît après la cinématique)                                                                // Tanière de la forêt
  "6,5":  [{ type: "fee_farceuse", max: 2 }, { type: "champignon_rampant", max: 2 }, { type: "gardien_mousse", max: 2 }],  // Forêt profonde (est)
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
  "-1,-2": [{ type: "renard_neiges", max: 3 }],
  // ----- Montagnes glacées -----
  "0,-1":  [{ type: "loup", max: 2 }, { type: "faucon", max: 2 }],                                          // Chemin de la brise (peu de neige : loups et faucons)
  "1,-1":  [{ type: "renard_neiges", max: 3 }, { type: "lievre", max: 4 }],                                 // Porte du mont gelé (les renards chassent les lièvres)
  "3,-1":  [{ type: "lievre", max: 3 }, { type: "loup_neiges", max: 2 }],                                   // Champs de patates
  "0,-2":  [{ type: "loup_neiges", max: 4, group: 2 }, { type: "ours_hiver", max: 1 }, { type: "elan", max: 2 }, { type: "wendigo", max: 0, nightMax: 1, rate: 0.5 }],   // Forêt enneigée du nord (le Wendigo : la nuit)
  "1,-2":  [{ type: "renard_neiges", max: 2 }, { type: "lievre", max: 3 }],                                 // Clairière gelée (+ esprits du lac : nuit + aurore boréale)
  "2,-2":  [{ type: "golem_glace", max: 2 }, { type: "aigle_cimes", max: 2 }],                              // Falaise glacée
  "3,-2":  [{ type: "yeti", max: 1 }, { type: "esprit_blizzard", max: 3 }, { type: "geant_givre", max: 1, rate: 0.5 }, { type: "wendigo", max: 0, nightMax: 1, rate: 0.5 }],   // Sentier du mont maudit
  "0,-3":  [{ type: "loup_neiges", max: 2, group: 2 }, { type: "esprit_blizzard", max: 2 }],                // Hutte du shaman
  "1,-3":  [{ type: "mammouth", max: 3 }, { type: "elan", max: 2 }, { type: "lievre", max: 2 }, { type: "renard_neiges", max: 1 }],   // Plaine gelée
  "2,-3":  [],                                                                                             // Forteresse viking (l'arène : voir index.html)
  "3,-3":  [{ type: "ours_polaire", max: 2 }, { type: "draugr", max: 2, nightMax: 4, nightRate: 2 }],       // Banquise
  "270,0": [{ type: "golem_glace", max: 1 }, { type: "esprit_blizzard", max: 2 }],                         // Caverne de glace                                          // Cole de Faimur
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
  // ----- Mer agitée (v1.61) -----
  "8,3":  [{ type: "meduse_lanterne", max: 2, nightMax: 4 }, { type: "mouette_voleuse", max: 2 }, { type: "crabe_brisants", max: 2 }],                       // Mer nord-ouest (niveau le plus bas)
  "10,3": [{ type: "requin_marteau", max: 2 }, { type: "mouette_voleuse", max: 2 }, { type: "meduse_lanterne", max: 1, nightMax: 3 }],                      // Mer nord-est
  "11,3": [{ type: "garde_corail", max: 2 }, { type: "crabe_ermite", max: 2 }, { type: "mante_corail", max: 1 }],                                            // Récif de corail
  "8,4":  [{ type: "poisson_aiguille", max: 3 }, { type: "mouette_voleuse", max: 1 }, { type: "calmar_encre", max: 1 }],                                    // Mer ouest
  "9,4":  [{ type: "calmar_encre", max: 2 }, { type: "sirene_noire", max: 1 }, { type: "noye", max: 0, nightMax: 3 }, { type: "meduse_lanterne", max: 0, nightMax: 2 }, { type: "ombre_equipage", max: 0, nightMax: 1 }],   // Mer agitée
  "10,4": [{ type: "requin_marteau", max: 2 }, { type: "calmar_encre", max: 2 }, { type: "raie_electrique", max: 1 }, { type: "serpent_de_mer", max: 1 }, { type: "sirene_noire", max: 0, nightMax: 1 }],   // Mer est
  "11,4": [{ type: "pieuvre_grotte", max: 2 }, { type: "serpent_de_mer", max: 1 }, { type: "gardien_pierre", max: 1 }],                                    // Détroit
  "8,5":  [{ type: "bernard_coco", max: 3 }, { type: "loutre_chapardeuse", max: 2 }, { type: "mouette_voleuse", max: 1 }, { type: "rat_cale", max: 0, nightMax: 3 }, { type: "contrebandier", max: 0, nightMax: 2 }],   // Île au Paf
  "9,5":  [{ type: "crabe_ermite", max: 2 }, { type: "loutre_chapardeuse", max: 2 }, { type: "poisson_aiguille", max: 2 }, { type: "crabe_brisants", max: 2 }, { type: "crabe_forteresse", max: 1 }],   // Mer sud
  "10,5": [{ type: "noye", max: 3, nightMax: 6 }, { type: "anguille_fantome", max: 2 }, { type: "crabe_squelette", max: 1 }, { type: "capitaine_noye", max: 0, nightMax: 1 }],   // Cimetière de navires
  "11,5": [{ type: "tentacule_tourbillon", max: 4, area: { x: 12, y: 4, w: 9, h: 9 } }, { type: "raie_electrique", max: 2 }, { type: "calmar_encre", max: 1 }],                                 // Tourbillon néfaste
  "330,0": [{ type: "rat_cale", max: 4 }],                                                                                                                 // cave de Corvin
  "331,0": [{ type: "anguille_fantome", max: 2 }, { type: "pieuvre_grotte", max: 1 }],                                                                     // grotte marine du Corbeau
  "332,0": [{ type: "gardien_pierre", max: 2 }],                                                                                                           // Sanctuaire des Colonnes
  "333,0": [{ type: "ombre_equipage", max: 0 }],                                                                                                           // trésor de Barbe-Grise (vagues)
  "334,0": [{ type: "garde_corail", max: 2 }],                                                                                                             // jardins d'Ondalie
  "335,0": [{ type: "contrebandier", max: 3 }, { type: "sel_guerande", max: 1 }],                                                                          // planque des contrebandiers
  "336,0": [{ type: "anguille_fantome", max: 1 }, { type: "crabe_squelette", max: 1 }],                                                                     // épave engloutie
};

// Cases où se tiennent les 3 brigands dans la cachette [x, y]
export const BRIGAND_SPOTS = [[8, 5], [15, 10], [16, 6]];
