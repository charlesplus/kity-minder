import { messageBox, storage } from '../../common';
import { minderService } from '../../services';

export class EditorComponent {
  static selector = 'editorComponent';
  static template = require('./editor.html');
  static $inject = ['$location', '$state'];
  constructor($location, $state) {
    this.$location = $location;
    this.$state = $state;
    this.minderId = this.$state.params.id || 0;
    this.cacheDataIntervalId = null;
    this.autoSaveDataIntervalId = null;
  }

  editor = null;
  minder = null;

  initEditor(editor, minder) {
    this.editor = editor;
    this.minder = minder;
  }

  saveMinderData = e => {
    e.preventDefault();
    const path = this.$location.path();
    if (path.startsWith('/minder/')) {
      const data = JSON.stringify(this.minder.exportJson());
      minderService.saveMinderData(this.minderId, data).then(() => {
        messageBox.msg('保存成功');
      });
    }
  };

  saveMinderDataSilently = e => {
    // e.preventDefault();
    const path = this.$location.path();
    if (path.startsWith('/minder/')) {
      const cacheKey = `minder_${this.minderId}`;
      storage.get(cacheKey).then(cacheData => {
        const data = JSON.stringify(this.minder.exportJson());
        if (data !== cacheData) {
          storage.set(cacheKey, data).then(r => {
            minderService.saveMinderData(this.minderId, data).then(() => {
              // messageBox.msg('自动保存');
              console.log("自动保存成功")
            });
          })
        }
      });
    }
  };

  async _initMinderData() {
    minderService.getMinderInfoById(this.minderId).then(minder => {
      try {
        const mindData = JSON.parse(minder.mindData);
        this.minder.importJson(mindData);
        // 新建脑图, 中心节点需要跟数据库思维导图名字一致
        if (!mindData) {
          const newMinder = this.minder.exportJson();
          newMinder.root.data.text = minder.name;
          this.minder.importJson(newMinder);
        }
        // 初始化的时候保存一次, 避免更新
        const cacheKey = `minder_${this.minderId}`;
        storage.set(cacheKey, JSON.stringify(this.minder.exportJson()));
      } catch (e) {}
    });


    // const data = await storage.get(cacheKey);
    // if (data) {
    //   this.minder.importJson(data);
    // }
    // this.cacheDataIntervalId = setInterval(() => {
    //   storage.set(cacheKey, this.minder.exportJson());
    // }, 5000);
  }

  $onInit() {
    Mousetrap.bindGlobal('mod+s', this.saveMinderData);
    this._initMinderData();
    // 每5s自动保存一次
    this.autoSaveDataIntervalId = setInterval(() => {
      this.saveMinderDataSilently();
    }, 5000);
  }

  $onDestroy() {
    this.saveMinderDataSilently();
    clearInterval(this.cacheDataIntervalId);
    clearInterval(this.autoSaveDataIntervalId);
  }
}
