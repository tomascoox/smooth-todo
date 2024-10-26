import { ObjectId } from 'mongodb';

export interface Todo {
  _id?: string;
  name: string;
  project?: string;  // Make project optional
  creationDate: string;
  deadlineDate: string;
  userId: string;
  workgroupId?: string;
}

export const TodoSchema = {
  name: 'todos',
  fields: {
    name: { type: 'string', required: true },
    project: { type: 'string', required: false },  // Make project not required
    creationDate: { type: 'string', required: true },
    deadlineDate: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    workgroupId: { type: 'string', required: false },
  },
};
