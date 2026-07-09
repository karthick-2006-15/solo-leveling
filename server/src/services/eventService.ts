import WorldEvent from '../models/WorldEvent';

class EventService {
  async getActiveEvents() {
    const now = new Date();
    return await WorldEvent.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gt: now }
    });
  }

  async getActiveModifiers() {
    const events = await this.getActiveEvents();
    let xpMultiplier = 1;
    let coinMultiplier = 1;
    let luckBonus = 0;

    for (const event of events) {
      if (event.modifiers.xpMultiplier) xpMultiplier *= event.modifiers.xpMultiplier;
      if (event.modifiers.coinMultiplier) coinMultiplier *= event.modifiers.coinMultiplier;
      if (event.modifiers.luckBonus) luckBonus += event.modifiers.luckBonus;
    }

    return { xpMultiplier, coinMultiplier, luckBonus };
  }
}

export const eventService = new EventService();
