import * as uuid from 'uuid'

import { Item } from '../models/Item'
import { ItemAccess } from '../dataLayer/itemAccess'
import { CreateItemRequest } from '../requests/CreateItemRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('itemsLogic')

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

  if(!currentUserId) throw new Error('not authenticated')
  logger.info('incoming createItemRequest', createItemRequest);

  let newSubItems;
  if (createItemRequest.subItems) {
    newSubItems = createItemRequest.subItems.map(subItem => ({
      ...subItem,
      description: subItem.description || null,
      url: subItem.url || null,
      anchorText: subItem.anchorText || null,
      modifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }))
  }

  return await itemAccess.createItem({
    id,
    userId: currentUserId,
    title: createItemRequest.title,
    url: createItemRequest.url || null,
    anchorText: createItemRequest.anchorText || null,
    description: createItemRequest.description || null,
    subItems: newSubItems || null,
    category: createItemRequest.category || 'unsorted',
    modifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  })
}

export async function updateItem(
  item: Item,
  currentUserId: String,
): Promise<Item> {
  let newSubItems;
  if (item.subItems) {
    newSubItems = item.subItems.map(subItem => ({
      ...subItem,
      description: subItem.description || null,
      url: subItem.url || null,
      anchorText: subItem.anchorText || null,
    }))
  }

  return itemAccess.updateItem({
    ...item,
    description: item.description || null,
    url: item.url || null,
    anchorText: item.anchorText || null,
    modifiedAt: new Date().toISOString(),
    subItems: newSubItems
  }, currentUserId)
}
