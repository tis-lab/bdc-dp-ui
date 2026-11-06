import { splitCamelCase } from "./text";

type ParsedCurie = {
  raw: string;
  source: string;
  id: string;
  label: string;
};

export default function parseCurie(input: string): ParsedCurie {
  const raw = input.trim();
  const idx = raw.indexOf(":");
  const source = idx > -1 ? raw.slice(0, idx).trim() : "";
  const id = (idx > -1 ? raw.slice(idx + 1) : raw).trim();
  return { raw, source, id, label: splitCamelCase(id) };
}
