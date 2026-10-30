type ParsedCurie = {
  raw: string;
  source: string;
  id: string;
  label: string;
};

function humanize(id: string): string {
  return id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // acronym boundary: RNAProduct → RNA Product
    .trim();
}

export default function parseCurie(input: string): ParsedCurie {
  const raw = input.trim();
  const idx = raw.indexOf(":");
  const source = idx > -1 ? raw.slice(0, idx).trim() : "";
  const id = (idx > -1 ? raw.slice(idx + 1) : raw).trim();
  return { raw, source, id, label: humanize(id) };
}
