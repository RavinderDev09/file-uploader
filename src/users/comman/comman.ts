export interface RequestWithUser extends Request {
    user: {
      userId: string;
      email: string;
      role:string;
    };
  }

  export enum USERVERIFIEDSTATUS{
    true='true',
    false='false',
    compelete='compelete'
  }