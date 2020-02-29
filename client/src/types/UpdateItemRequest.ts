import { SubItem } from './SubItem';

export interface UpdateItemRequest {
  title: string
  description: string
  category?: string
  url?: string
  subItems?: SubItem[]
}