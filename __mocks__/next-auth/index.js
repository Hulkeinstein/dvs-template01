module.exports = {
  getServerSession: jest.fn(async () => ({
    user: { id: 'test-user', email: 'test@example.com' },
  })),
};
