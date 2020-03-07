import { SubItem } from '../models/SubItem';

export interface UpdateItemRequest {
  title: string
  description?: string | null,
  category?: string
  url?: string | null
  anchorText?: string | null,
  subItems?: SubItem[]
  modifiedAt: string
  userId: string,
  createdAt: string,
  id: string
}