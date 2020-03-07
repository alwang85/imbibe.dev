import { SubItem } from './SubItem';

export interface UpdateItemRequest {
  title: string
  description?: string
  category?: string
  url?: string
  anchorText?: string
  subItems?: SubItem[]
  // the below not used to update, just to make updating spreading items easier for ts
  // id?: string,
  // modifiedAt?: string,
  // createdAt?: string
}