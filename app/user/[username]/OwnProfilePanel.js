"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import PropTypes from "@/lib/prop-types";
import { EditProfileForm } from "./EditProfileForm";

export function OwnProfilePanel({ profile }) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <>
            <section className="card" aria-labelledby="profile-heading">
                <header className="user-profile-header">
                    <div className="user-profile-identity">
                        <Avatar
                            user={profile}
                            size="2xl"
                            alt={`${profile.username}'s avatar`}
                        />
                        <div>
                            <h1
                                id="profile-heading"
                                className="user-profile-name"
                            >
                                {profile.username}
                            </h1>
                            <p id="profile-handle" className="text-secondary">
                                @{profile.username}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </button>
                </header>

                <p id="profile-bio" className="text-secondary">
                    {profile.bio || "This user has not added a bio yet."}
                </p>

                <div className="profile-stats" aria-label="Profile statistics">
                    <span className="profile-stat">
                        <span className="profile-stat-value">
                            {profile._count.posts}
                        </span>{" "}
                        Posts
                    </span>
                    <span className="profile-stat">
                        <span className="profile-stat-value">
                            {profile._count.followers}
                        </span>{" "}
                        Followers
                    </span>
                    <span className="profile-stat">
                        <span className="profile-stat-value">
                            {profile._count.following}
                        </span>{" "}
                        Following
                    </span>
                </div>
            </section>

            {isEditing
                ? <EditProfileForm
                      user={profile}
                      onCancel={() => setIsEditing(false)}
                      onSaved={() => setIsEditing(false)}
                  />
                : null}
        </>
    );
}

OwnProfilePanel.propTypes = {
    profile: PropTypes.shape({
        username: PropTypes.string,
        bio: PropTypes.string,
        profilePicture: PropTypes.string,
        _count: PropTypes.shape({
            posts: PropTypes.number,
            followers: PropTypes.number,
            following: PropTypes.number,
        }).isRequired,
    }).isRequired,
};
