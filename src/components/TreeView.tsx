import React from "react";
import {treeItemStore} from "../stores/TreeViewStore";
import {observer} from "mobx-react";
import "../css/TreeView.css";


export class TreeView extends React.Component {

    tree;
    static idCounter = 0;
    constructor(props) {
        super(props);
        this.tree = props.tree;
    }

    private static createTreeView(tree) {
        const items = [];
        for (let node of tree) {
            if (node.onClick !== undefined) {
                items.push(<LastTreeItem {...{text: node.name, onClick: node.onClick, key: this.idCounter++}}/>)
            }
            else {
                items.push(<TreeItem {...{text: node.name, key: this.idCounter++, nodes: this.createTreeView(node.nodes)}}/>);
            }
        }
        return items;
    }

    render() {
        return (
            <div className={"TreeView Block"}>
                <ol className={"TreeItemList"}>
                    {TreeView.createTreeView(this.tree)}
                </ol>
            </div>
        );
    }

}

@observer
class TreeItem extends React.Component {

    text;
    nodes;
    onClick;
    expanded = false;

    constructor(props) {
        super(props);
        this.text = props.text;
        this.nodes = props.nodes;
        treeItemStore.register(this);
    }

    render() {
        return (
            <li className={"TreeItem"}>
                <button onClick={() => treeItemStore.toggle(this)} className={"TreeItemButton"}>
                    {this.text}
                </button>
                {
                    treeItemStore.isExpanded(this) ?
                    <ol className={"TreeItemList"}>
                        {this.nodes}
                    </ol>
                    : undefined}
            </li>
        );
    }

}

class LastTreeItem extends React.Component {

    text;
    onClick;

    constructor(props) {
        super(props);
        this.text = props.text;
        this.onClick = props.onClick;
    }

    render() {
        return (
            <li className={"TreeItem"}>
                <button onClick={this.onClick} className={"TreeItemButton"}>
                    {this.text}
                </button>
            </li>
        );
    }
}