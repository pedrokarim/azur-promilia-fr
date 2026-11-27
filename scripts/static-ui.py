#!/usr/bin/env python3
"""Pack d'interface statique d'Azur Promilia en français.

Le jeu lit les libellés fixes de ses menus (boutons, onglets, consignes) dans une table Unity,
`ast_staticTextKeyConfig` (classe `StaticTextConfig`), rangée dans un AssetBundle de
`default_package`. Ce bundle n'est pas dans le pool de chaînes que traduit
`strings.translatable.jsonl` : les fans en ont fait une version anglaise, que le patcher
installe à part (« static-UI pack »). Ce script en tire la table de textes et refait un pack
français à partir du pack anglais.

Le fichier `.r` du jeu met bout à bout plusieurs bundles UnityFS. Le manifeste du jeu les
retrouve par leur position : le bundle modifié doit donc garder sa place et sa taille. Le
pack anglais respecte déjà cette règle (bundle non chiffré, compressé en LZMA, complété par
des zéros). Le pack français la suit de la même façon.

Commandes :
  extract <pack.r>            met à jour fr/static-ui.fr.jsonl depuis le pack anglais
                              (garde le français déjà écrit, clé par clé)
  check                       vérifie fr/static-ui.fr.jsonl (code de sortie 1 en cas d'erreur)
  build <pack.r> <dossier>    écrit le pack français et son files.txt dans <dossier>, puis le relit
  verify <pack.r> <pack-fr.r> relit le pack français et le compare au pack anglais

Dépendance : UnityPy (`pip install UnityPy`), dans un venv. Lancer Python avec `-I`.
Le pack anglais est `data/static/yr49bxop0f3reujfsmyfca.r` dans le dossier du patcher. Ce
dépôt ne contient aucun fichier du jeu : seulement la table de textes.
"""

import json
import re
import struct
import sys
import warnings
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TABLE_FILE = ROOT / 'fr' / 'static-ui.fr.jsonl'
UPSTREAM_FILE = ROOT / 'strings.translatable.jsonl'

# Le chemin du pack sous le dossier de données du jeu, tel que l'attend le files.txt du patcher.
GAME_PATH = '.res/default_package/BundleFiles/yr49bxop0f3reujfsmyfca.r'
PACK_NAME = 'yr49bxop0f3reujfsmyfca.r'
TABLE_NAME = 'ast_staticTextKeyConfig'
# Les bundles du jeu portent une version Unity masquée (« 5.x.x ») : celle du moteur du client.
UNITY_VERSION = '2022.3.62f3'
BUNDLE_SIGNATURE = b'UnityFS\0'
# Bit des drapeaux UnityFS qui signale le chiffrement UnityCN des bundles d'origine.
ENCRYPTED_FLAG = 0x400

# Mêmes variables et balises protégées que scripts/fr.mjs.
PROTECTED_TOKEN = re.compile(
    r'\{[A-Za-z0-9_]*\}|%[0-9.]*[sdf]|</?(?:color|b|i|size|actionkey|actionkeyhold|img|link|'
    r'cspace|pos|quake|shake|lbcenterDesc)\b[^>]*>'
)


def load_unitypy():
    try:
        import UnityPy
        import UnityPy.config
    except ImportError:
        sys.exit('UnityPy manque : pip install UnityPy (dans un venv), puis relancer avec python -I.')
    warnings.filterwarnings('ignore', module='UnityPy')
    UnityPy.config.FALLBACK_UNITY_VERSION = UNITY_VERSION
    return UnityPy


def read_jsonl(path):
    """Lit un JSONL ligne par ligne. Un texte collé après l'accolade (déjà vu en amont) est ignoré."""
    decoder = json.JSONDecoder()
    rows = []
    with open(path, encoding='utf-8', newline='') as f:
        for line in f.read().split('\n'):
            if line.strip():
                rows.append(decoder.raw_decode(line.strip())[0])
    return rows


def write_jsonl(path, rows):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + '\n')


