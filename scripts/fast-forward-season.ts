import { Client } from "@temporalio/client";
import { seasonWorkflow } from "../infra/temporal/workflows";

async function fastForwardSeason() {
  const client = new Client({
    connection: {
      address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
    },
  });

  const seasonId = process.argv[2] || crypto.randomUUID();

  console.log(`Starting fast-forward season ${seasonId}...`);

  const handle = await client.workflow.start(seasonWorkflow, {
    args: [
      {
        seasonId,
        totalDays: 12,
        fastForwardEnabled: true,
      },
    ],
    taskQueue: "castaway-seasons",
    workflowId: `season-${seasonId}`,
  });

  console.log(`Workflow started: ${handle.workflowId}`);
  console.log(`Run ID: ${handle.firstExecutionRunId}`);

  await handle.result();
  console.log("Season completed!");
}

fastForwardSeason().catch((error) => {
  console.error("Fast-forward failed:", error);
  process.exit(1);
});
