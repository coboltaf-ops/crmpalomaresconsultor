'use client'

interface BackupRestoreButtonsProps<T> {
  modulo: string
  label: string
  registros: T[]
  onClear: () => void
  onRestore: (registros: T[]) => void
}

// Desactivado: botones de backup/restore removidos
export default function BackupRestoreButtons<T>(_props: BackupRestoreButtonsProps<T>) {
  return null
}
