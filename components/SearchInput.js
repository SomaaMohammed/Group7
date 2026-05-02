"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import PropTypes from "@/lib/prop-types";

export function SearchInput({ defaultValue = "" }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(defaultValue);
    const timerRef = useRef(null);

    function handleChange(e) {
        const newValue = e.target.value;
        setValue(newValue);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (newValue.trim()) {
                params.set("q", newValue.trim());
            } else {
                params.delete("q");
            }
            const query = params.toString();
            router.replace(query ? `/search?${query}` : "/search", {
                scroll: false,
                transitionTypes: ["route-update"],
            });
        }, 300);
    }

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <div className="input-group">
            <label className="input-label" htmlFor="post-search">
                Search users
            </label>
            <input
                id="post-search"
                className="input"
                type="search"
                name="q"
                placeholder="Search users..."
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}

SearchInput.propTypes = {
    defaultValue: PropTypes.string,
};
