
class Column {

    name;
    type;

    constructor(name, type="text") {
        this.name = name;
        this.type = type;
    }

    toString(entity) {
        return entity;
    }
}

export abstract class NestedEntityColumn extends Column {

    columns;

    constructor(name, columns) {
        super(name, "nested");
        this.columns = columns;
    }
}

class NestedEmployeeColumn extends NestedEntityColumn {

    constructor(name) {
        super(name, columns.get("employee"));
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
        super(name, "list");
        this.itemsColumn = itemsColumn;
    }

    // hardcode to employee
    toString(entities) {
        let strings = [];
        for (let e of entities) {
            strings.push(this.itemsColumn.toString(e));
        }
        return strings.join("\n");
    }
}

export class SelectColumn extends Column {
    options;
    defaultValue;

    constructor(name, options, defaultValue="") {
        super(name, "option");
        this.options = options;
        this.defaultValue = defaultValue;
    }
}



const columns = new Map();

columns.set("employee",
    [
        new Column("id", "number"),
        new Column("lastName"),
        new Column("firstName"),
        new Column("patronymic"),
        new Column("post")
    ]);
columns.set("company",
    [
        new Column("id", "number"),
        new Column("name"),
        new Column("physicalAddress"),
        new Column("legalAddress"),
        new NestedEmployeeColumn("director",)
    ]);
columns.set("department",
    [
        new Column("id"),
        new Column("name"),
        new Column("contacts"),
        new NestedEmployeeColumn("director")
    ]);
columns.set("assignment",
    [
        new Column("id"),
        new Column("subject"),
        new NestedEmployeeColumn("author"),
        new ListColumn("executors", new NestedEmployeeColumn("executor")),
        new Column("deadline", "date"),
        new SelectColumn("controlStatus", [
            "wait",
            "handling",
            "accepted",
            "rejected"
        ], "WAIT"),
        new SelectColumn("executeStatus", [
            "prepare",
            "execute",
            "control",
            "accepted"
        ], "PREPARE"),
        new Column("description", "textarea")
    ])

columns.set("myAssignments", columns.get("assignment"))
columns.set("AssignmentsToMe", columns.get("assignment"))

export function getCategoryColumns(category) {
    return columns.get(category);
}