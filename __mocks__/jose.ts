export const jwtVerify = jest.fn(async (token: string) => ({
  payload: { sub: 'test-user' },
  protectedHeader: { alg: 'HS256' },
}));

export class SignJWT {
  constructor(_: any) {}
  setProtectedHeader() { return this; }
  setIssuedAt() { return this; }
  setExpirationTime() { return this; }
  sign() { return Promise.resolve('mocked.jwt.token'); }
}