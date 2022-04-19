import {action, computed, get, makeObservable, observable, remove, set} from "mobx";
import {TableStore, EditEntityStore} from "./DataStore";

class BrowserStore {

    idCounter = 0;

    constructor() {
        makeObservable(this);
    }

    newId() {
        return this.idCounter++;
    }

    @action
    openWindow(category) {
        let id = windowStore.getDataWindowId(category);
        if (id === undefined) {
            let store = new TableStore(category);
            id = this.newWindow(store, category)
        }
        this.openWindowById(id);
        return id;
    }

    @action
    openEditWindow(category, entity) {
        let id;
        if (entity !== undefined) {
            id = windowStore.getEditWindowId(category, entity.id);
        }
        if (id === undefined) {
            let store = new EditEntityStore(category, entity);
            id = this.newWindow(store, category+" edit")
        }
        this.openWindowById(id);
        return id;
    }

    private newWindow(store, name) {
        let id = this.newId();
        windowStore.newWindow(store, id);
        tabPanelStore.newTab(name, id);
        return id;
    }

    @action
    openWindowById(id) {
        windowStore.openWindow(id);
        tabPanelStore.selectTab(id);
    }

    @action
    closeWindow(id) {
        windowStore.closeWindow(id);
        console.log(id)
        let newWindowId = tabPanelStore.getNearTabId(id)
        tabPanelStore.closeTab(id);
        if (newWindowId !== undefined) {
            this.openWindowById(newWindowId);
        }
    }

}

class WindowStore {

    @observable
    windows = observable(new Map());
    @observable
    activeWindowId;

    constructor() {
        makeObservable(this);
    }

    getDataWindowId(category) {
        for (let [k, v] of this.windows.entries()) {
            if (v instanceof TableStore && category == v.category) {
                return k;
            }
        }
    }

    getEditWindowId(category, entityId) {
        for (let [k, v] of this.windows.entries()) {
            if (category == v.category &&
                v.editedEntity !== undefined &&
                v.editedEntity.id === entityId) {
                return k;
            }
        }
    }

    @computed
    get activeWindow() {
        return get(this.windows, this.activeWindowId);
    }

    @action
    newWindow(windowData, id) {
        set(this.windows, id, windowData);
    }

    @action
    openWindow(id) {
        this.activeWindowId = id;
    }

    @action
    closeWindow(id) {
        remove(this.windows, id);
        if (this.activeWindowId === id) {
            this.activeWindowId = undefined;
        }
    }

    getWindowData(id) {
        return get(this.windows, id);
    }
}

class TabPanelStore {

    @observable
    tabOrder = []
    @observable
    selectedId;

    constructor() {
        makeObservable(this);
    }

    @action
    newTab(name, id) {
        this.tabOrder.push(id);
        tabStore.newTab(name, id);
    }

    @action
    selectTab(id) {
        if (this.selectedId !== undefined) {
            tabStore.unselect(id);
        }
        tabStore.select(id);
    }

    @action
    closeTab(id) {
        this.tabOrder.splice(this.tabOrder.indexOf(id), 1);
        tabStore.closeTab(id);
    }

    getNearTabId(id) {
        console.log(`id: ${id}`)
        let index = this.tabOrder.indexOf(id);
        if (this.tabOrder.length === 1) {
            return undefined;
        }
        if (index === 0) {
            return this.tabOrder[index+1];
        }
        else {
            return this.tabOrder[index-1];
        }
    }
}

class TabStore {

    @observable
    tabs = observable(new Map());

    constructor() {
        makeObservable(this);
    }

    @action
    newTab(name, id) {
        const onClick = () => this.onClick(id);
        const onClickClose = () => this.onClickClose(id);
        const selected = false;
        set(this.tabs, id,
            {
                name,
                selected,
                onClick,
                onClickClose
            });
    }

    @action closeTab(id) {
        remove(this.tabs, id);
    }

    @action
    onClick(id) {
        browserStore.openWindowById(id)
    }

    @action
    onClickClose(id) {
        browserStore.closeWindow(id)
    }

    static asd = 0;
    @action
    select(id) {
        get(this.tabs, id).selected = true;
    }

    @action
    unselect(id) {
        get(this.tabs, id).selected = false;
    }
}

export const browserStore = new BrowserStore();
export const tabPanelStore = new TabPanelStore();
export const tabStore = new TabStore();
export const windowStore = new WindowStore();