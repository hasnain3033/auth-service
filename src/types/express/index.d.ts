declare global {
  namespace Express {
    interface Request {
      // match whatever your `validate()` returns
      user: {
        sub: string;
        email: string;
        role: 'developer' | 'user';
        appId?: string;
      };
    }
  }
}
