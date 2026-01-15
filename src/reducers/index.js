/* istanbul ignore file */
import defaultReducers from '@plone/volto/reducers';
import contextMenu from './contextMenu';

const reducers = {
  ...defaultReducers,
  contextMenu,
};

export default reducers;
