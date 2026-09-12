#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE_URL = "https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/domains.json";
const CACHE_DIR = join(tmpdir(), "walletos-scam-sniffer");
const CACHE_FILE = join(CACHE_DIR, "domains.json");
const CACHE_TTL_MS = 15 * 60 * 1000;

const args = process.argv.slice(2);
const input = args.find((value) => !value.startsWith("--")) || "";
const fileIndex = args.indexOf("--file");
const filePath = fileIndex >= 0 ? args[fileIndex + 1] : "";
const refresh = args.includes("--refresh");

if (!input) {
  print({ status: "unavailable", source: SOURCE_URL, error: "Pass a URL or domain to inspect." });
  process.exit(2);
}

const domain = normalizeDomain(input);
if (!domain) {
  print({ status: "unavailable", source: SOURCE_URL, input, error: "The input is not a valid URL or domain." });
  process.exit(2);
}

try {
  const { data, source, cached } = await loadDatabase({ filePath, refresh });
  const entries = collectDomainEntries(data);
  const matched = entries.filter((entry) => matchesDomain(domain, entry.domain));
  print({
    status: matched.length ? "match" : "no_match",
    input,
    domain,
    source,
    cached,
    checkedAt: new Date().toISOString(),
    matches: matched.map(({ domain: matchedDomain, value }) => ({ domain: matchedDomain, value }))
  });
} catch (error) {
  print({
    status: "unavailable",
    input,
    domain,
    source: filePath || SOURCE_URL,
    error: error.message || "Could not load Scam Sniffer domain data."
  });
  process.exit(1);
}

function normalizeDomain(value) {
  let candidate = String(value || "").trim().toLowerCase();
  if (!candidate) return "";
  try {
    if (!candidate.includes("://")) candidate = `https://${candidate}`;
    candidate = new URL(candidate).hostname;
  } catch {
    candidate = candidate.split("/")[0].split(":")[0];
  }
  return candidate.replace(/^www\./, "").replace(/\.$/, "");
}

async function loadDatabase({ filePath: explicitFile, refresh: shouldRefresh }) {
  if (explicitFile) {
    return { data: JSON.parse(await readFile(explicitFile, "utf8")), source: explicitFile, cached: true };
  }

  if (!shouldRefresh) {
    try {
      const cached = await readFile(CACHE_FILE, "utf8");
      const stat = await import("node:fs/promises").then(({ stat }) => stat(CACHE_FILE));
      if (Date.now() - stat.mtimeMs <= CACHE_TTL_MS) {
        return { data: JSON.parse(cached), source: SOURCE_URL, cached: true };
      }
    } catch {
      // Fetch a fresh copy when the cache is missing or invalid.
    }
  }

  const response = await fetch(SOURCE_URL, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Scam Sniffer returned HTTP ${response.status}.`);
  const text = await response.text();
  const data = JSON.parse(text);
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_FILE, text, "utf8");
  return { data, source: SOURCE_URL, cached: false };
}

function collectDomainEntries(value, entries = [], path = "$") {
  if (typeof value === "string") {
    const domain = normalizeDomain(value);
    if (domain && domain.includes(".")) entries.push({ domain, value });
    return entries;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectDomainEntries(item, entries, `${path}[${index}]`));
    return entries;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => collectDomainEntries(item, entries, `${path}.${key}`));
  }
  return [...new Map(entries.map((entry) => [entry.domain, entry])).values()];
}

function matchesDomain(candidate, listed) {
  return candidate === listed || candidate.endsWith(`.${listed}`) || listed.endsWith(`.${candidate}`);
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}
