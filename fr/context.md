# Contexte pour traduire Azur Promilia

À lire avant de traduire un lot. Les noms et les termes sont dans `glossary.tsv`, à côté de ce fichier. Ce qui suit vient du texte du jeu lui-même (client japonais 1.0.2) et des présentations officielles ; ce qui n'est pas confirmé est signalé comme tel.

## Le jeu

Azur Promilia est un RPG en monde ouvert de Manjuu, le studio d'Azur Lane, sorti le 26 novembre 2026 en Chine, au Japon, en Corée et à Taïwan. Le jeu mêle exploration, combat d'équipe en temps réel, une ferme à cultiver et des créatures à apprivoiser. La version anglaise officielle est annoncée pour l'été 2027 : en attendant, l'anglais de l'amont est une traduction de fans, faite d'abord par IA puis relue en partie. Il sert de repère, jamais de source.

Le ton général est doux et lumineux, proche d'un conte : on soigne, on cultive, on se lie aux Kibo. Les combats et le Culte de l'Évolution apportent la part sombre, sans que le jeu devienne cru.

## Le monde

- Promilia est le continent où tout se passe. Plusieurs peuples y vivent : Elfes (dont les Elfes des bois), Furriens (獣人, « Furrian » en anglais officiel), dont les Ailés (翼人) sont une branche, Draconiens (竜人, « Dragonborn »), Pammy. Les clans de Furriens portent des noms d'animaux : clan des Loups, et Terara hurle comme un loup.
- Le Karma (カルマ) est la force de vie qui traverse le monde. Les plantes qui en absorbent trop deviennent rares et lumineuses ; les adeptes du Culte font apparaître des cercles de Karma autour de leurs poignets.
- La Sunya (スーニヤ) est la force du néant, opposée au Karma. L'Érosion de Sunya ronge les êtres vivants et les blessures.
- Les Kibo (キボ) sont les créatures natives de Promilia. Ils transportent les marchandises entre les villages, vivent dans les forêts, deviennent des compagnons. Le Lien stellaire (スターリンク) permet de s'attacher un Kibo.
- Les Bêtes maudites (凶獣, « Fiend » en anglais) sont des monstres hostiles. Un tournoi de chasse aux Bêtes maudites a lieu à Fleece.
- Le Culte de l'Évolution (進化教団) est l'adversaire : il capture des Kibo et se sert de Bêtes maudites. Ses fidèles portent des masques d'animaux. Les Ailés et les autres Furriens s'allient contre lui.
- Yggdrasil est l'arbre sacré. Les Elfes le prient (« Mère Yggdrasil »), ses jeunes pousses grandissent au Jardin d'Evergreen, que garde la jardinière Metsa.
- Les Esprits anciens (御霊さま, « Elder Spirits » en anglais officiel) veillent sur le village de Charlulu ; les Furriens les prient et invoquent leur protection.
- Les lieux du début : la Vallée des Bourgeons (芽吹の谷), le Village de Charlulu, puis la ville de Fleece, où un seigneur tient son manoir. L'Empire de Rosia est un pays plus lointain.
- La monnaie s'appelle Uni (ユニ). Le tirage se dit Observation (観測).
- Neuf éléments : Feu, Eau, Vent, Foudre, Terre, Bois, Glace, Lumière, Ténèbres.

## Le personnage du joueur

Le joueur est 星臨者 (« Starborn » en anglais officiel), un être venu des étoiles, attendu par une prophétie. On le joue en version masculine ou féminine, mais le texte japonais est le même pour les deux, et le patcher ne remplace qu'un texte par un autre : une seule traduction doit convenir aux deux. En français, on traduit donc par « Enfant des étoiles » (épicène) et rien de ce qui le désigne ne s'accorde en genre : on écrit « merci de ta venue » et non « merci d'être venu », sans point médian. La variable `{playerName}` donne son nom ; elle reste telle quelle.

Les personnages l'appellent de différentes façons, et le français doit garder la nuance :
- 星臨者さま : respectueux (Symphoria) ;
- 星臨者さん : poli, plus simple ;
- せーりんしゃ : un enfant qui écorche le mot.

## Les personnages et leur façon de parler

Seuls les traits relevés dans le texte du jeu sont notés ici. Un personnage garde le même registre d'un bout à l'autre du jeu : avant de traduire ses répliques, chercher comment il a déjà été traduit (`node scripts/fr.mjs todo --grep <nom>`).

