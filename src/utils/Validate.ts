import {override} from "mobx";

abstract class Constraint {

    abstract validate(obj);
}

export class ConstraintChain extends Constraint{

    constraints;
    constructor(...constraints) {
        super();
        this.constraints = constraints;
    }

    override validate(obj) {
        for (let c of this.constraints) {
            if (!c.validate(obj)) {
                return false;
            }
        }
        return true;
    }
}

export class ListItemsConstraint extends Constraint {

    itemsColumn;
    notEmpty;
    constructor(itemsColumn, notEmpty=true) {
        super();
        this.itemsColumn = itemsColumn;
        this.notEmpty = notEmpty;
    }

    override validate(obj) {
        if (!obj.length && notEmpty) {
            return false;
        }
        for (let o of obj) {
            if (!this.itemsColumn.constraint.validate(o)) {
                return false;
            }
        }
        return true;
    }
}

class PassConstraint extends Constraint {

    override validate(obj) {
        return true;
    }
}

class NumberConstraint extends Constraint{

    override validate(obj) {
        return !isNaN(parseInt(obj)) && !isNaN(obj - 0)
    }
}

class NotEmptyConstraint extends Constraint{

    override validate(obj) {
        return obj != undefined &&
            obj.length != 0 &&
            (obj instanceof String ?
                obj.trim().length != 0
                : true);
    }
}


export const notEmpty = new NotEmptyConstraint();
export const onlyNumber = new NumberConstraint();
export const pass = new PassConstraint();