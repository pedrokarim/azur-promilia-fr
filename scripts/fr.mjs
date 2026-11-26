#!/usr/bin/env node
// Outil de la traduction française d'Azur Promilia (client japonais).
//
// Le fichier amont `strings.translatable.jsonl` (japonais + anglais) n'est jamais modifié ici :
// il suit promiliafans/i18n. Le français vit à part, dans `fr/strings.fr.jsonl`, une ligne
// {"id", "jp", "fr"} par texte traduit. La clé est le texte japonais, comme dans le patcher :
// une ligne dont le japonais change à une mise à jour du jeu n'efface rien, elle devient
// « orpheline » et repasse dans la liste à traduire.
//
// Commandes :
//   stats                         avancement
//   check                         vérifie le français (code de sortie 1 en cas d'erreur)
//   todo [options]                extrait des lignes à traduire dans un fichier de travail
//   import <fichier> [--dry-run]  reverse un fichier de travail rempli dans fr/strings.fr.jsonl
//   build [options]               fabrique le fichier lu par le patcher
//   orphans [--move]              liste (ou range dans fr/orphans.jsonl) les lignes orphelines
//
// Aucune dépendance : Node 20 ou plus suffit.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UPSTREAM_FILE = join(ROOT, 'strings.translatable.jsonl');
const FRENCH_FILE = join(ROOT, 'fr', 'strings.fr.jsonl');
const ORPHANS_FILE = join(ROOT, 'fr', 'orphans.jsonl');
const GLOSSARY_FILE = join(ROOT, 'fr', 'glossary.tsv');
const DIST_DIR = join(ROOT, 'dist');
const WORK_DIR = join(ROOT, 'work');

// Variables remplacées par le jeu et balises qui changent l'affichage. Elles doivent revenir
// à l'identique dans la traduction (l'anglais amont les respecte sur 100 % des lignes).
// Les balises <ruby> (lecture des kanji) sont laissées libres : le français n'en a pas besoin.
const PROTECTED_TOKEN =
  /\{[A-Za-z0-9_]*\}|%[0-9.]*[sdf]|<\/?(?:color|b|i|size|actionkey|actionkeyhold|img|link|cspace|pos|quake|shake|lbcenterDesc)\b[^>]*>/g;

// Textes d'interface courants, remplacés par `build --accent-test` pour voir si la police
// du jeu affiche les accents, les guillemets français et les espaces insécables.
const ACCENT_TEST = {
  設定: 'Réglages éèêëàâçùûœ',
  言語: 'Langue « ÉÈÀÇŒ »',
  グラフィック: 'Graphismes ’…',
  確認: 'Confirmer\u00a0!',
  キャンセル: 'Annuler\u00a0: îïôü',
  戻る: 'Retour ÂÊÎÔÛ',
};

// --- lecture ------------------------------------------------------------------------------

/** Lit un JSONL ligne par ligne. Une ligne abîmée est réparée si possible, sinon signalée. */
function readJsonl(path, { label, repair = false } = {}) {
  const rows = [];
  const problems = [];
  if (!existsSync(path)) return { rows, problems };
  const lines = readFileSync(path, 'utf8').split('\n');
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    try {
      rows.push(JSON.parse(line));
    } catch {
      // Cas déjà vu en amont : un rechercher-remplacer a laissé du texte après l'accolade.
      const end = line.lastIndexOf('}');
      if (repair && end > 0) {
        try {
          rows.push(JSON.parse(line.slice(0, end + 1)));
          problems.push(`${label} ligne ${index + 1} réparée : « ${line.slice(end + 1)} » ignoré`);
          return;
        } catch {
          // ligne irrécupérable, signalée plus bas
        }
      }
      problems.push(`${label} ligne ${index + 1} illisible : ${line.slice(0, 80)}`);
    }
  });
  return { rows, problems };
}

function writeJsonl(path, rows) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, rows.map((row) => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''));
}

function loadUpstream() {
  const { rows, problems } = readJsonl(UPSTREAM_FILE, { label: 'amont', repair: true });
  const byJp = new Map();
  for (const row of rows) {
    if (typeof row.jp === 'string' && row.jp && !byJp.has(row.jp)) byJp.set(row.jp, row);
  }
  return { rows, byJp, problems };
}