def bundle_slots(data):
    """Les bundles UnityFS mis bout à bout dans le fichier : (début, fin de l'emplacement, taille utile, drapeaux)."""
    starts = [m.start() for m in re.finditer(re.escape(BUNDLE_SIGNATURE), data)]
    slots = []
    for i, start in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(data)
        # En-tête : signature, version (u32), deux chaînes terminées par 0, puis taille (i64),
        # tailles du bloc d'index (2 × u32) et drapeaux (u32), en gros-boutiste.
        pos = start + len(BUNDLE_SIGNATURE) + 4
        for _ in range(2):
            pos = data.index(b'\0', pos) + 1
        size, _, _, flags = struct.unpack('>qIII', data[pos:pos + 20])
        if 0 < size <= end - start:
            slots.append((start, end, size, flags))
    return slots


def find_table(UnityPy, data):
    """Trouve le bundle qui porte la table : (emplacement, environnement UnityPy, objet)."""
    for slot in bundle_slots(data):
        start, _, size, flags = slot
        if flags & ENCRYPTED_FLAG:
            continue
        env = UnityPy.load(data[start:start + size])
        for obj in env.objects:
            if obj.type.name == 'MonoBehaviour' and obj.peek_name() == TABLE_NAME:
                return slot, env, obj
    sys.exit(f'{TABLE_NAME} introuvable dans un bundle non chiffré : est-ce bien le pack anglais ?')


def tokens(text):
    return sorted(PROTECTED_TOKEN.findall(text))


def french_spacing(text):
    """Comme frenchSpacing de scripts/fr.mjs : insécables U+00A0 posées à la fabrication, « … » en trois points."""
    text = re.sub(r'\u2026{2,}|\.{3,}', '\u2026', text)
    text = re.sub(r'[\uff5e\u301c]', '~', text)
    text = re.sub(r'[ \u202f]+([!?:;»])', '\u00a0\\1', text)
    text = re.sub(r'«[ \u202f]+', '«\u00a0', text)
    return text.replace('\u2026', '...')


def errors_of(row):
    errors = []
    if row.get('fr') and tokens(row['fr']) != tokens(row['en']):
        errors.append(f"variables ou balises différentes de l'anglais : {tokens(row['en'])} / {tokens(row['fr'])}")
    if '\u202f' in row.get('fr', ''):
        errors.append("espace fine U+202F, que la police du jeu n'affiche pas")
    return errors


def jp_by_english():
    """Le japonais de l'amont, par texte anglais : le pack anglais a perdu le japonais d'origine."""
    found = {}
    if UPSTREAM_FILE.exists():
        for row in read_jsonl(UPSTREAM_FILE):
            if row.get('en') and row.get('jp'):
                found.setdefault(row['en'], set()).add(row['jp'])
    return {en: sorted(jps)[0] for en, jps in found.items() if len(jps) == 1}


def extract(pack):
    UnityPy = load_unitypy()
    _, _, obj = find_table(UnityPy, Path(pack).read_bytes())
    entries = obj.read_typetree()['list']
    old = {row['key']: row for row in read_jsonl(TABLE_FILE)} if TABLE_FILE.exists() else {}
    jp = jp_by_english()
    rows = []
    for entry in entries:
        previous = old.get(entry['key'], {})
        rows.append({
            'key': entry['key'],
            'jp': previous.get('jp') or jp.get(entry['value'], ''),
            'en': entry['value'],
            'fr': previous.get('fr', ''),
        })
    write_jsonl(TABLE_FILE, rows)
    done = sum(1 for row in rows if row['fr'])
    print(f'{TABLE_FILE} : {len(rows)} entrées, dont {done} en français.')


def check():
    rows = read_jsonl(TABLE_FILE)
    problems = [f"{row['key']} : {error}" for row in rows for error in errors_of(row)]
    for problem in problems:
        print(problem)
    done = sum(1 for row in rows if row.get('fr'))
    print(f'{len(rows)} entrées, {done} en français, {len(problems)} erreur(s).')
    return 1 if problems else 0


def french_values():
    """Le texte français final de chaque clé, tel qu'il ira dans le jeu."""
    return {row['key']: french_spacing(row['fr'])
            for row in read_jsonl(TABLE_FILE) if row.get('fr') and not errors_of(row)}


