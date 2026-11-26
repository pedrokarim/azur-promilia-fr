# Azur Promilia en français : brief des agents

Ce dépôt traduit en français le client PC japonais d'Azur Promilia. Il est forké de promiliafans/i18n, qui fournit le japonais et une traduction anglaise de fans.

## À lire avant de traduire

1. `fr/context.md` : l'univers, le personnage du joueur, les personnages et leur registre, les règles d'écriture.
2. `fr/glossary.tsv` : noms et termes, avec leur statut (`official` : nom officiel conservé, `client` : nom affiché par le jeu, `proposed` : proposition à valider, `approved` : validé).
3. `.github/README.md` : l'organisation du dépôt et les commandes.

## Règles

- On ne modifie jamais `strings.translatable.jsonl` : c'est le fichier amont.
- Le français entre uniquement par `node scripts/fr.mjs import <fichier>`, qui vérifie chaque ligne. On n'écrit pas à la main dans `fr/strings.fr.jsonl`.
- Traduire depuis le japonais (`jp`). L'anglais (`en`) aide à comprendre, il n'est pas la source.
- Les termes listés dans le champ `terms` d'une ligne de travail s'emploient tels quels.
- Variables et balises identiques au japonais, sinon la ligne est refusée.
- Une décision de traduction nouvelle (registre d'un personnage, terme absent du glossaire) s'ajoute au glossaire ou à `fr/context.md` avec le statut `proposed`, et se signale dans le compte rendu. Ne jamais passer un terme en `approved` : c'est le mainteneur qui valide.
- Avant de rendre un lot : `node scripts/fr.mjs check` doit finir sans erreur.

## Découper le travail entre plusieurs agents

Chaque agent reçoit un lot distinct, tiré par `todo` avec un `--grep` ou une tranche différente, et l'écrit dans son propre fichier de `work/`. Un personnage ou une quête se traduit d'un seul tenant par le même agent, pour que le registre reste cohérent. L'import se fait lot par lot, puis `check`.

## Git

- Messages de commit en français, sans signature ni co-auteur d'assistant.
- Ne jamais toucher à la configuration git (`user.name`, `user.email`) : celle de la machine s'applique.
- Les fichiers de `work/` et `dist/` ne se commitent pas (ils sont ignorés).
