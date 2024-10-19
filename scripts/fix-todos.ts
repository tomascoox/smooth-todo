import clientPromise from '../lib/mongodb';
import { ObjectId } from 'mongodb';

async function fixTodos() {
  const client = await clientPromise;
  const todosCollection = client.db().collection('todos');

  const cursor = todosCollection.find({});

  for await (const todo of cursor) {
    const updatedTodo = {
      ...todo,
      name: todo.name ? todo.name.toString() : '',
      project: todo.project ? todo.project.toString() : '',
      creationDate: new Date(todo.creationDate),
      deadlineDate: new Date(todo.deadlineDate),
      userId: todo.userId ? todo.userId.toString() : '',
    };

    await todosCollection.updateOne({ _id: new ObjectId(todo._id) }, { $set: updatedTodo });
  }

  console.log('Todo fixing complete');
}

fixTodos().catch(console.error);
