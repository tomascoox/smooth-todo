import clientPromise from '../lib/mongodb';

function decodeField(field: string | null | undefined): string {
  if (typeof field !== 'string') return '';
  try {
    return decodeURIComponent(escape(field));
  } catch {
    return field.replace(/[^\x20-\x7E]/g, '');
  }
}

async function cleanTodos() {
  const client = await clientPromise;
  const todosCollection = client.db().collection('todos');

  const cursor = todosCollection.find({});

  while (await cursor.hasNext()) {
    const todo = await cursor.next();
    if (todo) {
      const updatedTodo = {
        ...todo,
        name: decodeField(todo.name),
        project: decodeField(todo.project),
        creationDate: todo.creationDate instanceof Date ? todo.creationDate : new Date(),
        deadlineDate: todo.deadlineDate instanceof Date ? todo.deadlineDate : new Date(),
      };

      await todosCollection.updateOne({ _id: todo._id }, { $set: updatedTodo });
      console.log(`Updated todo: ${todo._id}`);
    }
  }

  console.log('Todo cleanup complete');
}

cleanTodos().catch(console.error).finally(() => process.exit());
