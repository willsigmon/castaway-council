import { proxyActivities, log, sleep, condition } from "@temporalio/workflow";
import type * as activities from "./activities";

const {
  emitPush,
  scoreChallenge,
  tallyVotes,
  mergeTribes,
  emitDailySummary,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export interface SeasonWorkflowInput {
  seasonId: string;
  totalDays?: number;
  fastForwardEnabled?: boolean;
}

const NORMAL_DURATIONS = {
  camp: 8 * 60 * 60 * 1000, // 8 hours
  challenge: 8 * 60 * 60 * 1000, // 8 hours
  vote: 6 * 60 * 60 * 1000, // 6 hours
};

const FAST_FORWARD_DURATIONS = {
  camp: 5 * 60 * 1000, // 5 minutes
  challenge: 5 * 60 * 1000, // 5 minutes
  vote: 3 * 60 * 1000, // 3 minutes
};

export async function seasonWorkflow(input: SeasonWorkflowInput): Promise<void> {
  const { seasonId, totalDays = 12, fastForwardEnabled = false } = input;
  const durations = fastForwardEnabled ? FAST_FORWARD_DURATIONS : NORMAL_DURATIONS;

  log.info(`Starting season ${seasonId} workflow`);

  for (let day = 1; day <= totalDays; day++) {
    log.info(`Starting day ${day}`);

    // Camp phase
    await openPhase(seasonId, day, "camp", durations.camp);
    await sleep(durations.camp);

    // Challenge phase
    await openPhase(seasonId, day, "challenge", durations.challenge);
    await sleep(durations.challenge);
    await scoreChallenge({ seasonId, day });

    // Vote phase
    await openPhase(seasonId, day, "vote", durations.vote);
    await sleep(durations.vote);
    await tallyVotes({ seasonId, day });

    // Check for merge at day 10
    if (day === 10) {
      await mergeTribes({ seasonId });
      log.info(`Merged tribes on day ${day}`);
    }

    await emitDailySummary({ seasonId, day });
  }

  log.info(`Season ${seasonId} completed`);
}

async function openPhase(
  seasonId: string,
  day: number,
  phase: "camp" | "challenge" | "vote",
  duration: number
): Promise<void> {
  const now = new Date();
  const closesAt = new Date(now.getTime() + duration);

  // Emit phase_open event via activity (workflows can't directly access DB)
  // The emitPush activity will handle DB event creation
  await emitPush({
    seasonId,
    type: "phase_open",
    phase,
    day,
    closesAt: closesAt.toISOString(),
  });
}
