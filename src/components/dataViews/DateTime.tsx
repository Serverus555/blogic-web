import React from "react";

export class DateTimeInput extends React.Component {

    date;

    constructor(props) {
        super(props);
        this.date = props.date
    }

    render() {
        return (
            <div>
                <input
                    type={"date"}
                    onChange={e => (console.log(e))}
                />
                <input
                    type={"time"}
                    onChange={e => console.log(e)}
                />
            </div>
        );
    }
}