import { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";
import { parsePaginationParams, buildPaginationResponse } from "../../utils/pagination.js";

function buildSeasonWhereClause(
    search?: string,
    seasonId?: string | number,
    competitionId?: string | number
): any {
    const where: any = {};

    if (seasonId) {
        const id = typeof seasonId === 'string' ? parseInt(seasonId) : seasonId;
        if (!isNaN(id)) {
            where.id = id;
        }
    }

    if (competitionId) {
        const id = typeof competitionId === 'string' ? parseInt(competitionId) : competitionId;
        if (!isNaN(id)) {
            where.competitionId = id;
        }
    }

    if (search && typeof search === 'string' && search.trim()) {
        where.OR = [
            {
                year: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                slug: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                competition: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }

    return where;
}

export const getSeasons = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, seasonId, competitionId } = req.query;

        // Build where clause
        const where = buildSeasonWhereClause(
            search as string | undefined,
            seasonId as string | number | undefined,
            competitionId as string | number | undefined
        );

        // Parse pagination params
        const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

        // Execute query with pagination
        const [seasons, total] = await Promise.all([
            prisma.season.findMany({
                where,
                skip,
                take: pageLimit,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    competition: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            }),
            prisma.season.count({ where }),
        ]);

        // Build pagination response
        const pagination = buildPaginationResponse(currentPage, pageLimit, total);

        res.json({
            success: true,
            data: seasons,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching seasons:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get seasons",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};