import React from "react";
import {t} from "i18next";
import "../../css/DateTime.css";

function dateToDateString(date) {
    let day = date.getDay() + 1;
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (day < 10) {
        day = `0${day}`
    }
    if (month < 10) {
        month = `0${month}`;
    }
    return `${year}-${day}-${month}`;
}

function dateToTimeString(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    return `${hours}:${minutes}`;
}

function parseDataString(str) {
    let sep = str.split("-");
    return {
        year: sep[0],
        day: sep[1],
        month: sep[2]
    };
}

function parseTimeString(str) {
    let sep = str.split(":")
    return {
        hours: sep[0],
        minutes: sep[1]
    };
}

export class DateTimeInput extends React.Component {

    date;
    fullColumnName

    constructor(props) {
        super(props);
        this.date = props.date;
        this.fullColumnName = props.fullColumnName;
    }

    render() {
        return (
            <div>
                {t(this.fullColumnName)}
                <input
                    type={"date"}
                    onChange={e => {
                        let d = e.target.valueAsDate;
                        this.date.setFullYear(d.getFullYear(), d.getMonth(), d.getDay());
                    }}
                    defaultValue={dateToDateString(this.date)}
                />
                <input
                    type={"time"}
                    onChange={e => {
                        let d = e.target.valueAsDate;
                        this.date.setHours(d.getHours());
                        this.date.setMinutes(d.getMinutes());
                    }}
                    defaultValue={dateToTimeString(this.date)}
                />
            </div>
        );
    }
}

export class DateTimeView extends React.Component {

    date;

    constructor(props) {
        super(props);
        this.date = props.date;
    }

    render() {
        return (
            <div>
                <input
                    type={"date"}
                    disabled
                    required
                    className={"DateView"}
                    value={dateToDateString(this.date)}
                />
                <input
                    type={"time"}
                    disabled
                    required
                    className={"TimeView"}
                    value={dateToTimeString(this.date)}
                />
            </div>
        );
    }
}