import { NextRequest, NextResponse } from "next/server";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";

function runAnalyzer(inputPath: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const child = spawn("uv", ["run", "python", "-m", "packages.analyzer.cli", inputPath, "--json"], {
      cwd: process.cwd(),
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(stderr || `analyzer exited with ${code}`));
      else resolve(JSON.parse(stdout));
    });
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));
  const tempDir = await mkdtemp(join(tmpdir(), "megalopa-"));
  try {
    const inputPath = payload.content ? join(tempDir, "pack.json") : join(process.cwd(), "examples", "sample_pack.json");
    if (payload.content) await writeFile(inputPath, payload.content, "utf-8");
    const result = await runAnalyzer(inputPath);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "analysis failed" }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
