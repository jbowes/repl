// Parser for the diagram source format: a small subset of Mermaid syntax, so
// the sources read like something people already know.
//
//   sequenceDiagram                    flowchart LR
//     participant C as Client            A[Client] -->|POST| B(Server)
//     C->>S: POST /hook                  B --> C{Valid?}
//     S-->>C: 200 OK                     A -.-> C
//
// Lines starting with %% are comments.

function parseSequence(lines) {
  const participants = [];
  const byId = new Map();
  const messages = [];

  const add = (id, label) => {
    let p = byId.get(id);
    if (!p) {
      p = { id, label: label || id };
      byId.set(id, p);
      participants.push(p);
    } else if (label) {
      p.label = label;
    }
    return p;
  };

  for (const line of lines) {
    let m = /^(?:participant|actor)\s+(\S+)(?:\s+as\s+(.+))?$/.exec(line);
    if (m) {
      add(m[1], m[2] && m[2].trim());
      continue;
    }
    m = /^(\S+?)\s*(-->>|->>|-->|->)\s*(\S+?)\s*:\s*(.*)$/.exec(line);
    if (!m) throw new Error(`diagram: cannot parse sequence line: ${line}`);
    add(m[1]);
    add(m[3]);
    messages.push({
      from: m[1],
      to: m[3],
      dashed: m[2].startsWith('--'),
      text: m[4].trim(),
    });
  }
  return { type: 'sequence', participants, messages };
}

const NODE = /^([A-Za-z0-9_]+)(?:\[([^\]]*)\]|\(([^)]*)\)|\{([^}]*)\})?/;
const EDGE = /^\s*(-->|-\.->|---)(?:\|([^|]*)\|)?\s*/;

function parseNode(str) {
  const m = NODE.exec(str);
  if (!m) throw new Error(`diagram: cannot parse node: ${str}`);
  const shape = m[2] !== undefined ? 'box' : m[3] !== undefined ? 'round' : m[4] !== undefined ? 'diamond' : null;
  const label = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
  return { id: m[1], shape, label, rest: str.slice(m[0].length) };
}

function parseFlow(direction, lines) {
  const nodes = new Map();
  const edges = [];

  const touch = (n) => {
    let node = nodes.get(n.id);
    if (!node) {
      node = { id: n.id, label: n.shape ? n.label : n.id, shape: n.shape || 'box' };
      nodes.set(n.id, node);
    } else if (n.shape) {
      node.label = n.label;
      node.shape = n.shape;
    }
    return node;
  };

  for (const line of lines) {
    // A chain: A --> B -->|x| C
    let cur = parseNode(line);
    let prev = touch(cur);
    let rest = cur.rest;
    while (rest.trim()) {
      const e = EDGE.exec(rest);
      if (!e) throw new Error(`diagram: cannot parse flowchart line: ${line}`);
      cur = parseNode(rest.slice(e[0].length));
      const next = touch(cur);
      edges.push({
        from: prev.id,
        to: next.id,
        label: e[2] ? e[2].trim() : '',
        dashed: e[1] === '-.->',
        arrow: e[1] !== '---',
      });
      prev = next;
      rest = cur.rest;
    }
  }
  return { type: 'flow', direction, nodes: [...nodes.values()], edges };
}

function parse(source) {
  const lines = source
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('%%'));
  const head = (lines.shift() || '').split(/\s+/);

  if (head[0] === 'sequenceDiagram') return parseSequence(lines);
  if (head[0] === 'flowchart' || head[0] === 'graph') {
    const dir = head[1] || 'TB';
    if (!['TB', 'TD', 'BT', 'LR', 'RL'].includes(dir)) throw new Error(`diagram: bad flowchart direction: ${dir}`);
    return parseFlow(dir === 'TD' ? 'TB' : dir, lines);
  }
  throw new Error('diagram: source must start with "sequenceDiagram" or "flowchart <TB|LR>"');
}

module.exports = { parse };
