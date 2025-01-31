const isAdmin = (req, res, next) => {
  const user = req.user;  // Assuming you have a user object after authentication (JWT)
  if (user && user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};
