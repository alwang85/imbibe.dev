import { SubItem } from './SubItem';

export interface Item {
  id: string,
  title: string,
  category: string
  description?: string,
  userId: string
  createdAt: string
  modifiedAt: string
  url?: string
  anchorText?: string
  subItems?: SubItem[]
}
