import { SubItem } from '../models/SubItem';

export interface UpdateItemRequest {
  title: string
  description: string
  category?: string
  url?: string
  subItems?: SubItem[]
  modifiedAt: string
  userId: string,
  createdAt: string,
  id: string
}