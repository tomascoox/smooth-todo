import { ObjectId } from 'mongodb';

export interface Todo {
  _id?: ObjectId;
  name: string;
  project: string;
  creationDate: Date;
  deadlineDate: Date;
  userId: string;
  completed: boolean;
}

export const TodoSchema = {
  name: 'todos',
  fields: {
    name: { type: 'string', required: true },
    project: { type: 'string', required: true },
    creationDate: { type: 'date', required: true },
    deadlineDate: { type: 'date', required: true },
    userId: { type: 'string', required: true },
  },
};
