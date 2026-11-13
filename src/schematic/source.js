import { existsSync, readFileSync } from 'fs';
import { dirname, isAbsolute, relative, resolve } from 'path';

// The source of a ```schematic fence: its own body, or, with src="path", a YAML
// file kept beside the post so the post stays readable. The path is relative to
// the post and must stay inside its directory. `from` is the post's file.
export function schematicSource(value, meta, from) {
  const m = /\bsrc="([^"]*)"/.exec(meta || '');
  if (!m) return value;

  const where = `${relative('.', from)}: schematic src "${m[1]}"`;
  if (value.trim()) throw new Error(`${where}: give the source in the block or in src, not both`);

  const base = dirname(from);
  const file = resolve(base, m[1]);
  const inside = relative(base, file);
  if (isAbsolute(m[1]) || inside.startsWith('..') || isAbsolute(inside)) {
    throw new Error(`${where} must be inside ${relative('.', base) || '.'}`);
  }
  if (!existsSync(file)) throw new Error(`${where} does not exist`);
  return readFileSync(file, 'utf8');
}
