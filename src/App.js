import React from "react";
import './App.css';
import {TreeView} from "./components/TreeView";
import {Browser} from "./components/Browser";
import {browserStore, windowStore} from "./stores/BrowserStore";
import {t} from "i18next";
import {userStore} from "./stores/UserStore";

const tree = [
    {
        name: t("category.root"),
        nodes:
            [
                {
                    name: t("category.structure"),
                    nodes: [
                        {
                            name: t("category.subStructure.companies"),
                            onClick: () => browserStore.openWindow("company")
                        },
                        {
                            name: t("category.subStructure.departments"),
                            onClick: () => browserStore.openWindow("department")
                        },
                    ]
                },
                {
                    name: t("category.employees"),
                    onClick: () => browserStore.openWindow("employee")
                }
            ]
    },
    {
        name: t("category.assignments"),
        nodes:
            [
                {
                    name: t("category.subAssignments.all"),
                    onClick: () => browserStore.openWindow("assignment")
                },
                {
                    name: t("category.subAssignments.my"),
                    onClick: () => {
                        browserStore.openWindow("assignment");
                        windowStore
                            .getWindowData(
                                windowStore.getDataWindowId("assignment"))
                            .setFilter("author", userStore.userFio)
                    }
                },
                {
                    name: t("category.subAssignments.toMe"),
                    onClick: () => {
                        browserStore.openWindow("assignment");
                        windowStore
                            .getWindowData(
                                windowStore.getDataWindowId("assignment"))
                            .setFilter("executors", userStore.userFio)
                    }
                }
            ]
    }
    ]

function App() {
    return (
    <div className="App">
        <div className="AppContainer">
            <div className={"LeftBlock"}>
                <input type={"text"} placeholder={t("input.user")} onChange={e => userStore.userFio = e.target.value}/>
                <TreeView {...{tree}}/>
            </div>
            <Browser/>
        </div>
    </div>
  );
}

export default App;