- Lumi : la fée qui accompagne le joueur. Vive, fière, elle parle d'elle à la troisième personne et se donne le titre de « Grande Fée » (« la grande Lumi ! »). Elle s'agace qu'on la prenne pour un Kibo.
- Symphoria : archère elfe, sérieuse et polie. Elle vouvoie le joueur.
- Peipei : une Pammy, traitée comme une enfant par les autres. Elle parle d'elle à la troisième personne (« Peipei est contente »).
- Chiyo : finit ses phrases par un tic félin (にゃ). On garde « nya ».
- Anais : infirmière au sanatorium Carnon, très formelle au point de s'en excuser.
- Mitty : une Ailée qui a peur de voler ; ses ailes trahissent ce qu'elle ressent. Elle vit mal d'apprendre que les Ailés sont, au fond, des Furriens.
- Luruka : Furrienne douce, guérisseuse autodidacte du village de Charlulu, dont les remèdes ont un goût terrible.
- Terara : Furrienne du clan des Loups, la meilleure chasseuse de Charlulu, qui ne s'impressionne de rien.
- Abby : jeune Draconienne qui peut passer de la forme humaine à la forme de dragon ; elle parle d'elle à la troisième personne et veut être « une gentille fille ».
- Metsa, Shalle, Maple (réceptionniste de la Guilde des aventuriers), Tushan Xiaoyu : voir le glossaire.

## Le registre : tu ou vous

Le japonais marque la politesse par la forme des verbes et par les suffixes, le français par le tutoiement. Règle de départ :
- un personnage qui emploie les formes polies (です・ます, さま) avec le joueur le vouvoie ;
- le langage familier, les enfants et Lumi tutoient ;
- le joueur tutoie tout le monde, comme en japonais où il parle familièrement à chacun, même aux personnages qui le vouvoient (échange « vous / tu »). Décidé le 26/11/2026.

Une fois choisi pour un personnage, le registre ne change plus, sauf si l'histoire le fait évoluer (rapprochement, dispute) : le noter alors dans ce fichier.

## Registres établis

Relevés dans les dialogues déjà traduits. Un traducteur les applique tels quels ; un cas nouveau s'ajoute ici.

