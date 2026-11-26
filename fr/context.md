# Contexte pour traduire Azur Promilia

À lire avant de traduire un lot. Les noms et les termes sont dans `glossary.tsv`, à côté de ce fichier. Ce qui suit vient du texte du jeu lui-même (client japonais 1.0.2) et des présentations officielles ; ce qui n'est pas confirmé est signalé comme tel.

## Le jeu

Azur Promilia est un RPG en monde ouvert de Manjuu, le studio d'Azur Lane, sorti le 26 novembre 2026 en Chine, au Japon, en Corée et à Taïwan. Le jeu mêle exploration, combat d'équipe en temps réel, une ferme à cultiver et des créatures à apprivoiser. La version anglaise officielle est annoncée pour l'été 2027 : en attendant, l'anglais de l'amont est une traduction de fans, faite d'abord par IA puis relue en partie. Il sert de repère, jamais de source.

Le ton général est doux et lumineux, proche d'un conte : on soigne, on cultive, on se lie aux Kibo. Les combats et le Culte de l'Évolution apportent la part sombre, sans que le jeu devienne cru.

## Le monde

- Promilia est le continent où tout se passe. Plusieurs peuples y vivent : Elfes (dont les Elfes des bois), Ailés (翼人, qui ont des ailes), Peuple-bête (獣人, dont le clan des Loups), Pammy, dragons.
- Le Karma (カルマ) est la force de vie qui traverse le monde. Les plantes qui en absorbent trop deviennent rares et lumineuses ; les adeptes du Culte font apparaître des cercles de Karma autour de leurs poignets.
- La Sunya (スーニヤ) est la force du néant, opposée au Karma. L'Érosion de Sunya ronge les êtres vivants et les blessures.
- Les Kibo (キボ) sont les créatures natives de Promilia. Ils transportent les marchandises entre les villages, vivent dans les forêts, deviennent des compagnons. Le Lien stellaire (スターリンク) permet de s'attacher un Kibo.
- Les Bêtes maudites (凶獣, « Fiend » en anglais) sont des monstres hostiles. Un tournoi de chasse aux Bêtes maudites a lieu à Fleece.
- Le Culte de l'Évolution (進化教団) est l'adversaire : il capture des Kibo et se sert de Bêtes maudites. Ses fidèles portent des masques d'animaux. Les Ailés et le Peuple-bête s'allient contre lui.
- Yggdrasil est l'arbre sacré. Les Elfes le prient (« Mère Yggdrasil »), ses jeunes pousses grandissent au Jardin d'Evergreen, que garde la jardinière Metsa.
- Les lieux du début : la Vallée des Bourgeons (芽吹の谷), le Village de Charlulu, puis la ville de Fleece, où un seigneur tient son manoir. L'Empire de Rosia est un pays plus lointain.
- La monnaie s'appelle Uni (ユニ). Le tirage se dit Observation (観測).
- Neuf éléments : Feu, Eau, Vent, Foudre, Terre, Bois, Glace, Lumière, Ténèbres.

## Le personnage du joueur

Le joueur est 星臨者 (« Starborn » en anglais), un être venu des étoiles, attendu par une prophétie. Le jeu ne fixe pas son genre : l'anglais emploie « they ». En français, il faut des tournures épicènes. Aucun mot qui le concerne ne s'accorde en genre : au lieu de « merci d'être venu », on écrit « merci de ta venue », et on évite le point médian. La variable `{playerName}` donne son nom ; elle reste telle quelle.

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
- Mitty : une Ailée qui a peur de voler ; ses ailes trahissent ce qu'elle ressent.
- Luruka, Terara, Abby (qui a aussi une forme de dragon), Metsa, Shal, Maple (réceptionniste de la Guilde des aventuriers), Tushan Xiaoyu : voir le glossaire.

## Le registre : tu ou vous

Le japonais marque la politesse par la forme des verbes et par les suffixes, le français par le tutoiement. Règle de départ :
- un personnage qui emploie les formes polies (です・ます, さま) avec le joueur le vouvoie ;
- le langage familier, les enfants et Lumi tutoient ;
- le joueur, quand ses choix de réponse s'adressent à un personnage, suit le registre de celui-ci.

Une fois choisi pour un personnage, le registre ne change plus, sauf si l'histoire le fait évoluer (rapprochement, dispute) : le noter alors dans ce fichier.

## Règles d'écriture

- Traduire depuis le japonais. L'anglais sert à comprendre une ligne ambiguë, à vérifier un nom officiel, pas à être retraduit.
- Les variables (`{0}`, `{playerName}`, `%s`) et les balises (`<color=…>`, `<b>`, `<actionkey>`…) restent identiques et à la même place logique dans la phrase. L'outil refuse la ligne sinon.
- Les menus sont étroits : le français est en général plus long que l'anglais. Pour les statistiques, les abréviations habituelles des jeux en français : ATQ, DÉF, PV, Taux CRIT, DGT CRIT.
- Les répliques gardent les hésitations et onomatopées du japonais sous une forme française naturelle (うっ, rendu « Ugh » en anglais, devient « Aïe » ou « Argh » selon le contexte).
- Les noms propres officiels restent ceux du glossaire. Un terme marqué `proposed` peut encore changer : l'employer quand même, pour pouvoir tout remplacer d'un coup s'il change.
- La typographie française (« », espaces insécables, apostrophe ’) dépend du test de la police du jeu, pas encore fait. D'ici là : guillemets « » sans espace insécable, apostrophe droite '.

## Décisions à prendre

- Le nom du joueur (星臨者) : « Enfant des étoiles » est proposé, à valider.
- Shal ou Shalle, Ailés, Peuple-bête, Bêtes maudites : propositions à valider.
- La typographie, après le test des accents en jeu.
