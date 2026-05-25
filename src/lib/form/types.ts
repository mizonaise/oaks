import type { FormNode, Option } from '@/lib/form/schema'

export type Values = Record<string, string>
export type FieldIndex = Record<string, Extract<FormNode, { render: 'FIELD' }>>
export type SelectedMap = Record<string, Option | undefined>

export type SetFn = (
  name: string,
  value: string,
  option?: Option | undefined
) => void