function loadFrench() {
  const { rows, problems } = readJsonl(FRENCH_FILE, { label: 'fr' });
  const byJp = new Map();
  for (const row of rows) {
    if (typeof row.jp !== 'string' || typeof row.fr !== 'string') {
      problems.push(`fr : ligne sans « jp » ou « fr » : ${JSON.stringify(row).slice(0, 80)}`);
      continue;
    }
    if (byJp.has(row.jp)) problems.push(`fr : japonais en double : ${row.jp.slice(0, 60)}`);
    byJp.set(row.jp, row);
  }
  return { rows, byJp, problems };
}

/** Le glossaire (fr/glossary.tsv), trié du terme japonais le plus long au plus court. */
function loadGlossary() {
  if (!existsSync(GLOSSARY_FILE)) return [];
  const [header, ...lines] = readFileSync(GLOSSARY_FILE, 'utf8').split('\n').filter((line) => line.trim());
  const columns = header.split('\t');
  return lines
    .map((line) => Object.fromEntries(line.split('\t').map((cell, i) => [columns[i], cell.trim()])))
    .filter((term) => term.jp && term.fr)
    .sort((a, b) => b.jp.length - a.jp.length);
}

const KATAKANA = /^[゠-ヿ]+$/;
const KATAKANA_CHAR = /[゠-ヿ]/;

/** Vrai si `term` apparaît dans `text` comme un mot : un nom en katakana (シャル) ne doit pas
 * être trouvé au milieu d'un autre mot en katakana (ポテンシャル). */
function containsTerm(text, term) {
  if (!KATAKANA.test(term)) return text.includes(term);
  for (let i = text.indexOf(term); i !== -1; i = text.indexOf(term, i + 1)) {
    const before = text[i - 1] ?? '';
    const after = text[i + term.length] ?? '';
    if (!KATAKANA_CHAR.test(before) && !KATAKANA_CHAR.test(after)) return true;
  }
  return false;
}

/** Termes du glossaire présents dans un texte japonais, sans ceux inclus dans un terme plus long. */
function termsIn(jp, glossary) {
  const found = [];
  let rest = jp;
  for (const term of glossary) {
    if (!containsTerm(rest, term.jp)) continue;
    found.push(term);
    rest = rest.split(term.jp).join('\u0000');
  }
  return found;
}

// --- vérifications ------------------------------------------------------------------------

function protectedTokens(text) {
  return (text.match(PROTECTED_TOKEN) ?? []).sort().join('|');
}

/** Retourne la liste des erreurs d'une traduction, vide si elle est bonne. */
function validate(jp, fr) {
  const errors = [];
  if (!fr.trim()) errors.push('traduction vide');
  if (protectedTokens(jp) !== protectedTokens(fr)) {
    errors.push(`variables ou balises différentes du japonais : attendu [${protectedTokens(jp)}], trouvé [${protectedTokens(fr)}]`);
  }
  return errors;
}

// --- options ------------------------------------------------------------------------------

function parseOptions(args) {
  const options = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      options._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = args[i + 1];
    if (next === undefined || next.startsWith('--')) options[key] = true;
    else {
      options[key] = next;
      i++;
    }
  }
  return options;
}

function percent(part, total) {
  return total ? `${((part / total) * 100).toFixed(2)} %` : '0 %';
}

// --- commandes ----------------------------------------------------------------------------

function stats() {
  const upstream = loadUpstream();
  const french = loadFrench();
  const translated = [...upstream.byJp.keys()].filter((jp) => french.byJp.has(jp)).length;
  const orphans = [...french.byJp.keys()].filter((jp) => !upstream.byJp.has(jp)).length;
  const chars = [...upstream.byJp.keys()].reduce((sum, jp) => sum + jp.length, 0);
  const charsDone = [...upstream.byJp.keys()]
    .filter((jp) => french.byJp.has(jp))
    .reduce((sum, jp) => sum + jp.length, 0);
  console.log(`Textes du jeu       ${upstream.byJp.size}`);
  console.log(`Traduits en français ${translated} (${percent(translated, upstream.byJp.size)})`);
  console.log(`Caractères japonais  ${charsDone} / ${chars} (${percent(charsDone, chars)})`);
  console.log(`Lignes orphelines    ${orphans}`);
  for (const problem of [...upstream.problems, ...french.problems]) console.log(`! ${problem}`);
}

