const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
  
    const { name, email, password } = req.body;
  
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError('Signing up failed, please try again later.', 500);
      return next(error);
    }
  
    if (existingUser) {
      const error = new HttpError('User exists already, please login instead.', 422);
      return next(error);
    }
  
    const createdUser = new User({
      name,
      email,
      image: req.file ? req.file.path : '',
      password: password, 
     
    });
  
    try {
      await createdUser.save();
    } catch (err) {
      const error = new HttpError('Creating user failed, please try again.', 500);
      return next(error);
    }
  
    res.status(201).json({ userId: createdUser.id, email: createdUser.email });
  };
  