import Navigation from "./Navigation";
import {Component} from "react";
import Simon from "./Simon";

export class Layout extends Component {
    static displayName = Layout.name;
    render () {
        return (
            <div className="main bg-dark variant-dark">
                <Navigation/>
                <Simon />
            </div>
        );
    }
}