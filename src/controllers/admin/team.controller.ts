import { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";
import { parsePaginationParams, buildPaginationResponse } from "../../utils/pagination.js";

function buildTeamWhereClause(search?: string, teamId?: string | number): any {
    const where: any = {};

    if (teamId) {
        const id = typeof teamId === 'string' ? parseInt(teamId) : teamId;
        if (!isNaN(id)) {
            where.id = id;
        }
    }

    if (search && typeof search === 'string' && search.trim()) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                shortName: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                country: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    return where;
}

export const getTeams = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, teamId } = req.query;

        // Build where clause
        const where = buildTeamWhereClause(
            search as string | undefined,
            teamId as string | number | undefined
        );

        // Parse pagination params
        const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

        // Execute query with pagination
        const [teams, total] = await Promise.all([
            prisma.team.findMany({
                where,
                skip,
                take: pageLimit,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.team.count({ where }),
        ]);

        // Build pagination response
        const pagination = buildPaginationResponse(currentPage, pageLimit, total);

        res.json({
            success: true,
            data: teams,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get teams",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

