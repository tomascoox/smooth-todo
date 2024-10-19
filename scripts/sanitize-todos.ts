import clientPromise from '../lib/mongodb';

function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

async function sanitizeTodos() {
  const client = await clientPromise;
  const todosCollection = client.db().collection('todos');

  const cursor = todosCollection.find({});

  for await (const todo of cursor) {
    const updatedTodo = {
      ...todo,
      name: sanitizeString(todo.name),
      project: sanitizeString(todo.project),
    };

    await todosCollection.updateOne({ _id: todo._id }, { $set: updatedTodo });
  }

  console.log('Sanitization complete');
}

sanitizeTodos().catch(console.error);
