import { subItem } from '../models/SubItem';

export interface UpdateItemRequest {
  title: string
  description: string
  category?: string
  url?: string
  subItems?: subItem[]
}