import { action, createAsync, json, useSubmission, useSubmissions, type RouteDefinition } from "@solidjs/router";
import clsx from "clsx";
import type { Submission } from "node_modules/@solidjs/router/dist/types";
import { createEffect, For, untrack } from "solid-js";
import { createStore, produce, reconcile, unwrap } from "solid-js/store";
import { FastSpinner } from "~/components/Spinner";
import type { TodoItem } from "~/db/kv";
import { addTodo, getTodos, removeTodo, updateTodo } from "~/lib/todos_api";
import { nanoid } from "~/util/nanoid";

import DeleteIcon from "~icons/heroicons/x-mark-20-solid";

export const route = {
  preload: () => getTodos(),
} satisfies RouteDefinition;

const addTodoAction = action(async (form: FormData) => {
  "use server";
  const id = nanoid();
  const text = form.get("todoText") as string;

  const todoItem: TodoItem = {
    id,
    done: false,
    text,
  };

  await addTodo(todoItem);
  return json(todoItem);
}, "addTodo");

const deleteTodoAction = action(async (id: string) => {
  "use server";
  await removeTodo(id);
  // return json({ success: true });
  return json(undefined, { revalidate: [] });
}, "deleteTodo");

const updateTodoAction = action(async (id: string, done: boolean) => {
  "use server";
  const newTodo = await updateTodo(id, { done });
  // return json({ success: true });
  return json(newTodo);
}, "updateTodo");

const TodoElement = (props: { todo: TodoItem }) => {
  const checkboxId = `${props.todo.id}-checkbox`;

  let focusRef!: HTMLButtonElement;

  return (
    <li class={clsx("group", props.todo.pending && "opacity-75")}>
      <div class={clsx("w-full inline-flex items-center gap-2", props.todo.pending && "animate-pulse")}>
        <form
          action={updateTodoAction.with(props.todo.id, !props.todo.done)}
          method="post"
          class="grow"
          onSubmit={(e) => props.todo.pending && e.preventDefault()}
        >
          <button
            class="w-full flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 focusable"
            type="submit"
            aria-checked={props.todo.done}
            aria-describedby={`${checkboxId}-label`}
            ref={focusRef}
          >
            {/* input is only for showing the "done" status, not actually clickable */}
            {/* (done to enable toggleability when javascript is disabled) */}
            <input
              type="checkbox"
              id={checkboxId}
              checked={props.todo.done}
              class="pointer-events-none"
              tabIndex={-1}
            />
            <label for={checkboxId} id={`${checkboxId}-label`} class="pointer-events-none">
              {props.todo.text}
            </label>
          </button>
        </form>
        <form
          action={deleteTodoAction.with(props.todo.id)}
          method="post"
          class="flex items-center"
          onSubmit={(e) => props.todo.pending && e.preventDefault()}
        >
          <button
            type="submit"
            class="h-fit cursor-pointer rounded-0 border-unset bg-transparent p-0 text-red-500 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 btn"
            tabIndex={0}
          >
            <DeleteIcon class="h-5 w-5" />
          </button>
        </form>
      </div>
    </li>
  );
};

function pendingFilter<T, U>(s: Submission<T, U>[]) {
  return () => s.filter((s) => s.pending);
}

function temporaryTodo(text: string) {
  return {
    id: nanoid(),
    text,
    done: false,
    pending: true,
  };
}

export default function Home() {
  const todosSignal = createAsync(() => getTodos(), {
    initialValue: [],
    deferStream: true,
  });

  const addingTodos = useSubmission(addTodoAction);
  const deletingTodos = useSubmissions(deleteTodoAction);
  const updatingTodos = useSubmissions(updateTodoAction);

  const [todos, setLocalTodos] = createStore(todosSignal());
  const isUpdating = () => addingTodos.pending || deletingTodos.pending || updatingTodos.pending;

  const optimisticUpdate = (todos: TodoItem[]) => {
    todos.forEach((todo) => {
      const update = untrack(() => updatingTodos.findLast((u) => u.input[0] === todo.id));

      if (update) {
        todo.done = update.input[1];
      }
    });

    return todos;
  };

  createEffect(() => {
    console.log("reconciling");
    setLocalTodos(
      reconcile(optimisticUpdate(unwrap(todosSignal())), {
        key: "id", // default
        merge: true,
      }),
    );

    // setTimeout(() => setLocalTodos(produce(optimisticUpdate)));
  });

  // optimistic update
  createEffect(() => {
    console.log("optimistic update", updatingTodos.length);
    untrack(() => setLocalTodos(produce(optimisticUpdate)));
  });

  // optimistic delete
  createEffect(() => {
    console.log("optimistic delete", deletingTodos.length);
    untrack(() => setLocalTodos(reconcile(todos.filter((t) => !deletingTodos.some((d) => d.input[0] === t.id)))));
  });

  let inputRef!: HTMLInputElement;

  createEffect(() => {
    console.log(unwrap(todos.slice()));
  });

  const sortedList = (todos: TodoItem[]) => {
    return todos.slice().sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
  };

  return (
    <main class="p-4 text-neutral-900 space-y-5 dark:text-neutral-100">
      <h1 class="text-4xl font-bold">
        Welcome to your todos! <FastSpinner class="inline-block size-6" show={isUpdating()} />
      </h1>
      <form
        action={addTodoAction}
        method="post"
        class="flex flex-row gap-4"
        onSubmit={(e) => {
          console.log("submitted");

          setLocalTodos(todos.length, temporaryTodo(inputRef.value));

          setTimeout(() => {
            inputRef.value = "";
          });
        }}
      >
        <input
          class="border-1 border-neutral-300 rounded-md bg-neutral-100 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800 focusable"
          name="todoText"
          required
          autofocus
          minLength={1}
          ref={inputRef}
        />
        <button class="bg-blue-500 text-white dark:bg-blue-600 btn" type="submit">
          Add Todo
        </button>
      </form>
      <section>
        <ul class="w-fit">
          <For each={sortedList(todos)}>{(todo) => <TodoElement todo={todo} />}</For>
        </ul>
      </section>
    </main>
  );
}