function check() {
  const upstream = loadUpstream();
  const french = loadFrench();
  const errors = [...french.problems];
  for (const row of french.byJp.values()) {
    for (const error of validate(row.jp, row.fr)) errors.push(`id ${row.id ?? '?'} « ${row.jp.slice(0, 40)} » : ${error}`);
  }
  // Un terme validé du glossaire doit se retrouver dans la traduction : simple avertissement,
  // la phrase peut avoir une bonne raison de s'en écarter (pluriel, élision, accord).
  const glossary = loadGlossary().filter((term) => term.status === 'approved');
  const glossaryWarnings = [];
  for (const row of french.byJp.values()) {
    for (const term of termsIn(row.jp, glossary)) {
      if (!row.fr.toLowerCase().includes(term.fr.toLowerCase())) {
        glossaryWarnings.push(`id ${row.id ?? '?'} : « ${term.jp} » devrait donner « ${term.fr} »`);
      }
    }
  }
  const orphans = [...french.byJp.keys()].filter((jp) => !upstream.byJp.has(jp));
  for (const problem of upstream.problems) console.log(`avertissement : ${problem}`);
  for (const warning of glossaryWarnings) console.log(`glossaire : ${warning}`);
  if (orphans.length) console.log(`avertissement : ${orphans.length} ligne(s) orpheline(s), voir « orphans »`);
  for (const error of errors) console.log(`erreur : ${error}`);
  console.log(errors.length ? `${errors.length} erreur(s).` : `Aucune erreur sur ${french.byJp.size} ligne(s).`);
  process.exitCode = errors.length ? 1 : 0;
}

function todo(options) {
  const upstream = loadUpstream();
  const french = loadFrench();
  const limit = Number(options.limit ?? 200);
  const pattern = options.grep ? new RegExp(options.grep, 'u') : null;
  const maxLength = options['max-length'] ? Number(options['max-length']) : Infinity;
  const glossary = loadGlossary();
  const picked = [];
  for (const row of upstream.rows) {
    if (picked.length >= limit) break;
    if (french.byJp.has(row.jp)) continue;
    if (options.src && row.src !== options.src) continue;
    if (row.jp.length > maxLength) continue;
    if (pattern && !pattern.test(row.jp) && !pattern.test(row.en ?? '')) continue;
    // Les termes du glossaire présents dans la ligne, pour traduire sans chercher ailleurs.
    const terms = termsIn(row.jp, glossary).map((term) => `${term.jp} = ${term.fr} (${term.status})`);
    picked.push({ id: row.id, jp: row.jp, en: row.en, ...(terms.length ? { terms } : {}), fr: '' });
  }
  const out = options.out ? resolve(options.out) : join(WORK_DIR, `todo-${Date.now()}.jsonl`);
  writeJsonl(out, picked);
  console.log(`${picked.length} ligne(s) à traduire dans ${out}`);
  console.log('Remplis le champ « fr » de chaque ligne, puis : node scripts/fr.mjs import <fichier>');
}

function importWork(options) {
  const file = options._[0];
  if (!file) throw new Error('Indique le fichier de travail : node scripts/fr.mjs import <fichier>');
  const upstream = loadUpstream();
  const french = loadFrench();
  const { rows, problems } = readJsonl(resolve(file), { label: 'travail' });
  let added = 0;
  let replaced = 0;
  const rejected = [...problems];
  for (const row of rows) {
    if (typeof row.fr !== 'string' || !row.fr.trim()) continue;
    if (!upstream.byJp.has(row.jp)) {
      rejected.push(`« ${String(row.jp).slice(0, 40)} » n'existe plus dans le jeu`);
      continue;
    }
    const errors = validate(row.jp, row.fr);
    if (errors.length) {
      rejected.push(`id ${row.id} « ${row.jp.slice(0, 40)} » : ${errors.join(' ; ')}`);
      continue;
    }
    if (french.byJp.has(row.jp)) replaced++;
    else added++;
    french.byJp.set(row.jp, { id: upstream.byJp.get(row.jp).id, jp: row.jp, fr: row.fr });
  }
  const sorted = [...french.byJp.values()].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  // --dry-run : vérifie le fichier de travail sans rien écrire dans fr/strings.fr.jsonl.
  if (!options['dry-run']) writeJsonl(FRENCH_FILE, sorted);
  const verb = options['dry-run'] ? '(essai, rien n\'est écrit) ' : '';
  console.log(`${verb}${added} ajoutée(s), ${replaced} remplacée(s), ${rejected.length} refusée(s).`);
  for (const reason of rejected) console.log(`refusée : ${reason}`);
}

