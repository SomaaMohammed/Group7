import { prisma } from "@/lib/prisma";

export const usersRepo = {
    /** @param {string} id */
    async findById(_id) {
        /* TODO (track B) */
    },

    /** @param {string} username */
    async findByUsername(_username) {
        /* TODO (track B) */
    },

    /** @param {string} email */
    async findByEmail(_email) {
        /* TODO (track B) */
    },

    /**
     * Profile view: user + follower/following counts + post count.
     * @param {string} username
     */
    async getProfile(_username) {
        /* TODO (track B) */
    },

    /**
     * @param {{ id: string, email: string, username: string, passwordHash?: string | null }} data
     */
    async create(_data) {
        /* TODO (track B) */
    },

    /**
     * @param {string} id
     * @param {{ username?: string, bio?: string, profilePicture?: string }} patch
     */
    async update(_id, _patch) {
        /* TODO (track B) */
    },

    /**
     * Username autocomplete / user search. Use `contains` with `mode: "insensitive"`.
     * @param {string} q
     * @param {{ limit?: number }} args
     */
    async search(_q, { limit: _limit = 20 } = {}) {
        /* TODO (track B) */
    },
};
