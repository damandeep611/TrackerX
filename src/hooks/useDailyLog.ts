import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { 
  Entry, 
  ActivityEntry, 
  LogNoteEntry, 
  MODAL_COLORS, 
  TimeSlot 
} from '@/types/dailyLogTypes'

// --- Database Types (matching API response) ---
interface DbTimeSlot {
    id: string
    startMinutes: number
    endMinutes: number
}

interface DbEntry {
    id: string
    createdAt: string // JSON dates are strings
    type: 'log-note' | 'activity'
    timeMinutes?: number | null
    content?: string | null
    title?: string | null
    colorLabel?: string | null
    timeSlots?: DbTimeSlot[]
}

// --- Payload Type for Creation ---
type CreateEntryPayload = 
  | {
      date: string
      type: 'log-note'
      timeMinutes: number
      content: string
    }
  | {
      date: string
      type: 'activity'
      title: string
      colorLabel: string
      slots: { start: number; end: number }[]
    }

// --- Input Types for Mutations ---
type NewLogNoteInput = Omit<LogNoteEntry, 'id' | 'createdAt'> & { id?: string, createdAt?: Date }
type NewActivityInput = Omit<ActivityEntry, 'id' | 'createdAt'> & { id?: string, createdAt?: Date }
type NewEntryInput = NewLogNoteInput | NewActivityInput

export function useDailyLog(date: Date = new Date()) {
  const queryClient = useQueryClient()
  const dateStr = format(date, 'yyyy-MM-dd')

  const { data: entries = [], isLoading, error } = useQuery<Entry[]> ({
    queryKey: ['daily-logs', dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/entries?date=${dateStr}`)
      if (!res.ok) throw new Error('Failed to fetch entries')
      const data: DbEntry[] = await res.json()
      return data.map(transformFromDb)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  // --- Mutations ---

  const addMutation = useMutation({
    mutationFn: async (entry: NewEntryInput) => {
      // Transform to DB payload
      let payload: CreateEntryPayload

      if (entry.type === 'log-note') {
        payload = {
            date: dateStr,
            type: 'log-note',
            timeMinutes: entry.time,
            content: entry.content
        }
      } else {
        // Find label from value
        const colorObj = MODAL_COLORS.find(c => c.value === entry.color)
        payload = {
            date: dateStr,
            type: 'activity',
            title: entry.title,
            colorLabel: colorObj ? colorObj.label : 'Work', // Default or fallback
            slots: entry.slots.map((s: TimeSlot) => ({
                start: s.start,
                end: s.end
            }))
        }
      }

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create entry')
      }

      const data: DbEntry = await res.json()
      return transformFromDb(data) // Return transformed entry
    },
    onMutate: async (newEntry: NewEntryInput) => {
      await queryClient.cancelQueries({ queryKey: ['daily-logs', dateStr] })
      const previousEntries = queryClient.getQueryData<Entry[]>(['daily-logs', dateStr])

      // Create optimistic entry
      let optimisticEntry: Entry

      if (newEntry.type === 'log-note') {
          const logNote: LogNoteEntry = {
              id: uuidv4(),
              createdAt: new Date(),
              type: 'log-note',
              time: newEntry.time,
              content: newEntry.content
          }
          optimisticEntry = logNote
      } else {
          const activity: ActivityEntry = {
              id: uuidv4(),
              createdAt: new Date(),
              type: 'activity',
              title: newEntry.title,
              color: newEntry.color,
              slots: newEntry.slots.map((s: TimeSlot) => ({
                  ...s,
                  id: s.id || uuidv4()
              }))
          }
          optimisticEntry = activity
      }

      queryClient.setQueryData<Entry[]>(['daily-logs', dateStr], (old) => {
        return [...(old || []), optimisticEntry]
      })

      return { previousEntries }
    },
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(['daily-logs', dateStr], context?.previousEntries)
      toast.error('Failed to save entry')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs', dateStr] })
      toast.success('Entry saved')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete entry')
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['daily-logs', dateStr] })
      const previousEntries = queryClient.getQueryData<Entry[]>(['daily-logs', dateStr])

      queryClient.setQueryData<Entry[]>(['daily-logs', dateStr], (old) => {
        return (old || []).filter(e => e.id !== id)
      })

      return { previousEntries }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['daily-logs', dateStr], context?.previousEntries)
      toast.error('Failed to delete entry')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs', dateStr] })
      toast.success('Entry deleted')
    },
  })

  // --- Derived Stats ---
  const stats = useMemo(() => {
    const totalActivityMinutes = entries
      .filter((e): e is ActivityEntry => e.type === 'activity')
      .reduce((acc, activity) => {
        const activityDuration = activity.slots.reduce((sAcc, slot) => sAcc + (slot.end - slot.start), 0)
        return acc + activityDuration
      }, 0)

    const totalLogNotes = entries.filter(e => e.type === 'log-note').length

    return {
      totalActivityMinutes,
      totalLogNotes,
      entryCount: entries.length
    }
  }, [entries])

  return {
    entries,
    isLoading,
    error: error ? (error as Error).message : null,
    addEntry: addMutation.mutate,
    deleteEntry: deleteMutation.mutate,
    stats
  }
}

function transformFromDb(dbEntry: DbEntry): Entry {
    const base = {
        id: dbEntry.id,
        createdAt: new Date(dbEntry.createdAt),
    };

    if (dbEntry.type === 'log-note') {
        const logNote: LogNoteEntry = {
            ...base,
            type: 'log-note',
            time: dbEntry.timeMinutes || 0,
            content: dbEntry.content || '',
        };
        return logNote
    } else {
        const colorObj = MODAL_COLORS.find(c => c.label === dbEntry.colorLabel)
        const colorValue = colorObj ? colorObj.value : '#0ea5e9'; // Default to blue if unknown

        const activity: ActivityEntry = {
            ...base,
            type: 'activity',
            title: dbEntry.title || '',
            color: colorValue, 
            slots: (dbEntry.timeSlots || []).map((s) => ({
                id: s.id,
                start: s.startMinutes,
                end: s.endMinutes
            }))
        };
        return activity
    }
}

