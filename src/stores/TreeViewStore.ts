import {action, computed, get, observable, set} from "mobx";

class TreeItemStore {

    @observable
    items = observable(new Map());

    @action
    register(item) {
        set(this.items, item, false);
    }

    @action
    toggle(item) {
        set(this.items, item, !this.isExpanded(item));
    }

    @computed
    isExpanded(item) {
        return get(this.items, item);
    }
}

export const treeItemStore = new TreeItemStore();