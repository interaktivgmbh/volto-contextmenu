import reducers from './reducers';

import './theme/contextmenu.scss'

const applyConfig = (config) => {
  config.addonReducers = { ...config.addonReducers, ...reducers };

  return config;
};

export default applyConfig;
