import { db } from '@/services/storage/db';
import type { QuickResponse, QuickResponseFormData } from '@/modules/visits/models/quickResponse.model';

// ============================================================
// Quick Response Repository
// ============================================================

function generateId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

/** Get all active quick responses, sorted by usage count (most used first) */
export async function getAllQuickResponses(): Promise<QuickResponse[]> {
  return db.quickResponses.filter(r => r.active).toArray()
    .then(arr => arr.sort((a, b) => {
      // Presets first, then by usage count descending
      if (a.isPreset !== b.isPreset) return a.isPreset ? -1 : 1;
      return b.usageCount - a.usageCount;
    }));
}

/** Get responses by category */
export async function getResponsesByCategory(category: 'outcome' | 'feedback'): Promise<QuickResponse[]> {
  return db.quickResponses.where('category').equals(category)
    .filter(r => r.active).toArray()
    .then(arr => arr.sort((a, b) => b.usageCount - a.usageCount));
}

/** Create a custom quick response (user-created) */
export async function createQuickResponse(data: QuickResponseFormData): Promise<QuickResponse> {
  // Check if already exists
  const existing = await db.quickResponses.filter(r => r.text === data.text && r.category === data.category).first();
  if (existing) {
    // Just increment usage if it exists
    await db.quickResponses.update(existing.id, { usageCount: existing.usageCount + 1 });
    return { ...existing, usageCount: existing.usageCount + 1 };
  }

  const response: QuickResponse = {
    id: generateId(),
    text: data.text,
    category: data.category,
    isPreset: false,
    usageCount: 1,
    active: true,
    createdAt: now(),
  };
  await db.quickResponses.add(response);
  return response;
}

/** Increment usage count for a response */
export async function incrementUsageCount(id: string): Promise<void> {
  const existing = await db.quickResponses.get(id);
  if (existing) {
    await db.quickResponses.update(id, { usageCount: existing.usageCount + 1 });
  }
}

/** Deactivate a custom quick response */
export async function deactivateQuickResponse(id: string): Promise<void> {
  await db.quickResponses.update(id, { active: false });
}
