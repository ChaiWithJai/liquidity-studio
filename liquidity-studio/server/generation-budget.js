import {randomUUID} from "node:crypto";
import {fail} from "./auth.js";
// Shared installation/organization admission; no publishing record is created.
export class GenerationBudget {
 constructor(store,scope){this.store=store;this.scope=scope;}
  async reserveGeneration() {
    const limit = Number(process.env.STUDIO_DAILY_GENERATION_LIMIT || 20);
    if (!Number.isInteger(limit) || limit < 0 || limit > 10000)
      throw fail(503, "Invalid generation budget configuration");
    const day = new Date().toISOString().slice(0, 10),
      id = randomUUID(),
      key = `generation-budget:${this.scope.organizationId}:${day}`;
    const globalKey = `generation-budget:global:${day}`,
      globalLimit = Number(
        process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT || 20,
      );
    if (
      !Number.isInteger(globalLimit) ||
      globalLimit < 0 ||
      globalLimit > 10000
    )
      throw fail(503, "Invalid global generation budget configuration");
    await this.store.update(globalKey, (state) => {
      state ||= { day, reservations: [] };
      if (state.reservations.length >= globalLimit)
        throw fail(429, "Daily installation generation limit reached");
      state.reservations.push({
        id,
        organizationId: this.scope.organizationId,
        brandId: this.scope.brandId,
        status: "reserved",
      });
      return state;
    });
    await this.store.update(key, (state) => {
      state ||= { day, reservations: [] };
      if (state.reservations.length >= limit)
        throw fail(429, "Daily organization generation limit reached");
      state.reservations.push({
        id,
        brandId: this.scope.brandId,
        status: "reserved",
        at: new Date().toISOString(),
      });
      return state;
    });
    return { id, key, globalKey };
  }
  async assertGenerationReservation(reservation) {
    const checks = [
      [
        reservation.globalKey,
        Number(process.env.STUDIO_GLOBAL_DAILY_GENERATION_LIMIT || 20),
      ],
      [
        reservation.key,
        Number(process.env.STUDIO_DAILY_GENERATION_LIMIT || 20),
      ],
    ];
    for (const [key, limit] of checks) {
      const ledger = await this.store.get(key);
      const entry = ledger?.reservations.find(
        (entry) => entry.id === reservation.id,
      );
      if (
        !Number.isInteger(limit) ||
        limit < 0 ||
        limit > 10000 ||
        !entry ||
        entry.status !== "reserved" ||
        entry.brandId !== this.scope.brandId ||
        ledger.reservations.length > limit
      )
        throw fail(
          429,
          "Generation reservation is no longer within the current daily limit",
        );
    }
  }
  async finalizeGeneration(reservation, { status, mode, traceId }) {
    await this.store.update(reservation.globalKey, (state) => {
      const event = state.reservations.find(
        (event) => event.id === reservation.id,
      );
      Object.assign(event, { status, mode, traceId: traceId || null });
      return state;
    });
    await this.store.update(reservation.key, (state) => {
      const event = state.reservations.find(
        (event) => event.id === reservation.id,
      );
      Object.assign(event, { status, mode, traceId: traceId || null });
      return state;
    });
  }
}
