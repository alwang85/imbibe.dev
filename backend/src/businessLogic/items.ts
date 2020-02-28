import * as uuid from 'uuid'

import { Item } from '../models/Item'
import { ItemAccess } from '../dataLayer/itemAccess'
import { CreateItemRequest } from '../requests/CreateItemRequest'

const itemAccess = new ItemAccess()

export async function getAllItems(
  currentUserId: string,
): Promise<Item[]> {
  return itemAccess.getAllItems(currentUserId)
}

export async function getItemById(
  id: string,
): Promise<Item> {
  return itemAccess.getItem(id)
}

export async function deleteItem(
  item: Item,
  currentUserId: string
): Promise<Item> {
  return itemAccess.deleteItem(item, currentUserId)
}

export async function createItem(
  createItemRequest: CreateItemRequest,
  currentUserId: string
): Promise<Item> {

  const id = uuid.v4()

  // server side authentication temp disable
  // if(!currentUserId) throw new Error('not authenticated')

  return await itemAccess.createItem({
    id,
    userId: currentUserId,
    title: createItemRequest.title,
    url: createItemRequest.url,
    description: createItemRequest.description,
    subItems: createItemRequest.subItems,
    category: createItemRequest.category || 'unsorted',
    modifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  })
}

export async function updateItem(
  item: Item,
  currentUserId: String,
): Promise<Item> {
  return itemAccess.updateItem(item, currentUserId)
}
