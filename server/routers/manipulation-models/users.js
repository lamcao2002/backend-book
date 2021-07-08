const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { MESSAGES } = require('../../../constant/index');
const UserModel = require('../../../models/user.model.js');
const handlerCheckPermission = require('../../middleware/handlerCheckPermission');
const { getSort, getLimit } = require('../../../helper')

/* GET users listing. */
router.post('/paging', handlerCheckPermission, async function (req, res) {
  try {
    var condition = req.body.condition || {};
    var page = condition.page || 1;
    var limit = getLimit(condition);
    var sort = getSort(condition);

    var options = {
      page: page, limit: limit, sort: sort
    };

    const query = {}
    if (condition.search) {
      query.$or = [
        { username: { $regex: condition.search, $options: 'i' } },
        { firstName: { $regex: condition.search, $options: 'i' } },
        { lastName: { $regex: condition.search, $options: 'i' } },
        { role: { $regex: condition.search, $options: 'i' } },
      ]
    }

    const users = await UserModel.paginate(query, options);
    return res.json({ users });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* POST users create. */
router.post('/', handlerCheckPermission, async function (req, res) {
  try {
    const user = await UserModel.findOne({ username: req.body.username });
    if (user === null) {
      const { username, password, firstName, lastName, role } = req.body;
      const hash = await bcrypt.hash(password, 8);
      const UserClass = new UserModel({ username, password: hash, firstName, lastName, role });
      const user = await UserClass.save();
      return res.json({ code: 200, message: MESSAGES.CREATE_SUCCESSFUL, data: { user } });
    } else {
      return res.json({ code: 200, errorMess: MESSAGES.USERNAME_EXISTED, data: null })
    }
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* PUT users edit. */
router.put('/:_id', handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id
    const { username, firstName, lastName, role, usernameChange } = req.body;
    const payload = { username, firstName, lastName, role }

    // if (password) {
    //   const hash = await bcrypt.hash(password, 8);
    //   payload.password = hash
    // }
    if (usernameChange) {
      const user = await UserModel.findOne({ username: payload.username });

      if (user === null) {
        const userUpdate = await UserModel.updateOne({ _id: _id }, payload)
        return res.json({ code: 200, message: MESSAGES.EDIT_SUCCESSFUL, data: { userUpdate } });
      } else {
        return res.json({ code: 200, errorMess: MESSAGES.USERNAME_EXISTED, data: null });
      }
    } else {
      const userUpdate = await UserModel.updateOne({ _id: _id }, payload)
      return res.json({ code: 200, message: MESSAGES.EDIT_SUCCESSFUL, data: { userUpdate } });
    }
    // const userUpdate = await UserModel.updateOne({ _id: _id }, payload).then(() => {
    //   return UserModel.findById(_id);
    // });
    // return res.json({ code: 200, errorMess: '', data: { userUpdate } });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
})

/* DELETE users delete. */
router.delete('/:_id', handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const user = await UserModel.findById(_id)
    if (user) {
      await UserModel.deleteOne({ _id: _id });
      return res.json({ code: 200, message: MESSAGES.DELETE_SUCCESSFUL, data: true });
    }
    return res.json({ code: 400, errorMess: MESSAGES.USERNAME_NOT_EXISTED, data: false });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: false });
  }
})


/* GET users only. */
router.get('/only', handlerCheckPermission, async function (req, res) {
  try {
    const users = await UserModel.findById(req._user._id);
    return res.json({ users });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

router.post('/owner', handlerCheckPermission, async function (req, res) {
  try {
    const { _id } = req.body;
    // const { _id } = req.params._id;

    const users = await UserModel.findById(_id);
    return res.json({ users });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

export default router;
