import { db } from '@/services/storage/db';
import { PRESET_OUTCOMES, PRESET_FEEDBACK } from '@/modules/visits/models/quickResponse.model';
import type { QuickResponse } from '@/modules/visits/models/quickResponse.model';

// ============================================================
// Seed Preset Quick Responses
// ============================================================

export async function seedPresetResponses() {
  const now = new Date().toISOString();
  const responses: QuickResponse[] = [];

  for (const text of PRESET_OUTCOMES) {
    responses.push({
      id: crypto.randomUUID(),
      text,
      category: 'outcome',
      isPreset: true,
      usageCount: 0,
      active: true,
      createdAt: now,
    });
  }

  for (const text of PRESET_FEEDBACK) {
    responses.push({
      id: crypto.randomUUID(),
      text,
      category: 'feedback',
      isPreset: true,
      usageCount: 0,
      active: true,
      createdAt: now,
    });
  }

  await db.quickResponses.bulkAdd(responses);
}
