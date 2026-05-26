import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface EmailLog {
  id: string
  remitente: string
  destinatario: string
  asunto: string
  fecha: string
  estado: 'enviado' | 'recibido' | 'abierto' | 'fallido'
  cliente_id?: string
  cliente_nombre?: string
  contacto_id?: string
  contacto_nombre?: string
  descripcion?: string
  fecha_registro: string
}

interface EmailLogState {
  emailLogs: EmailLog[]
  addEmailLog: (log: EmailLog) => void
  updateEmailLog: (id: string, log: Partial<EmailLog>) => void
  deleteEmailLog: (id: string) => void
}

export const useEmailLogStore = create<EmailLogState>()(
  persist(
    (set) => ({
      emailLogs: [],
      addEmailLog: (log) => set((s) => ({ emailLogs: [...s.emailLogs, log] })),
      updateEmailLog: (id, log) => set((s) => ({ emailLogs: s.emailLogs.map((r) => r.id === id ? { ...r, ...log } : r) })),
      deleteEmailLog: (id) => set((s) => ({ emailLogs: s.emailLogs.filter((r) => r.id !== id) })),
    }),
    { name: 'crm-email-log-storage' }
  )
)
