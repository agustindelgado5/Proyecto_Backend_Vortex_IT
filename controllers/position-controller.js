
const HttpError = require('../models/http-error');
const Position = require('../models/position');

const getPositions = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  let positions;
  try {
    positions = await Position.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Position.countDocuments({});
    
    res.json({
      positions: positions.map(pos => pos.toObject({ getters: true })),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    return next(new HttpError('Fetching positions failed, please try again later.', 500));
  }
};


const createPosition = async (req, res, next) => {
  const { name } = req.body;

  const createdPosition = new Position({
    name,
  });

  try {
    await createdPosition.save();
  } catch (err) {
    return next(new HttpError('Creating position failed, please try again.', 500));
  }

  res.status(201).json({ position: createdPosition.toObject({ getters: true }) });
};

const deletePosition = async (req, res, next) => {
  const positionId = req.params.id;

  let position;
  try {
    position = await Position.findById(positionId);
    if (!position) {
      return next(new HttpError('Position not found.', 404));
    }
  } catch (err) {
    return next(new HttpError('Could not delete position, please try again.', 500));
  }

  try {
    await position.deleteOne({ _id:positionId });
  } catch (err) {
    return next(new HttpError('Could not delete position, please try again.', 500));
  }

  res.status(200).json({ message: 'Position deleted.' });
};

exports.getPositions = getPositions;
exports.createPosition = createPosition;
exports.deletePosition = deletePosition;
