const { db, util } = require('../common');
const { MinderSqls } = require('./sqlstore');
const { MinderValidator } = require('./validators');

const MinderStatus = {
  active: 'active',
  inactive: 'inactive',
  deleted: 'deleted'
};

const createMinder = async ctx => {
  const { user } = ctx.state;
  const now = Date.now();
  const { body } = ctx.request;
  const sqlParams = {
    userId: user.id,
    sourceId: 0,
    name: body.name || '未命名思维导图',
    createDate: now,
    lastUpdateDate: now,
    status: MinderStatus.active
  };
  const minderId = await db.executeInsert(MinderSqls.CREATE_MINDER, sqlParams);
  ctx.status = 201;
  ctx.body = { id: minderId };
};

const deleteMinder = async ctx => {
  const { user } = ctx.state;
  const { minderId } = ctx.params;
  const sqlParams = {
    status: MinderStatus.deleted,
    id: minderId,
    userId: user.id,
    lastUpdateDate: Date.now()
  };
  const changeCount = await db.executeNonQuery(MinderSqls.UPDATE_MINDER_STATUS, sqlParams);
  ctx.status = 202;
  ctx.body = '';
};

const updateMinder = async ctx => {
  const { user } = ctx.state;
  const { minderId } = ctx.params;
  const { body } = ctx.request;
  const sqlParams = {
    id: minderId,
    name: body.name || '未命名思维导图',
    userId: user.id,
    lastUpdateDate: Date.now()
  };
  const changeCount = await db.executeNonQuery(MinderSqls.UPDATE_MINDER_NAME, sqlParams);
  ctx.status = 202;
  ctx.body = '';
};

const updateMinderData = async ctx => {
  const { user } = ctx.state;
  const { minderId } = ctx.params;
  const { body } = ctx.request;
  const sqlParams = {
    id: minderId,
    status: MinderStatus.active
  };
  // 先找到minder
  const minder = await db.executeScalar(MinderSqls.GET_MINDER_BY_ID_STATUS, sqlParams);
  if (!minder || minder.userId !== user.id) {
    // 找不到或者所有权不对
    return util.throwError('权限不足', 403);
  }
  // 更新mind.mindData
  const updateMindDataParams = {
    id: minderId,
    userId: user.id,
    lastUpdateDate: Date.now(),
    mindData: body.data || '',
    version: minder.version
  };
  const changeCount = await db.executeNonQuery(MinderSqls.UPDATE_MINDER_DATA, updateMindDataParams);
  if (!changeCount || changeCount !== 1) {
    // 理论上需要更新一条, 否者就是系统bug了
    return util.throwError('系统异常', 500);
  }
  // 保存快照
  const updateVersion = minder.version + 1;
  const minderVersion = {
    mindId: minderId,
    versionNo: String(updateVersion),
    saveDate: Date.now(),
    remark: '',
    mindData: body.data || ''
  };
  // 每200次抽样保存一个快照
  if (updateVersion % 200 === 0) {
    db.executeInsert(MinderSqls.INSERT_MINDER_VERSION, minderVersion);
  }
  ctx.status = 202;
  ctx.body = '';
};

const getMinderListByUser = async ctx => {
  const { user } = ctx.state;
  const sqlParams = {
    userId: user.id,
    status: MinderStatus.active
  };
  const minderList = await db.executeQuery(MinderSqls.GET_MINDERS_BY_USER_STATUS, sqlParams);
  ctx.body = minderList;
};

const getMinderDetail = async ctx => {
  const { user } = ctx.state;
  const { minderId } = ctx.params;
  // 改为从mind表上查询
  const sqlParams = {
    id: minderId,
    status: MinderStatus.active
  };
  // 先找到minder
  const minder = await db.executeScalar(MinderSqls.GET_MINDER_BY_ID_STATUS, sqlParams);
  if (!minder || minder.userId !== user.id) {
    // 找不到或者所有权不对
    return util.throwError('权限不足', 403);
  }
  // 注释的是从快照中查找的
  // const sqlParams = { id: minderId, userId: user.id };
  // const minder = await db.executeScalar(MinderSqls.GET_MINDER_LATEST_DETAIL, sqlParams);
  ctx.body = minder;
};

const getMinderDetailByVersion = async ctx => {
  const { user } = ctx.state;
  const { minderId, version } = ctx.params;
  const sqlParams = { id: minderId, userId: user.id, versionNo: version };
  const minder = await db.executeScalar(MinderSqls.GET_MINDER_DETAIL_BY_VERSION, sqlParams);
  ctx.body = minder;
};

const getTrashMinderList = async ctx => {
  const { user } = ctx.state;
  const sqlParams = { userId: user.id, status: MinderStatus.deleted };
  const minderList = await db.executeQuery(MinderSqls.GET_MINDERS_BY_USER_STATUS, sqlParams);
  ctx.body = minderList;
};

const forceDeleteMinder = async ctx => {
  const { user } = ctx.state;
  const { minderId } = ctx.params;
  const sqlParams = {
    mindId: minderId,
    userId: user.id
  };
  const tran = await db.beginTransaction();
  try {
    await db.executeNonQuery(MinderSqls.DELETE_MINDER_BY_ID, sqlParams, tran);
    await db.executeNonQuery(MinderSqls.DELETE_MINDER_DATA_BY_MINDERID, sqlParams, tran);
    await db.commitTransaction(tran);
  } catch (e) {
    db.rollbackTransaction(tran);
    util.throwError(e.message, 500);
  }
  ctx.status = 202;
  ctx.body = '';
};

const undoDeleteMinder = async ctx => {
  const { user } = ctx.state;
  const { minderId } = ctx.params;
  const sqlParams = {
    status: MinderStatus.active,
    id: minderId,
    userId: user.id,
    lastUpdateDate: Date.now()
  };
  const changeCount = await db.executeNonQuery(MinderSqls.UPDATE_MINDER_STATUS, sqlParams);
  ctx.status = 202;
  ctx.body = '';
};

module.exports = {
  createMinder,
  deleteMinder,
  updateMinder,
  updateMinderData,
  getMinderListByUser,
  getMinderDetail,
  getMinderDetailByVersion,
  getTrashMinderList,
  forceDeleteMinder,
  undoDeleteMinder
};
