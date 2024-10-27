import { cache } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { type TodoItem } from "~/db/kv";

const _getTodos = async () => {
  "use server";
  // grab from middleware
  const event = getRequestEvent();
  const todos = await event!.locals.kv.get("todos");

  return (todos || []) as TodoItem[];
};

const _setTodos = async (todos: TodoItem[]) => {
  "use server";
  const event = getRequestEvent();
  await event!.locals.kv.set("todos", todos);
};

const simulateNetworkLatency = async () => {
  await new Promise((r) => setTimeout(r, 500));
};

export const getTodos = cache(async () => {
  ("use server");
  console.log("Getting todos");

  await simulateNetworkLatency();

  return _getTodos();
}, "getTodos");

export const addTodo = async (todo: TodoItem) => {
  "use server";

  await simulateNetworkLatency();
  console.log("Adding todo", todo);
  const todos = await _getTodos();
  todos.push(todo);
  await _setTodos(todos);
  // return revalidate(getTodos.key);
};

export const removeTodo = async (id: string) => {
  "use server";

  await simulateNetworkLatency();
  console.log("Removing todo", id);
  const todos = await _getTodos();

  return await _setTodos(todos.filter((t) => t.id !== id));

  // return revalidate(getTodos.key);
};

export const updateTodo = async (id: string, todo: Partial<TodoItem>) => {
  "use server";

  await simulateNetworkLatency();
  console.log("Updating todo", id, todo);
  const todos = await _getTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return;
  todos[index] = { ...todos[index], ...todo };

  await _setTodos(todos);

  return todos[index];
  // return revalidate(getTodos.key);
};
