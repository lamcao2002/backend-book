const USERS = {
  ROLE: {
    ADMIN: 'admin',
    CONTRIBUTOR: 'contributor',
    NORMAL: 'normal'
  }
}

const MESSAGES = {
  USERNAME_WRONG: 'Username wrong!',
  PASSWORD_WRONG: 'Password wrong!',
  CHANGED_PASSWORD_SUCCESS: 'Changed password success!',
  USERNAME_EXISTED: 'Username was existed!',
  USERNAME_NOT_EXISTED: 'Username was not existed!',
  USERNAME_WRONG: 'Username wrong!',
  USERNAME_NOT_PERMISSION: 'Username not has permission!',
  TOKEN_INVALID: 'Token invalid!',
  LOGIN_SUCCESS: 'Login success!',
  REGISTER_SUCCESS: 'Register success!',
  BOOK_NOT_EXISTED: 'Book was not existed!',
  CATEGORY_NOT_EXISTED: 'Category was not existed!',
  CREATE_SUCCESSFUL: 'Create successful!',
  EDIT_SUCCESSFUL: 'Edit successful!',
  DELETE_SUCCESSFUL: 'Delete successful!',
}

const COVER_PATH = 'public/covers'

const CATEGORY_COVER_PATH = 'public/covers/category'

const KEY = 'LamCVH123!@#'

module.exports = {
  USERS,
  MESSAGES,
  KEY,
  COVER_PATH,
  CATEGORY_COVER_PATH
}