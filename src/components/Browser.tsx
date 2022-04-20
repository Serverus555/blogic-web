import React from "react";
import "../css/Browser.css";
import {browserStore, tabPanelStore, tabStore, windowStore} from "../stores/BrowserStore";
import {observer} from "mobx-react";
import {ListColumn, NestedEntityColumn, SelectColumn} from "../utils/ColumnProps";
import {EditEntityStore, TableStore} from "../stores/DataStore";
import {t} from "i18next";
import {DateTimeInput, DateTimeView} from "./dataViews/DateTime";
import {AssignmentStatusInput} from "./dataViews/AssignmentStatus";

@observer
export class Browser extends React.Component {

    render() {
        let dataStore = windowStore.activeWindow;
        let id = windowStore.activeWindowId;
        let window;
        if (dataStore instanceof TableStore) {
            window = <DataWindow key={id} {...{dataStore}}/>;
        }
        else if (dataStore instanceof EditEntityStore) {
            window = <EditWindow key={id} {...{dataStore}}/>;
        }
        return (
          <div className={`Browser Block`}>
              <TabPanel/>
              {window}
          </div>
        );
    };
}

@observer
class DataWindow extends React.Component {

    static idCounter = 0;
    tableHeader = [];
    data;

    tableContainerRef;

    constructor(props) {
        super(props);
        this.data = props.dataStore;
        this.data.loadMore();
        this.data.columns.forEach(col => {
            this.tableHeader.push(
                    <th key={DataWindow.idCounter++}>
                        <div>
                            <input defaultValue={this.data.filters.get(col.name)?.value} onChange={e => this.data.setFilter(col.name, e.target.value)}/>
                            <br/>
                            <button className={"TableHeaderButton"} onClick={_ => {
                                this.data.toggleSort(col.name);
                                this.data.reload();
                            }}>
                                {t(`column.${this.data.category}.${col.name}`)}
                            </button>
                        </div>
                    </th>
                );
        });
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any) {
        if (
            this.tableContainerRef.scrollTopMax == 0 &&
            !this.data.loading &&
            this.data.isDataAvailable) {
            this.data.loadMore();
        }
    }

