module.exports = {
  CREATE_MINDER: `
  INSERT INTO mind(userId, sourceId, name, createDate, lastUpdateDate, status)
	VALUES(@userId, @sourceId, @name, @createDate, @lastUpdateDate, @status);
  `,
  UPDATE_MINDER_STATUS: `
  UPDATE mind
  SET status = @status, lastUpdateDate = @lastUpdateDate
  WHERE id = @id AND userId = @userId;
  `,
  UPDATE_MINDER_NAME: `
  UPDATE mind
  SET name = @name, lastUpdateDate = @lastUpdateDate
  WHERE id = @id AND userId = @userId;
  `,
  UPDATE_MINDER_DATA: `
  UPDATE mind
  SET mindData = @mindData, lastUpdateDate = @lastUpdateDate, name = @name, version = version + 1
  WHERE id = @id AND userId = @userId and version = @version;
  `,
  GET_MINDERS_BY_USER_STATUS: `
  SELECT * FROM mind
  WHERE userId = @userId AND status = @status;
  `,
  GET_MINDER_BY_ID_STATUS: `
  SELECT id, userId, name, status, mindData, version FROM mind
  WHERE id = @id AND status = @status;
  `,
  GET_MINDER_LATEST_DETAIL: `
  SELECT t1.*, t2.versionNo, t2.saveDate, t2.remark, t2.mindData
  FROM mind t1
  LEFT JOIN mind_version t2 ON t1.id = t2.mindId
  WHERE t1.id = @id AND t1.userId = @userId
  ORDER BY t2.id DESC
  LIMIT 1;
  `,
  GET_MINDER_DETAIL_BY_VERSION: `
  SELECT t1.*, t2.versionNo, t2.saveDate, t2.remark, t2.mindData
  FROM mind t1
  LEFT JOIN mind_version t2 ON t1.id = t2.mindId
  WHERE t1.id = @id AND t1.userId = @userId AND t2.versionNo = @versionNo
  ORDER BY t2.id DESC
  LIMIT 1;
  `,
  INSERT_MINDER_VERSION: `
  INSERT INTO mind_version(mindId, versionNo, saveDate, remark, mindData)
  VALUES(@mindId, @versionNo, @saveDate, @remark, @mindData);
  `,
  DELETE_MINDER_BY_ID: `
  DELETE FROM mind WHERE id = @mindId AND userId = @userId;
  `,
  DELETE_MINDER_DATA_BY_MINDERID: `
  DELETE FROM mind_version
  WHERE mindId IN
  (SELECT id FROM mind WHERE id = @mindId AND userId = @userId);
  `
};
