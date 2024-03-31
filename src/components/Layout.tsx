import Navigation from "./Navigation";
import Simon from "./Simon";

export function Layout() {
    return <div className="main bg-dark variant-dark">
        <Navigation/>
        <Simon/>
    </div>
}