    render() {
        const rows = [];
        this.data.table.forEach(entity => {
            const cells = [];
            this.data.columns.forEach(col => {
                let cell;
                if (col instanceof NestedEntityColumn || col instanceof ListColumn) {
                    cell = col.toString(entity[col.name]);
                }
                else if (col.type == "date") {
                    cell = <DateTimeView {...{date: entity[col.name]}}/>
                }
                else {
                    cell = entity[col.name];
                }

                cells.push(
                    <td key={DataWindow.idCounter++}>
                        {cell}
                    </td>
                );
            });
            rows.push(
                <tr
                     key={DataWindow.idCounter++}
                     onClick={() => this.data.selectEntity(entity)}
                     onDoubleClick={() => browserStore.openEditWindow(this.data.category, entity)}
                     className={`Row ${this.data.selectedEntity === entity ? "SelectedRow" : ""}`}>
                    {cells}
                </tr>
            );
        })

        return (
            <div className={"Window DataWindow"}>
                <DataWindowActionPanel {...{data: this.data}}/>
                <div className={"TableContainer"}
                     ref={el => this.tableContainerRef = el}
                     onScroll={(e) => {
                         let container = e.nativeEvent.target;
                         // @ts-ignore
                         let scroll = container.scrollTop / e.nativeEvent.target.scrollTopMax;
                         if (!this.data.loading && this.data.isDataAvailable && scroll > 0.6) {
                             this.data.loadMore();
                         }
                     }}>
                    <table>
                        <thead>
                        <tr>
                            {this.tableHeader}
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

@observer
class DataWindowActionPanel extends React.Component {

    dataStore;

    constructor(props) {
        super(props);
        this.dataStore = props.data;
    }

    render() {
        return (
            <div className={"DataWindowPanel"}>
                <button onClick={() => browserStore.openEditWindow(this.dataStore.category, undefined)}>
                    {t("button.addEntity")}
                </button>
                <button
                    onClick={() => this.dataStore.deleteSelected()}
                    className={this.dataStore.selectedEntity === undefined ? "Disabled" : ""}>
                    {t("button.deleteEntity")}
                </button>
                <button
                    onClick={() => browserStore.openEditWindow(this.dataStore.category, this.dataStore.selectedEntity)}
                    className={this.dataStore.selectedEntity === undefined ? "Disabled" : ""}>
                    {t("button.editEntity")}
                </button>
                <button onClick={() => this.dataStore.search()}>
                    {t("button.search")}
                </button>
            </div>
        );
    }
}

@observer
class EditWindow extends React.Component {

    idCounter = 0
    data;
    fields = [];
    listColumns = [];
    selectColumns = [];

    constructor(props) {
        super(props);
        this.data = props.dataStore;
        let skipColumnNames = [];
        for (let column of this.data.columns) {
            if (skipColumnNames.includes(column.name)) {
                continue;
            }

            // special columns
            if (column instanceof ListColumn) {
                this.listColumns.push(column);
            }
            else if (column instanceof SelectColumn && this.data.category == 'assignment') {
                this.fields.push(<AssignmentStatusInput
                    key={this.idCounter++}
                    {...{
                    getExecuteStatus: () => this.data.editedEntity["executeStatus"],
                    getControlStatus: () => this.data.editedEntity["controlStatus"],
                    setExecuteStatus: (v) => this.data.setColumn("executeStatus", v),
                    setControlStatus: (v) => this.data.setColumn("controlStatus", v)
                }}/>);
                skipColumnNames.push(column.name === "executeStatus" ? "controlStatus" : "executeStatus");
            }
            // normal columns
            else if (column.name !== "id") {
                let placeholder;
                let type;
                if (column instanceof NestedEntityColumn) {
                    placeholder = t(`column.${this.data.category}.${column.name}.id`)
                    type = column.columns.find(v => v.name == "id").type;
                }
                else {
                    placeholder = t(`column.${this.data.category}.${column.name}`)
                    type = column.type;
                }
                // replace to strategy?
                switch (type) {
                    case "textarea": {
                        this.fields.push(
                            <textarea
                                key={this.idCounter++}
                                onChange={e => this.data.setColumn(column.name, e.target.value)}
                                defaultValue={this.data.editedEntity[column.name]}
                                placeholder={placeholder}>
                            </textarea>
                        );
                        break;
                    }
                    case "date": {
                        this.fields.push(
                            <DateTimeInput
                                key={this.idCounter++}
                                {...{
                                    date: this.data.editedEntity[column.name],
                                    fullColumnName: `column.${this.data.category}.${column.name}`
                                }}
                            />
                        );
                        break;
                    }
                    default: {
                        this.fields.push(
                            <input
                                key={this.idCounter++}
                                onChange={e => this.data.setColumn(column.name, e.target.value)}
                                type={type}
                                defaultValue={this.data.editedEntity[column.name]}
                                placeholder={placeholder}
                            />
                        );
                    }
                }
            }
        }
    }

    render() {
        let listBlocks = [];
        for (let column of this.listColumns) {
            listBlocks.push(this.createListForm(column));
        }
        return (
            <div className={"EditWindow"}>
                <EditWindowActionPanel {...{data: this.data}}/>
                {this.fields}
                {listBlocks}
            </div>
        );
    }

    private createListForm(column) {
        let items = this.data.editedEntity[column.name];
        let type = column.itemsColumn.type;
        if (type == "nested") {
            type = "number";
        }
        let inputs = [] = items.map((v, i) => {
            return (
                <input
                    type={type}
                    onChange={e => this.data.setNestedColumn([column.name, i], e.target.value)}
                    key={i}
                    defaultValue={v.id !== undefined ? v.id : v}
                />
            );
        });
        return (
            <div key={column.name}>
                {t(`column.${this.data.category}.${column.name}`)}
                <div>
                    {inputs}
                </div>
                <button onClick={_ => this.data.pushToColumn(column.name, undefined)}>
                    {t("button.newListField")}
                </button>
                <button onClick={_ => this.data.popFromColumn(column.name)}>
                    {t("button.deleteListField")}
                </button>
            </div>
        );
    }
}

@observer
class EditWindowActionPanel extends React.Component {

    data;

    constructor(props) {
        super(props);
        this.data = props.data;
    }

    render() {
        return (
            <div className={"EditWindowPanel"}>
                <button onClick={() => this.data.save()}>
                    {t("button.save")}
                </button>
                <button onClick={() => this.data.delete()}>
                    {t("button.delete")}
                </button>
                <button onClick={() =>
                    browserStore.closeWindow(windowStore.getEditWindowId(this.data.category, this.data.origEntity?.id))}>
                    {t("button.close")}
                </button>
            </div>
        );
    }
}

@observer
class TabPanel extends React.Component {

    render() {
        let tabs = [];
        tabPanelStore.tabOrder.forEach(tabId => {
            let tabData = tabStore.tabs.get(tabId);
            tabs.push(<Tab key={tabId} {...{tabData}}/>);
        })

        return (
            <div className={"TabPanel"}>
                {tabs}
            </div>
        );
    };
}

@observer
class Tab extends React.Component {
    data;

    constructor(props) {
        super(props)
        this.data = props.tabData;
    }

    render() {
        return (
            <div className={"Tab"}>
                <button onClick={this.data.onClick} className={"TabButton"}>
                    {this.data.name}
                </button>

                <button onClick={this.data.onClickClose} className={"TabCloseButton"}>
                    x
                </button>
            </div>
        );
    };
}