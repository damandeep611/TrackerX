export type TimeSlot = {
  id: string
  start: number // Minutes from midnight (0-1440)
  end: number   // Minutes from midnight
}

export type EntryType = 'log-note' | 'activity'

export interface BaseEntry {
  id: string
  type: EntryType
  createdAt: Date
}

export interface LogNoteEntry extends BaseEntry {
  type: 'log-note'
  time: number // Minutes from midnight
  content: string
}

export interface ActivityEntry extends BaseEntry {
  type: 'activity'
  title: string
  slots: TimeSlot[]
  color: string
}

export type Entry = LogNoteEntry | ActivityEntry

export const MODAL_COLORS = [
  { label: 'Exercise', value: '#10b981', type: 'solid' }, // Emerald
  { label: 'Work', value: '#0ea5e9', type: 'solid' }, // Sky Blue
  { label: 'Sleep', value: 'url(#grad-sleep)', css: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)', type: 'gradient' },
  { label: 'Deep Work', value: '#6366f1', type: 'solid' }, // Indigo
  { label: 'Health', value: '#f43f5e', type: 'solid' }, // Rose
  { label: 'Learning', value: '#f59e0b', type: 'solid' }, // Amber
  { label: 'Relax', value: '#8b5cf6', type: 'solid' }, // Violet
]
