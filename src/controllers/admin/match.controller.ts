import { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";
import { parsePaginationParams, buildPaginationResponse } from "../../utils/pagination.js";

function buildMatchWhereClause(
    search?: string,
    matchId?: string | number,
    competitionId?: string | number,
    seasonId?: string | number,
    status?: string,
    matchType?: string
): any {
    const where: any = {};

    if (matchId) {
        const id = typeof matchId === 'string' ? parseInt(matchId) : matchId;
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

    if (seasonId) {
        const id = typeof seasonId === 'string' ? parseInt(seasonId) : seasonId;
        if (!isNaN(id)) {
            where.seasonId = id;
        }
    }

    if (status && typeof status === 'string' && status.trim()) {
        where.status = status.toUpperCase();
    }

    if (matchType && typeof matchType === 'string' && matchType.trim()) {
        where.matchType = matchType.toUpperCase();
    }

    // Search by name and slug
    if (search && typeof search === 'string' && search.trim()) {
        where.OR = [
            {
                name: {
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
        ];
    }

    return where;
}

export const getMatches = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, matchId, competitionId, seasonId, status, matchType } = req.query;

        // Build where clause
        const where = buildMatchWhereClause(
            search as string | undefined,
            matchId as string | number | undefined,
            competitionId as string | number | undefined,
            seasonId as string | number | undefined,
            status as string | undefined,
            matchType as string | undefined
        );

        // Parse pagination params
        const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

        // Execute query with pagination
        const [matches, total] = await Promise.all([
            prisma.match.findMany({
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
                    season: {
                        select: {
                            id: true,
                            year: true,
                            slug: true,
                        },
                    },
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            country: true,
                        },
                    },
                    teamA: {
                        select: {
                            id: true,
                            name: true,
                            shortName: true,
                        },
                    },
                    teamB: {
                        select: {
                            id: true,
                            name: true,
                            shortName: true,
                        },
                    },
                    winner: {
                        select: {
                            id: true,
                            name: true,
                            shortName: true,
                        },
                    },
                    tossWinner: {
                        select: {
                            id: true,
                            name: true,
                            shortName: true,
                        },
                    },
                    playerOfMatch: {
                        select: {
                            id: true,
                            fullName: true,
                            knownAs: true,
                        },
                    },
                    matchSquads: {
                        include: {
                            player: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    knownAs: true,
                                    playerRole: true,
                                    nationality: true,
                                    photoUrl: true,
                                },
                            },
                            team: {
                                select: {
                                    id: true,
                                    name: true,
                                    shortName: true,
                                },
                            },
                        },
                        orderBy: {
                            teamId: "asc",
                        },
                    },
                },
            }),
            prisma.match.count({ where }),
        ]);

        // Build pagination response
        const pagination = buildPaginationResponse(currentPage, pageLimit, total);

        res.json({
            success: true,
            data: matches,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get matches",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

