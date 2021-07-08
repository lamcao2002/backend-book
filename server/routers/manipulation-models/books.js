const express = require('express');
const multer = require('multer')
const fs = require('fs');
const router = express.Router();

const { MESSAGES, COVER_PATH } = require('../../../constant');
const BookModel = require('../../../models/book.model');
const CategoryModel = require('../../../models/category.model');
const { getSort, getLimit } = require('../../../helper')
const handlerCheckPermission = require('../../middleware/handlerCheckPermission');

const upload = multer({ dest: COVER_PATH })


/* GET books listing. */
// router.get('/', handlerCheckPermission, async function (req, res) {
router.post('/paging', async function (req, res) {
  try {
    var condition = req.body.condition || {};
    var page = condition.page || 1;
    var limit = getLimit(condition);
    var sort = getSort(condition);

    var options = {
      page: page, limit: limit,
      populate: [
        { path: 'owner', select: "firstName lastName" },
        { path: 'category', select: "title" }],
      sort: sort
    };

    const query = {}
    if (condition.idCategory) {
      query.category = condition.idCategory
    }
    if (condition.idOwner) {
      query.owner = condition.idOwner
    }
    if (condition.search) {
      const categories = await CategoryModel.find({ title: { $regex: condition.search, $options: 'i' } })
      const categoriesId = categories.map(item => item._id)
      query.$or = [
        { title: { $regex: condition.search, $options: 'i' } },
        { author: { $regex: condition.search, $options: 'i' } },
        // { owner: {$regex: condition.search, $options: 'i'}}, lỗi owner k phải là id
      ]

      if (categoriesId && categoriesId.length) {
        query.$or.push({ category: { $in: categoriesId } })
      }
    }

    const books = await BookModel.paginate(query, options);
    return res.json({ books });

  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});


/* POST books create. */
router.post('/', handlerCheckPermission, upload.single('cover'), async (req, res) => {
  try {
    if (req.file) {
      const filePath = `${COVER_PATH}/${new Date().getTime()}_${req.file.originalname}`;
      fs.rename(`${COVER_PATH}/${req.file.filename}`, filePath, async (err) => {
        if (err) {
          return res.json({ code: 400, errorMess: err, data: null });
        }

        const { title, category, author, cover, description } = req.body;
        const bookModel = new BookModel({ title, category, author, owner: req._user._id, cover: filePath, description });
        const book = await bookModel.save();

        return res.json({ code: 200, message: MESSAGES.CREATE_SUCCESSFUL, data: { book } });
      });
    } else {
      const { title, category, author, owner, cover, description } = req.body;
      const bookModel = new BookModel({ title, category, author, owner, cover: null, description });
      const book = await bookModel.save();

      return res.json({ code: 200, message: MESSAGES.CREATE_SUCCESSFUL, data: { book } });
    }

    // const { title, category, author, owner, cover, description} = req.body;
    // const bookModel = new BookModel({ title, category, author, owner, cover, description });
    // const book = await bookModel.save();

    // return res.json({ code: 200, errorMess: '', data: { book } });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* PUT books edit. */
router.put('/:_id', handlerCheckPermission, upload.single('cover'), async (req, res) => {
  try {
    const _id = req.params._id
    const { title, category, author, cover, description, checkEmptyCover } = req.body;

    const book = await BookModel.findById(_id);
    book.title = title;
    book.category = category;
    book.author = author;
    book.description = description;

    if (req.file) {
      const filePath = `${COVER_PATH}/${new Date().getTime()}_${req.file.originalname}`;

      if (checkEmptyCover == false) {
        fs.unlinkSync(book.cover);
      }
      fs.rename(`${COVER_PATH}/${req.file.filename}`, filePath, async (err) => {
        if (err) {
          return res.json({ code: 400, errorMess: err, data: null });
        }
        book.cover = filePath;
        await book.save();
        return res.json({ code: 200, message: MESSAGES.EDIT_SUCCESSFUL, data: { book } });
      });
    }
    else {
      book.cover = null;
      await book.save();
    }

    return res.json({ code: 200, message: MESSAGES.EDIT_SUCCESSFUL, data: { book } });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
})

/* DELETE book delete. */
router.delete('/:_id', handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const book = await BookModel.findById(_id)
    if (book) {
      await BookModel.deleteOne({ _id: _id });
      return res.json({ code: 200, message: MESSAGES.DELETE_SUCCESSFUL, data: true });
    }
    return res.json({ code: 400, errorMess: MESSAGES.BOOK_NOT_EXISTED, data: false });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: false });
  }
})


export default router;
