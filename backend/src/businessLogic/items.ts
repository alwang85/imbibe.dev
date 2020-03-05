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
  console.log('incoming createItemRequest', createItemRequest);

  let newSubItems;
  if (createItemRequest.subItems) {
    newSubItems = createItemRequest.subItems.map(subItem => ({
      ...subItem,
      url: subItem.url || null,
      modifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }))
  }

  return await itemAccess.createItem({
    id,
    userId: currentUserId,
    title: createItemRequest.title,
    url: createItemRequest.url || null,
    description: createItemRequest.description,
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
      url: subItem.url || null,
    }))
  }

  return itemAccess.updateItem({
    ...item,
    url: item.url || null,
    subItems: newSubItems
  }, currentUserId)
}
