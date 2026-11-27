# Maintenance des menus fixes d’Azur Promilia

Le client japonais lit le texte principal dans le pool `VStringPool` de `raw_base_package`. Il lit aussi des libellés dans la table Unity `Assets/ResourcesLang/jp/UI/StaticText/ast_staticTextKeyConfig.asset`. Un même texte peut se trouver aux deux endroits. Le badge « Essai » et le bouton « Réinitialiser » ont servi de repères pour distinguer ces deux sources.

## Retrouver la table après une mise à jour

1. Lire le dernier manifeste `.bytes` de `.res/default_package/ManifestFiles` et vérifier son MD5 avec le fichier `.hash`. Une archive d’un build précédent peut encore être présente dans `BundleFiles` ou dans une sauvegarde.
2. Chercher le fichier Unity interne `CAB-d373fa6fedc5b221683a433ac01d8eb0` dans le répertoire des blocs UnityFS. Ce répertoire restait lisible sur le build 3273853 malgré le chiffrement du contenu. Vérifier le nom d’archive, l’offset, la taille et les CRC dans le manifeste actif.
3. Lire la table originale avec UnityPy, la clé AES‑128 UnityCN et la signature de contrôle Manjuu. Le lecteur du pool principal utilise une clé AES‑256 différente. Un test effectué avec la signature UnityCN standard peut rejeter la bonne clé. Les détails d’accès à la clé sont conservés dans les notes locales.
4. Comparer les clés et les textes japonais entre les deux builds. Garder les traductions dont le texte source est identique, réviser celles dont le sens a changé et vérifier les balises, variables et valeurs vides.

## Reconstruire et vérifier

Remplacer la table dans le bundle actuel puis compresser le bundle. Compléter l’emplacement avec des octets nuls jusqu’à sa taille d’origine pour conserver les offsets des archives suivantes. Relire la table reconstruite et vérifier que les octets hors de son emplacement sont identiques à ceux du jeu.

Pour le pack de la couche de mise à jour, recalculer le CRC du segment Unity et celui de l’archive dans le manifeste. Sur ce build, le CRC du segment se trouve à l’offset 8 d’un enregistrement `Bundle` de 56 octets. Celui de l’archive se trouve à l’offset 44 d’un enregistrement `PackRes` de 48 octets. Recalculer le MD5 du manifeste.

Tester l’archive, le manifeste et le fichier `.hash` ensemble sur une copie du jeu. À partir de la 1.2.1, le patcher distribue le segment Unity traduit dans `static-fr/menu.bundle` et ses repères dans `static-fr/menu-patch.json`. Il vérifie le SHA‑256 de l’archive d’origine et les CRC du manifeste actif, puis reconstruit les trois fichiers sur place.

Le client possède aussi une copie intégrée dans `StreamingAssets/.res/default_package`. Elle a son propre manifeste. Le pack de la couche de mise à jour ne couvre que cette couche. Un libellé japonais sur un écran qui charge la copie intégrée demande une vérification distincte.

## Repères du build 3273853

- Ancienne archive `yr49bxop0f3reujfsmyfca.r`.
- Archive active `h3y7ujukwn9qbhoqhzkkg.r`, segment à l’offset 420 062, emplacement de 83 081 octets.
- Comparaison des deux originaux japonais : 51 entrées modifiées, 3 516 entrées non vides inchangées et 6 entrées vides. Les 3 573 clés sont les mêmes.
- Les 51 entrées modifiées sont conservées dans `fr/static-ui-3273853.fr.jsonl`. Les autres traductions viennent de `fr/static-ui.fr.jsonl`.

Le champ japonais de l’ancien fichier de suivi était souvent obtenu par rapprochement avec l’anglais. Les écarts entre ce champ et un catalogue tiers ne donnent pas le nombre de changements du jeu. Le décompte de 51 vient de la comparaison des deux bundles japonais originaux.
