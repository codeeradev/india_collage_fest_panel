export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: number;
  image?: string;
}

export interface IApproval {
  _id: string;
  user_id: IUser;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
