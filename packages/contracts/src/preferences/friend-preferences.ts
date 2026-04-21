import { z } from 'zod';

export const TimeSlotSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7), // 1=Mon .. 7=Sun
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(0).max(24), // 24 means "end of day"
});
export type TimeSlot = z.infer<typeof TimeSlotSchema>;

export const FriendPreferencesSchema = z.object({
  acceptStrangers: z.boolean(),
  distanceKm: z.number().int().min(1).max(50),
  timeSlots: z.array(TimeSlotSchema).max(20),
});
export type FriendPreferences = z.infer<typeof FriendPreferencesSchema>;
