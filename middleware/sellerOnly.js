const sellerOnly = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Seller access only' });
  }
  next();
};

module.exports = sellerOnly;
