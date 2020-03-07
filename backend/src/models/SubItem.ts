export interface SubItem {
  id: string,
  title: string,
  description?: string | null,
  createdAt: string
  modifiedAt: string
  url?: string | null
  anchorText?: string | null
}
