import { subItem } from './SubItem';

export interface UpdateItemRequest {
  title: string
  description: string
  category?: string
  url?: string
  subItems?: subItem[]
}