//Check Login Status
export const isAuth = (req, res, next) => {
  if (!req.session.username) {
    return res.status(401).json("Not Logged In");
  }

  next();
};