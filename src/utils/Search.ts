

export class SortRule {

    column;
    isAscend;

    constructor(column, isAscend) {
        this.column = column;
        this.isAscend = isAscend;
    }
}

export class FilterRule {

    column;
    value;

    constructor(column, value) {
        this.column = column;
        this.value = value;
    }
}