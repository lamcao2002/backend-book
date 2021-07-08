const express = require('express');
const multer = require('multer')
const fs = require('fs');
const router = express.Router();

const { MESSAGES, CATEGORY_COVER_PATH } = require('../../../constant');
const CategoryModel = require('../../../models/category.model');
const BookModel = require('../../../models/book.model');
const { getSort, getLimit } = require('../../../helper')
const handlerCheckPermission = require('../../middleware/handlerCheckPermission');

const upload = multer({ dest: CATEGORY_COVER_PATH })

/* GET categories listing. */
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
      query.title = { $regex: condition.search, $options: 'i' } 
    }

    const categories = await CategoryModel.paginate(query, options);
    return res.json({ categories });

    // const totalDocs = await CategoryModel.countDocuments();
    // const categories = await CategoryModel.find().sort(sort).skip((page - 1) * limit).limit(limit).exec();
    // return res.json({ data: categories, totalDocs, page, limit });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* POST categories create. */
router.post('/', handlerCheckPermission, upload.single('cover'), async (req, res) => {
  try {
    if (req.file) {
      const filePath = `${CATEGORY_COVER_PATH}/${new Date().getTime()}_${req.file.originalname}`;
      fs.rename(`${CATEGORY_COVER_PATH}/${req.file.filename}`, filePath, async (err) => {
        if (err) {
          return res.json({ code: 400, errorMess: err, data: null });
        }

        const { title } = req.body;
        const categoryModel = new CategoryModel({ title, cover: filePath });
        const category = await categoryModel.save();

        return res.json({ code: 200, message: MESSAGES.CREATE_SUCCESSFUL, data: { category } });
      });
    }
    else {
      const { title } = req.body;
      const categoryModel = new CategoryModel({ title, cover: null });
      const category = await categoryModel.save();

      return res.json({ code: 200, message: MESSAGES.CREATE_SUCCESSFUL, data: { category } });
    }
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* PUT categories edit. */
router.put('/:_id', handlerCheckPermission, upload.single('cover'), async (req, res) => {
  try {
    const _id = req.params._id
    const { title , checkEmptyCover} = req.body;

    const category = await CategoryModel.findById(_id);
    category.title = title;

    if (req.file) {
      const filePath = `${CATEGORY_COVER_PATH}/${new Date().getTime()}_${req.file.originalname}`;

      if(checkEmptyCover == false){
        fs.unlinkSync(category.cover);
      }
      fs.rename(`${CATEGORY_COVER_PATH}/${req.file.filename}`, filePath, async (err) => {
        if (err) {
          return res.json({ code: 400, errorMess: err, data: null });
        }

        category.cover = filePath;
        await category.save();
        return res.json({ code: 200, message: MESSAGES.EDIT_SUCCESSFUL, data: { category } });
      });
    } else {
      category.cover = null;
      await category.save();
      return res.json({ code: 200, message: MESSAGES.EDIT_SUCCESSFUL, data: { category } });
    }
    
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
})

/* DELETE categories delete. */
router.delete('/:_id', handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const category = await CategoryModel.findById(_id)
    if (category) {
      await CategoryModel.deleteOne({ _id: _id });
      await BookModel.deleteMany({category: _id})
      return res.json({ code: 200, message: MESSAGES.DELETE_SUCCESSFUL, data: true });
    }
    return res.json({ code: 400, errorMess: MESSAGES.CATEGORY_NOT_EXISTED, data: false });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: false });
  }
})

export default router;