- Lumi tutoie tout le monde et parle d'elle à la troisième personne (« la grande Lumi », « la Grande Fée »).
- Symphoria (surnom « Chiffon ») vouvoie le joueur et les PNJ.
- Le joueur tutoie tout le monde, y compris ceux qui le vouvoient.
- Tutoient : Terara, Mitty, Komugi, Ruby, Lily, Han Youyou, Xiaoyu (« renarde céleste »), Peipei (à la troisième personne), Maple (« nya »), le Chef du village, le Seigneur Faucon, Joy, Gladia, le boulanger.
- Vouvoient : Shiroro, Chilul, Lan Xiangzi, Sans-Nom (« Sire Sans-Nom »), Nanacha (« Mademoiselle » pour Komugi), l'infirmière, les compagnies Tianjiang et Goyard.
- Lan Xiangzi enfant et son père, Abby (phrases d'enfant), Peipei : parlent d'eux à la troisième personne.
- Chiyo : « Dame Chiyo », vouvoie le joueur, finit ses phrases par « nya ».
- Le joueur est appelé « Âme chevaleresque » (侠客さん), « duelliste » (ファイターさん), « jeune pousse » par les anciens : jamais une forme accordée.
- Le Renard céleste à neuf queues (妾 / 汝) : une femme hautaine au ton archaïque, qui tutoie ; accords au féminin.
- Ning Lang : tic « aru » en fin de phrase (アル) ; tutoie le joueur, vouvoie Jiang Li et Leon.
- Vouvoient aussi : Jiang Li, Polly, Francisco, Lulu, le marchand de Pat. Tutoient aussi : Rosa, Larin, Kirk, Wright, Kiri, Fajeto, Barrett, Penny, Ral, Ronald.
- L'aide de la ferme (オイラ) appelle le joueur « Chef » (ボス).
- Faridah est une femme (la plus jeune Seigneur Faucon de l'histoire) : accords au féminin.
- Luruka vouvoie le joueur. Popoi, Francisco, Ariana, l'employé de la Compagnie Tianjiang vouvoient le joueur. Momo, Enkaku, le boucher, Joy, Elro, Tinana, Libby tutoient.
- Abby dit « Enfant des étoiles » sans déformation (せーりんしゃ).
- Vouvoient aussi : Tiffy, Rani et Seal (pêcheurs), le parfumeur, la libraire d'Iton, la servante du manoir, l'employée de la poste. Tutoient aussi : Metsa, Lyrica (une Pammy, au féminin), Mamie Gumina, Mamie Ruma, Akuri, Rock, Sol, Tinana.
- Vouvoient aussi : Juriri (couturière, appelle Lumi « Dame Fée »), Regera (envers le capitaine Ral). Tutoient aussi : Katalua, la femme en noir (« Évêque » pour le Culte), le spectre de Veka Shulaga (ton archaïque et hautain).
- Symphoria vouvoie Metsa (« Sœur Metsa ») ; Luruka tutoie Terara (« grande sœur ») et vouvoie « Dame Lumi ».
- Tana, la lune, est au féminin.
- Vouvoient aussi : Sarara, Ahi, Kiara et la milice des Ailés, Prospero, Shia, Millie, Noomi. Tutoient aussi : Kirk, Guug, Nell, Lian, Ernest, Eva, Warwick, Roxana, Mamie Lisa (« jeune pousse »). Norma parle d'elle à la troisième personne.
- Luruka vouvoie Metsa, qui la tutoie. Charlulu et Tana (la louve, au féminin) se tutoient.
- Seekrid (masculin) tutoie le joueur. Rudalis l'appelle « mon souverain » et le vouvoie ; Seekrid le tutoie. Rudalis tutoie la chamane et vouvoie le groupe.
- Mitty vouvoie Faridah, qui la tutoie. Le Chef du village et Faridah se tutoient.
- Zaha tutoie le joueur, avec mépris. L'évêque du Culte le tutoie ; 星臨者ちゃん = « Enfant des étoiles, mon chou ».
- La narration des actions du joueur est à la 2e personne du pluriel (« Vous avez saisi… »).

## Règles d'écriture

- Traduire depuis le japonais. L'anglais sert à comprendre une ligne ambiguë, à vérifier un nom officiel, pas à être retraduit.
- Les variables (`{0}`, `{playerName}`, `%s`) et les balises (`<color=…>`, `<b>`, `<actionkey>`…) restent identiques et à la même place logique dans la phrase. L'outil refuse la ligne sinon.
- Les menus sont étroits : le français est en général plus long que l'anglais. Pour les statistiques, les abréviations habituelles des jeux en français : ATQ, DÉF, PV, Taux CRIT, DGT CRIT.
- Les répliques gardent les hésitations et onomatopées du japonais sous une forme française naturelle (うっ, rendu « Ugh » en anglais, devient « Aïe » ou « Argh » selon le contexte).
- Les noms propres restent ceux du glossaire. Quand l'anglais officiel (site, X @AzurPromilia_EN) et l'anglais des fans diffèrent, l'officiel l'emporte : il est noté dans la colonne `en` du glossaire.
- Typographie : on écrit des espaces ordinaires avant ! ? : ; et à l'intérieur des « », l'apostrophe droite ' et le caractère … (aussi pour ……). `build` les remplace par l'espace insécable U+00A0. Testé en jeu le 26/11/2026 : la police affiche les accents (É À Ç é è à ç œ), les « » et l'insécable U+00A0, mais pas l'espace fine U+202F, qui sort en carré : ne jamais l'employer.
- Titres de succès et de rang qui désignent le joueur : tournures sans accord (« As des combos », « Terreur des grottes »).
- Noms de Kibo et de boss : ceux de l'anglais, invariables (Staray, Cabbird, Kingraga…). Plusieurs sont confirmés par le site officiel.

## Décisions prises

Arrêtées le 26/11/2026, faute de version française officielle, à partir de l'anglais officiel quand il existe.

- Le joueur (星臨者) : « Enfant des étoiles », épicène.
- Les peuples : Furriens (獣人), Ailés (翼人), Draconiens (竜人), d'après les noms officiels anglais Furrian et Dragonborn.
- Shalle, et non Shal : c'est le nom officiel (Shalle Ensys).
- Les monstres (凶獣) : Bêtes maudites.
- Les Esprits anciens (御霊さま).

Reste ouvert : le sens exact de 精鬼族.
