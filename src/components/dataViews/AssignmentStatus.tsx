import React from "react";
import {t} from "i18next";
import {observer} from "mobx-react";

@observer
export class AssignmentStatusInput extends React.Component {

    idCounter = 0;
    getExecuteStatus;
    getControlStatus;
    setControlStatus;
    setExecuteStatus;

    controlSelectRef;

    constructor(props) {
        super(props);
        this.getExecuteStatus = props.getExecuteStatus;
        this.getControlStatus = props.getControlStatus;
        this.setExecuteStatus = props.setExecuteStatus;
        this.setControlStatus = props.setControlStatus;
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any) {
        // change execute status must change control status
        this.setControlStatus(this.controlSelectRef.value);
    }

    getControlOptions() {
        let options = [];
        let executeStatus = this.getExecuteStatus();
        if (["PREPARE", "EXECUTE"].includes(executeStatus)) {
            options.push(this.getElement("controlStatus.WAIT", "WAIT"));
        }
        else if (executeStatus == "CONTROL") {
            options.push(this.getElement("controlStatus.HANDLING", "HANDLING"));
        }
        if (["CONTROL", "ACCEPTED"].includes(executeStatus)) {
            options.push(this.getElement("controlStatus.ACCEPTED", "ACCEPTED"));
        }
        if (["EXECUTE", "CONTROL", "REWORK"].includes(executeStatus)) {
            options.push(this.getElement("controlStatus.REJECTED", "REJECTED"));
        }
        return options;
    }

    render() {
        let executeOptions = [
            this.getElement("executeStatus.PREPARE", "PREPARE"),
            this.getElement("executeStatus.EXECUTE", "EXECUTE"),
            this.getElement("executeStatus.CONTROL", "CONTROL"),
            this.getElement("executeStatus.REWORK", "REWORK"),
            this.getElement("executeStatus.ACCEPTED", "ACCEPTED"),
        ]
        let controlOptions = this.getControlOptions();
        return (
            <div>
                {t("column.assignment.executeStatus")}
                <select
                    value={this.getExecuteStatus()}
                    onChange={e => this.setExecuteStatus(e.target.value)}
                >
                    {executeOptions}
                </select>
                {t("column.assignment.controlStatus")}
                <select
                    value={this.getControlStatus()}
                    ref={el => this.controlSelectRef = el}
                    onChange={e => this.setControlStatus(e.target.value)}
                >
                    {controlOptions}
                </select>
            </div>
        );
    }

    private getElement(statusName, value) {
        return (
            <option key={this.idCounter++} value={value}>
                {t(`column.assignment.status.${statusName}`)}
            </option>
        );
    };
}