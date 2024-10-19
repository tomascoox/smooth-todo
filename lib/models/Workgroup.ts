import { ObjectId } from 'mongodb';

export interface Workgroup {
  _id?: ObjectId;
  name: string;
  ownerId: string;
  members: string[];
  invitedMembers: string[];
}

export const WorkgroupSchema = {
  name: 'workgroups',
  fields: {
    name: { type: 'string', required: true },
    ownerId: { type: 'string', required: true },
    members: { type: 'array', required: true },
    invitedMembers: { type: 'array', required: true },
  },
};
