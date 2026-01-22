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
  { label: "Exercise", value: "#f43f5e", type: "solid" },
  { label: "Work", value: "#0284c7", type: "solid" },
  {
    label: "Sleep",
    value: "url(#grad-sleep)",
    css: "linear-gradient(135deg, #1e3a8a 0%, #6366f1 50%, #a78bfa 100%)",
    type: "gradient",
  }, // Twilight gradient
  { label: "Deep Work", value: "#7c3aed", type: "solid" }, // Rich Violet - creative depth
  { label: "Yoga", value: "#059669", type: "solid" }, // Light green - flexibility, balance
  { label: "Learning", value: "#eab308", type: "solid" }, // Dark Green - depth, growth
  { label: "Relax", value: "#a78bfa", type: "solid" }, // Soft Purple - peaceful, gentle
];


