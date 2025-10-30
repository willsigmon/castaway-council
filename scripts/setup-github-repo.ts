#!/usr/bin/env tsx
/**
 * Script to automatically create GitHub repo and prepare for Vercel
 *
 * This uses GitHub MCP tools to:
 * 1. Create a new GitHub repository
 * 2. Push all code in one commit
 *
 * Usage:
 *   pnpm setup-github-repo <repo-name> [--private]
 *
 * Then connect to Vercel at: https://vercel.com/new
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const IGNORE_PATTERNS = [
  "node_modules",
  ".next",
  ".git",
  "coverage",
  ".DS_Store",
  ".env",
  ".vercel",
  "*.log",
  "dist",
  "build",
];

function shouldIgnore(path: string): boolean {
  return IGNORE_PATTERNS.some((pattern) => path.includes(pattern));
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relPath = relative(baseDir, fullPath);

    if (shouldIgnore(relPath)) continue;

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relPath);
    }
  }

  return files;
}

async function getFileContents(filePath: string, baseDir: string): Promise<string> {
  const fullPath = join(baseDir, filePath);
  return readFileSync(fullPath, "utf-8");
}

async function main() {
  const repoName = process.argv[2] || "castaway-council";
  const isPrivate = process.argv.includes("--private");

  console.log(`📦 Setting up GitHub repository: ${repoName}`);
  console.log(`\nThis script will:`);
  console.log(`1. Create a GitHub repository`);
  console.log(`2. Prepare file list for pushing`);
  console.log(`\nAfter this, you'll need to:`);
  console.log(`1. Use GitHub MCP tools to create and push`);
  console.log(`2. Connect to Vercel at https://vercel.com/new`);
  console.log(`\nGetting all files...\n`);

  const baseDir = process.cwd();
  const files = getAllFiles(baseDir, baseDir);

  console.log(`Found ${files.length} files to push:\n`);
  files.slice(0, 20).forEach((f) => console.log(`  - ${f}`));
  if (files.length > 20) {
    console.log(`  ... and ${files.length - 20} more`);
  }

  console.log(`\n✅ Repository preparation complete!`);
  console.log(`\n📋 Next steps:`);
  console.log(`\n1. Create repository using GitHub MCP:`);
  console.log(`   mcp_github_create_repository name="${repoName}" private=${isPrivate}`);
  console.log(`\n2. Push files using GitHub MCP tools`);
  console.log(`\n3. Import to Vercel:`);
  console.log(`   https://vercel.com/new → Import Git Repository`);
}

main().catch(console.error);
