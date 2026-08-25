import { GET_CONTEXTMENU} from "../../constants/ActionTypes";

export function getContextMenu(pathname) {
    return {
        type: GET_CONTEXTMENU,
        pathname,
        request: {
            op: 'get',
            path: pathname + '/@contextmenu',
        },
    };
}