def build(pack, out_dir):
    UnityPy = load_unitypy()
    data = Path(pack).read_bytes()
    (start, end, _, _), env, obj = find_table(UnityPy, data)
    french = french_values()
    tree = obj.read_typetree()
    replaced = 0
    for entry in tree['list']:
        if entry['key'] in french:
            entry['value'] = french[entry['key']]
            replaced += 1
    obj.save_typetree(tree)
    bundle = next(iter(env.files.values())).save(packer='lzma')
    room = end - start
    if len(bundle) > room:
        sys.exit(f'Le bundle français fait {len(bundle)} octets pour un emplacement de {room} : raccourcir des textes.')
    out = data[:start] + bundle + bytes(room - len(bundle)) + data[end:]
    assert len(out) == len(data)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / PACK_NAME).write_bytes(out)
    with open(out_dir / 'files.txt', 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'{GAME_PATH}\t{PACK_NAME}\n')
    print(f'{out_dir / PACK_NAME} : {replaced} textes en français sur {len(tree["list"])}, '
          f'bundle de {len(bundle)} octets dans un emplacement de {room}.')
    return verify(pack, out_dir / PACK_NAME)


def describe(obj):
    return (obj.path_id, obj.type.name, obj.peek_name())


def verify(pack_en, pack_fr):
    """Relit le pack français : seules les valeurs de la table doivent différer du pack anglais."""
    UnityPy = load_unitypy()
    en_data, fr_data = Path(pack_en).read_bytes(), Path(pack_fr).read_bytes()
    problems = []
    (start, end, _, _), en_env, en_obj = find_table(UnityPy, en_data)
    fr_slot, fr_env, fr_obj = find_table(UnityPy, fr_data)
    if len(en_data) != len(fr_data):
        problems.append(f'taille du fichier : {len(en_data)} / {len(fr_data)}')
    if fr_slot[:2] != (start, end):
        problems.append('le bundle de la table a changé de place')
    if en_data[:start] != fr_data[:start] or en_data[end:] != fr_data[end:]:
        problems.append('des octets ont changé hors du bundle de la table')
    if [describe(o) for o in en_env.objects] != [describe(o) for o in fr_env.objects]:
        problems.append('les objets du bundle diffèrent')
    for en_o, fr_o in zip(en_env.objects, fr_env.objects):
        if en_o.path_id != en_obj.path_id and en_o.get_raw_data() != fr_o.get_raw_data():
            problems.append(f'{describe(en_o)} a changé')
    en_tree, fr_tree = en_obj.read_typetree(), fr_obj.read_typetree()
    if {k: v for k, v in en_tree.items() if k != 'list'} != {k: v for k, v in fr_tree.items() if k != 'list'}:
        problems.append('les champs de la table, hors liste, ont changé')
    if [e['key'] for e in en_tree['list']] != [e['key'] for e in fr_tree['list']]:
        problems.append('les clés de la table ont changé')
    french = french_values()
    wrong = [e['key'] for e, f in zip(en_tree['list'], fr_tree['list'])
             if f['value'] != french.get(e['key'], e['value'])]
    if wrong:
        problems.append(f'{len(wrong)} valeur(s) inattendue(s), dont {wrong[:5]}')
    for problem in problems:
        print('vérification :', problem)
    kept = sum(1 for e in fr_tree['list'] if e['key'] not in french)
    print(f'vérification : {len(fr_tree["list"])} entrées relues, {len(french)} en français, '
          f'{kept} restées en anglais, {len(problems)} problème(s).')
    return 1 if problems else 0


def main(argv):
    # Python -I ignore PYTHONIOENCODING : la console Windows recevrait du cp1252.
    sys.stdout.reconfigure(encoding='utf-8')
    if len(argv) >= 2 and argv[0] == 'extract':
        extract(argv[1])
    elif argv[:1] == ['check']:
        return check()
    elif len(argv) >= 3 and argv[0] == 'build':
        if check():
            return 1
        return build(argv[1], argv[2])
    elif len(argv) >= 3 and argv[0] == 'verify':
        return verify(argv[1], argv[2])
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
