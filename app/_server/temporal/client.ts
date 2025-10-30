import { Connection } from "@temporalio/client";
import { logger } from "./logger";

let temporalConnection: Connection | null = null;

export async function getTemporalClient() {
  if (temporalConnection) {
    return temporalConnection;
  }

  // Only connect if Temporal is available (not on Vercel for now)
  if (process.env.TEMPORAL_ADDRESS && !process.env.VERCEL) {
    try {
      temporalConnection = await Connection.connect({
        address: process.env.TEMPORAL_ADDRESS,
      });
      logger.info("Temporal client connected", { address: process.env.TEMPORAL_ADDRESS });
      return temporalConnection;
    } catch (error) {
      logger.error("Failed to connect to Temporal", { error });
      return null;
    }
  }

  // Return null if Temporal is not available (graceful degradation)
  return null;
}

export async function startSeasonWorkflow(seasonId: string) {
  const connection = await getTemporalClient();
  if (!connection) {
    logger.warn("Temporal not available, skipping workflow start", { seasonId });
    // TODO: Could use a different scheduling mechanism for Vercel
    return null;
  }

  // TODO: Import and start workflow
  // For now, this is a placeholder
  return null;
}
