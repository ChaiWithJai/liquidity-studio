import { randomUUID } from "node:crypto";
import { fail } from "./auth.js";
import { brandRevision } from "./multimodal-contract.js";
import { retrieveSource } from "./source-retrieval.js";
import {
  buildPreparedCandidate,
  preparationFingerprint,
  preparationUrls,
} from "./prepared-source-candidate.js";
export class SourcePreparationService {
  constructor({ repo, scope, retrieve = retrieveSource }) {
    Object.assign(this, { repo, scope, retrieve });
  }
  async prepare(storyId, expected) {
    const state = await this.repo.read(),
      story = state.backlog.find((story) => story.id === storyId);
    if (!story) throw fail(404, "Preparation story not found");
    if (
      preparationFingerprint(story, this.scope) !== expected.inputFingerprint ||
      brandRevision(state.brandProfile) !== expected.brandRevision
    )
      throw fail(409, "Preparation input changed");
    const urls = preparationUrls(story, this.scope);
    const reservation = await this.repo.reserveGeneration();
    try {
      const evidence = [];
      for (const url of urls) {
        await expected.assertCurrent?.();
        evidence.push({
          ...(await this.retrieve(url, {
            query: [
              story.title,
              ...(story.sourceClaims || [])
                .filter((claim) => claim.sourceUrl === url)
                .map((claim) => claim.text),
            ].join(" "),
          })),
          id: randomUUID(),
        });
        await expected.assertCurrent?.();
      }
      const candidate = buildPreparedCandidate({
        id: randomUUID(),
        scope: this.scope,
        story,
        brandProfile: state.brandProfile,
        evidence,
        jobId: expected.jobId,
        itemId: expected.itemId,
        attemptId: expected.attemptId,
        createdAt: new Date().toISOString(),
      });
      return { candidate, evidence, reservation };
    } catch (error) {
      await this.repo.finalizeGeneration(reservation, {
        status: "failed",
        mode: "source-preparation",
        traceId: null,
      });
      throw error;
    }
  }
}
