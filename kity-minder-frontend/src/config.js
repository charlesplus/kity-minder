import './config';
import { util } from './common';

window.AppConf = {
  apiHost: util.getDomain() + ':7001/api/v1/',
};
