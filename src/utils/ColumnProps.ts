import {ListItemsConstraint, notEmpty, onlyNumber} from "./Validate";

class Column {

    name;
    type;
    constraint;
    constructor(name, type, constraint) {
        this.name = name;
        this.type = type;
        this.constraint = constraint;
    }

    toString(entity) {
        return entity;
    }
}

export abstract class NestedEntityColumn extends Column {

    columns;

    protected constructor(name, columns, constraint) {
        super(name, "nested", constraint);
        this.columns = columns;
    }
}

class NestedEmployeeColumn extends NestedEntityColumn {

    constructor(name, constraint) {
        super(name, columns.get("employee"), constraint);
    }

    // not static
    toString(entity) {
        if (!entity) {
            return "";
        }
        return `${entity["lastName"]} ${entity["firstName"]} ${entity["patronymic"]} (${entity["id"]})`;
    }
}

export class ListColumn extends Column {
    itemsColumn;

    constructor(name, itemsColumn) {
        super(name, "list", new ListItemsConstraint(itemsColumn));
        this.itemsColumn = itemsColumn;
    }

    // hardcode to employee
    toString(entities) {
        let strings = [];
        for (let e of entities) {
            strings.push(this.itemsColumn.toString(e));
        }
        return strings.join("; ");
    }
}

export class SelectColumn extends Column {
    options;
    defaultValue;

    constructor(name, options, defaultValue, constraint) {
        super(name, "option", constraint);
        this.options = options;
        this.defaultValue = defaultValue;
    }
}

const columns = new Map();

columns.set("employee",
    [
        new Column("id", "number", onlyNumber),
        new Column("lastName", "text", notEmpty),
        new Column("firstName", "text", notEmpty),
        new Column("patronymic", "text", notEmpty),
        new Column("post", "text", notEmpty)
    ]);
columns.set("company",
    [
        new Column("id", "number", onlyNumber),
        new Column("name", "text", notEmpty),
        new Column("physicalAddress", "text", notEmpty),
        new Column("legalAddress", "text", notEmpty),
        new NestedEmployeeColumn("director", onlyNumber)
    ]);
columns.set("department",
    [
        new Column("id", "number", onlyNumber),
        new Column("name", "text", notEmpty),
        new Column("contacts", "text", notEmpty),
        new NestedEmployeeColumn("director", onlyNumber)
    ]);
columns.set("assignment",
    [
        new Column("id", "number", onlyNumber),
        new Column("subject", "text", notEmpty),
        new NestedEmployeeColumn("author", onlyNumber),
        new ListColumn("executors", new NestedEmployeeColumn("executor", onlyNumber)),
        new Column("deadline", "date", notEmpty),
        new SelectColumn("controlStatus", [
            "WAIT",
            "HANDLING",
            "ACCEPTED",
            "REJECTED"
        ], "WAIT", notEmpty),
        new SelectColumn("executeStatus", [
            "PREPARE",
            "EXECUTE",
            "CONTROL",
            "REWORK",
            "ACCEPTED"
        ], "PREPARE", notEmpty),
        new Column("description", "textarea", notEmpty)
    ])

columns.set("myAssignments", columns.get("assignment"))
columns.set("AssignmentsToMe", columns.get("assignment"))

export function getCategoryColumns(category) {
    return columns.get(category);
}