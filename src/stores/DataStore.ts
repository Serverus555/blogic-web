import {getCategoryColumns, ListColumn, NestedEntityColumn, SelectColumn} from "../utils/ColumnProps"
import {SortRule, FilterRule} from "../utils/Search"
import {action, computed, get, makeObservable, observable, remove, set} from "mobx";
import {loadMore as apiLoadMore, deleteEntity as apiDeleteEntity, saveEntity as apiSaveEntity} from "../api/Api";
import {browserStore, windowStore} from "./BrowserStore";
import {t} from "i18next";

abstract class DataStore {

    category;
    columns;

    protected constructor(category) {
        this.category = category;
        this.columns = getCategoryColumns(category);
    }

    // slow
    protected static deepCopyEntity(entity) {
        return JSON.parse(JSON.stringify(entity));
    }
}


export class TableStore extends DataStore {

    @observable
    table = observable([]);
    @observable
    loading;
    @observable
    isDataAvailable = true;
    @observable
    selectedEntity;
    @observable
    filters = observable(new Map());
    @observable
    sort = new SortRule("id", true);

    constructor(category) {
        super(category);
        makeObservable(this);
    }

    @action
    loadMore(count=30) {
        if (this.isDataAvailable && !this.loading) {
            this.loading = true;
            apiLoadMore(
                this.category,
                this.sort,
                Array.from(this.filters.values()),
                this.table.length,
                count,
                (data) => this.loadMoreCallback(data),
                (e) => this.loadMoreOnError(e));
        }
    }

    @action
    toggleSort(columnName) {
        if (columnName === this.sort.column) {
            this.sort.isAscend = !this.sort.isAscend;
        }
        else {
            this.sort.column = columnName;
            this.sort.isAscend = true;
        }
    }

    @action
    setFilter(columnName, value) {
        let filter = get(this.filters, columnName);
        if (value === "") {
            remove(this.filters, columnName);
        }
        if (filter === undefined) {
            filter = new FilterRule(columnName, value);
            set(this.filters, columnName, filter);
        }
        else {
            filter.value = value;
        }
    }

    @action
    selectEntity(dataRow) {
        this.selectedEntity = dataRow;
    }

    @action
    deleteSelected() {
        this.deleteEntity(this.selectedEntityId);
    }

    @action
    deleteEntity(id) {
        apiDeleteEntity(this.category, id, () => this.reload());
    }

    @action
    search() {
        this.reload();
    }

    @computed
    get selectedEntityId() {
        return this.selectedEntity["id"];
    }

    @action
    reload() {
        this.table.clear()
        this.selectedEntity = undefined;
        this.isDataAvailable = true;
        this.loadMore();
    }

    @action
    private loadMoreCallback(data) {
        if (this.category == "assignment") {
            for (let entity of data) {
                let deadline = entity["deadline"];
                let [date, time] = deadline.substring(0, deadline.indexOf(".")).split("T");
                date = date.split("-");
                time = time.split(":");
                entity["deadline"] = new Date(date[0], date[1], date[2], time[0], time[1], time[2]);
            }
        }
            if (data.length === 0) {
                this.isDataAvailable = false;
            }
            else {
                this.table.push(...data);
            }
        this.loading = false;
    }

    @action
    private loadMoreOnError(e) {
        this.loading = false;
    }
}


export class EditEntityStore extends DataStore {

    entityId;
    origEntity;
    @observable
    editedEntity;

    constructor(category, entity) {
        super(category);
        makeObservable(this);
        if (entity === undefined) {
            this.origEntity = EditEntityStore.createEmptyEntity(getCategoryColumns(this.category));
        }
        else {
            this.origEntity = entity;
        }
        this.editedEntity = DataStore.deepCopyEntity(this.origEntity);
        EditEntityStore.convertFields(getCategoryColumns(this.category), this.editedEntity);
    }

    @action
    setColumn(name, value) {
        this.editedEntity[name] = value;
    }

    @action
    setNestedColumn(path, value) {
        let entity = this.editedEntity;
        for (let i = 0; i < path.length-1; i++) {
            entity = entity[path[i]]
        }
        entity[path[path.length-1]] = value;
    }

    @action
    pushToColumn(name, value) {
        this.editedEntity[name].push(value);
    }

    @action
    popFromColumn(name) {
        return this.editedEntity[name].pop();
    }

    @action
    save() {
        for (let col of this.columns) {
            if (col.name != "id" && !col.constraint.validate(this.editedEntity[col.name])) {
                alert(`${t("error.validate")}: ${t(`column.${this.category}.${col.name}`)}`)
                return;
            }
        }
        apiSaveEntity(
            this.category,
            this.editedEntity,
            () => {
                console.log("qqq");
                console.log(windowStore.getEditWindowId(this.category, this.origEntity.id));
                browserStore.closeWindow(windowStore.getEditWindowId(this.category, this.origEntity.id));
                windowStore.getWindowData(windowStore.getDataWindowId(this.category))?.reload();
                },
            (err) => {
                alert(err);
            });
    }

    @action
    delete() {
        apiDeleteEntity(this.category, this.origEntity.id, () =>
        {
            windowStore.closeWindow(windowStore.getEditWindowId(this.category, this.origEntity.id));
            windowStore.getWindowData(windowStore.getDataWindowId(this.category))?.reload();
        });
    }

    private static createEmptyEntity(columns) {
        if (columns instanceof NestedEntityColumn) {
            columns = columns.columns;
        }
        let entity = {};
        for (let column of columns) {
            if (column instanceof NestedEntityColumn) {
                entity[column.name] = this.createEmptyEntity(column);
            }
            else if (column instanceof ListColumn) {
                entity[column.name] = [];
            }
            else if (column instanceof SelectColumn) {
                entity[column.name] = column.defaultValue;
            }
            else if (column.type == "date") {
                entity[column.name] = new Date();
            }
            else {
                entity[column.name] = null;
            }
        }
        return entity;
    }

    private static convertFields(columns, entity) {
        for (let column of columns) {
            if (column instanceof NestedEntityColumn) {
                entity[column.name] = entity[column.name]?.["id"];
            }
            else if (column instanceof ListColumn) {
                for (let item of entity[column.name]) {
                    this.convertFields([column.itemsColumn], item);
                }
            }
            else if (column.type == "date") {
                entity[column.name] = new Date(entity[column.name])
            }
        }
    }
}