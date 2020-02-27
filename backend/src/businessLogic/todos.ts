import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(
  currentUserId: string,
): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(currentUserId)
}

export async function getTodoById(
  todoId: string,
): Promise<TodoItem> {
  return todoAccess.getTodo(todoId)
}

export async function deleteTodo(
  todo: TodoItem,
  currentUserId: string
): Promise<TodoItem> {
  return todoAccess.deleteTodo(todo, currentUserId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  currentUserId: string
): Promise<TodoItem> {

  const todoId = uuid.v4()

  // server side authentication
  if(!currentUserId) throw new Error('not authenticated')

  return await todoAccess.createTodo({
    todoId,
    userId: currentUserId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null
  })
}

export async function updateTodo(
  todo: TodoItem,
  currentUserId: String,
): Promise<TodoItem> {
  return todoAccess.updateTodo(todo, currentUserId)
}
