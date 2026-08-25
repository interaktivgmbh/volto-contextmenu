import { GET_CONTEXTMENU } from "../../constants/ActionTypes";

export const initialState = {
  error: null,
  loaded: false,
  loading: false,
};

export default function contextMenu(state = initialState, action = {}) {
  switch (action.type) {
    case `${GET_CONTEXTMENU}_PENDING`:
      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
        pathname: action.pathname,
        items: null,
      };
    case `${GET_CONTEXTMENU}_SUCCESS`:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        pathname: action.pathname,
        ...action.result,
      };
    case `${GET_CONTEXTMENU}_FAIL`:
      return {
        ...state,
        error: 'failed',
        loaded: false,
        loading: false,
        pathname: action.pathname,
      };

    default:
      return state;
  }
}
