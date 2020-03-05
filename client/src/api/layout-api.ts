import Axios from 'axios'
import { apiEndpoint } from '../config'
import { Item } from '../types/Item';

interface layoutItem {
  items: Item[],
  category: string
}

export async function getPublicLayoutByDisplayName(
  displayName: string,
): Promise<layoutItem[]> {
  const response = await Axios.get(`${apiEndpoint}/layout/public/${displayName}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return response.data
}

export async function getLayoutByUserId(
  idToken: string,
  userId: string,
): Promise<layoutItem[]> {
  const response = await Axios.get(`${apiEndpoint}/layout/user/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  return response.data
}

