export const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  isDeleted: Boolean(user.isDeleted),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
