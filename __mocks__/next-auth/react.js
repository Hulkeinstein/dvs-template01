module.exports = {
  useSession: jest.fn(() => ({
    data: { user: { id: 'test-user', email: 'test@example.com' } },
    status: 'authenticated',
  })),
  SessionProvider: ({ children }) => children,
  signIn: jest.fn(),
  signOut: jest.fn(),
};