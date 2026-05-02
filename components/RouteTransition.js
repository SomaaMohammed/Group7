"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";
import PropTypes from "@/lib/prop-types";

export function RouteTransition({ children }) {
    const pathname = usePathname() ?? "/";

    return (
        <ViewTransition
            key={pathname}
            name="app-page"
            enter={{
                "nav-forward": "nav-forward",
                "nav-back": "nav-back",
                default: "route-fade",
            }}
            exit={{
                "nav-forward": "nav-forward",
                "nav-back": "nav-back",
                default: "route-fade",
            }}
            default="route-fade"
        >
            <div className="route-transition">{children}</div>
        </ViewTransition>
    );
}

RouteTransition.propTypes = {
    children: PropTypes.node.isRequired,
};
