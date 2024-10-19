import clientPromise from '../lib/mongodb';

async function encodeTodos() {
  const client = await clientPromise;
  const todosCollection = client.db().collection('todos');

  const cursor = todosCollection.find({});

  for await (const todo of cursor) {
    const updatedTodo = {
      ...todo,
      name: encodeString(todo.name),
      project: encodeString(todo.project),
    };

    await todosCollection.updateOne({ _id: todo._id }, { $set: updatedTodo });
  }

  console.log('Encoding complete');
}

function encodeString(str: string): string {
  if (!str) return '';
  return Buffer.from(str, 'utf-8').toString('base64');
}

encodeTodos().catch(console.error);
