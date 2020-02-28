import { apiEndpoint } from '../config'
import { Item } from '../types/Item';
import { CreateItemRequest } from '../types/CreateItemRequest';
import Axios from 'axios'
import { UpdateItemRequest } from '../types/UpdateItemRequest';

export async function getItems(idToken: string): Promise<Item[]> {
  console.log('Fetching items')

  const response = await Axios.get(`${apiEndpoint}/items`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Items:', response.data)
  return response.data.items
}

export async function createItem(
  idToken: string,
  newItem: CreateItemRequest
): Promise<Item> {
  const response = await Axios.post(`${apiEndpoint}/items`,  JSON.stringify(newItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchItem(
  idToken: string,
  itemId: string,
  updatedItem: UpdateItemRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/items/${itemId}`, JSON.stringify(updatedItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteItem(
  idToken: string,
  itemId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/items/${itemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  itemId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/items/${itemId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
