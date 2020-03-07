import { SubItem } from '../models/SubItem';

export interface CreateItemRequest {
  title: string,
  description?: string | null,
  category?: string,
  url?: string | null
  anchorText?: string | null,
  subItems?: SubItem[]
}
