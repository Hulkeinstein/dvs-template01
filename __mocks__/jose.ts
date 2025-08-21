export const jwtVerify = jest.fn(async () => ({
  payload: { sub: 'test-user' },
  protectedHeader: { alg: 'HS256' },
}));

export class SignJWT {
  constructor() {}
  setProtectedHeader() {
    return this;
  }
  setIssuedAt() {
    return this;
  }
  setExpirationTime() {
    return this;
  }
  sign() {
    return Promise.resolve('mocked.jwt.token');
  }
}