/**
 * Pose les espaces insécables du français au moment de fabriquer le fichier du jeu : avant
 * ! ? : ; », après «. Les traducteurs écrivent des espaces ordinaires, le résultat reste
 * uniforme. Testé en jeu le 26/11/2026 : la police affiche l'insécable U+00A0, mais pas
 * l'espace fine U+202F (carré), qu'on n'emploie donc jamais.
 */
function frenchSpacing(text) {
  return text
    .replace(/[ \u202f]+([!?:;»])/g, '\u00a0$1')
    .replace(/«[ \u202f]+/g, '«\u00a0');
}

function build(options) {
  const fallback = options.fallback ?? 'en';
  if (!['en', 'jp'].includes(fallback)) throw new Error('--fallback vaut « en » ou « jp »');
  const upstream = loadUpstream();
  const french = loadFrench();
  let fromFrench = 0;
  const output = [];
  for (const row of upstream.rows) {
    if (typeof row.jp !== 'string' || !row.jp) continue;
    let text = '';
    let source = row.src;
    // En test des accents, chaque texte commence par des accents et des guillemets français :
    // n'importe quel écran du jeu montre alors si la police les affiche.
    const accentText = ACCENT_TEST[row.jp] ?? (row.en ? `ÉÀÇ éèàçœ «\u00a0»\u00a0! ${row.en}` : '');
    const translated = options['accent-test'] ? accentText : french.byJp.get(row.jp)?.fr;
    if (translated && validate(row.jp, translated).length === 0) {
      text = options['accent-test'] ? translated : frenchSpacing(translated);
      source = 'fr';
      fromFrench++;
    } else if (fallback === 'en') {
      text = row.en ?? '';
    }
    // Le patcher ne lit que « jp » et « en » : le français passe par le champ « en ».
    // Un « en » vide laisse le texte japonais du jeu.
    output.push({ id: row.id, jp: row.jp, en: text, src: source });
  }
  const name = options['accent-test'] ? 'strings.accent-test.jsonl' : fallback === 'en' ? 'strings.fr.jsonl' : 'strings.fr-jp.jsonl';
  const out = options.out ? resolve(options.out) : join(DIST_DIR, name);
  writeJsonl(out, output);
  for (const problem of upstream.problems) console.log(`avertissement : ${problem}`);
  console.log(`${out} : ${output.length} lignes, dont ${fromFrench} en français, le reste en ${fallback === 'en' ? 'anglais' : 'japonais'}.`);
}

function orphans(options) {
  const upstream = loadUpstream();
  const french = loadFrench();
  const kept = [];
  const lost = [];
  for (const row of french.byJp.values()) (upstream.byJp.has(row.jp) ? kept : lost).push(row);
  for (const row of lost) console.log(`id ${row.id ?? '?'} « ${row.jp.slice(0, 50)} » → « ${row.fr.slice(0, 50)} »`);
  console.log(`${lost.length} ligne(s) orpheline(s).`);
  if (options.move && lost.length) {
    const previous = readJsonl(ORPHANS_FILE, { label: 'orphelines' }).rows;
    writeJsonl(ORPHANS_FILE, [...previous, ...lost]);
    writeJsonl(FRENCH_FILE, kept);
    console.log(`Rangées dans ${ORPHANS_FILE} : elles servent de modèle pour retraduire les nouvelles versions.`);
  }
}

const COMMANDS = { stats, check, todo, import: importWork, build, orphans };
const [command, ...rest] = process.argv.slice(2);
if (!COMMANDS[command]) {
  console.log('Commandes : stats | check | todo | import <fichier> | build | orphans');
  process.exitCode = command ? 1 : 0;
} else {
  try {
    COMMANDS[command](parseOptions(rest));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
