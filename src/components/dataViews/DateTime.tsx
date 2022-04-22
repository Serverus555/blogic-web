import React from "react";
import {t} from "i18next";
import "../../css/DateTime.css";

function dateToDateString(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    console.log(date)
    console.log(month)
    if (day < 10) {
        day = `0${day}`
    }
    if (month < 10) {
        month = `0${month}`;
    }
    console.log(day)
    console.log(month)
    console.log(year)
    return `${year}-${month}-${day}`;
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

abstract class AbstractDateTimeComponent extends React.Component {
    getDate;
    deleteDate;
    createDate;

    protected constructor(props) {
        super(props);
        this.getDate = props.getDate;
        this.deleteDate = props.deleteDate
        this.createDate = props.createDate;
    }
}

export class DateTimeInput extends AbstractDateTimeComponent {

    render() {
        return (
            <div>
                <DateInput {...this.props}/>
                <TimeInput {...this.props}/>
            </div>
        );
    }
}

export class DateInput extends AbstractDateTimeComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let date = this.getDate();
        let defaultValue = date != undefined ? dateToDateString(date) : undefined;
        return (
            <input
                type={"date"}
                onChange={e => {
                    let d = e.target.valueAsDate;
                    d == undefined ? this.deleteDate()
                        : (date ?? this.createDate()).setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
                }}
                defaultValue={defaultValue}
            />
        );
    }
}

export class TimeInput extends AbstractDateTimeComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let date = this.getDate();
        let defaultValue = date != undefined ? dateToTimeString(date) : undefined;
        return (
            <input
                type={"time"}
                onChange={e => {
                    let d = e.target.valueAsDate;
                    d == undefined ? this.deleteDate()
                        : (date ?? this.createDate());
                    date?.setHours(d.getHours());
                    date?.setMinutes(d.getMinutes());
                }}
                defaultValue={defaultValue}
            />
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
        console.log("asd")
        console.log(dateToDateString(this.date))
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