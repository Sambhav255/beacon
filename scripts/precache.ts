import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import marketsData from "../src/data/markets.json";
import { runAgent } from "../src/lib/agent";
import type { MarketsMap, StageEvent } from "../src/lib/types";

async function main() {
  const markets = marketsData as MarketsMap;
  const root = join(process.cwd(), "src", "data", "cache");
  await mkdir(root, { recursive: true });

  const index: Record<string, Record<string, unknown>> = {};

  for (const market of Object.values(markets)) {
    const stages: Record<string, unknown> = {};
    for await (const event of runAgent(market)) {
      const stageEvent = event as StageEvent;
      if (stageEvent.status === "complete" && stageEvent.stage !== "done" && stageEvent.stage !== "error") {
        stages[stageEvent.stage] = stageEvent.output;
      }
    }

    const payload = {
      marketId: market.id,
      generatedAt: new Date().toISOString(),
      stages,
    };

    index[market.id] = payload;
    await writeFile(join(root, `${market.id}.json`), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Cached ${market.id}`);
  }

  await writeFile(join(root, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log("Cache index written.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
