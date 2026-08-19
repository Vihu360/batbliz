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

export const getMatchById = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        if (!matchId) {
            return res.status(400).json({
                success: false,
                error: "Match ID is required",
            });
        }

        const matchIdNum = parseInt(matchId, 10);

        if (isNaN(matchIdNum)) {
            return res.status(400).json({
                success: false,
                error: "Invalid match ID",
            });
        }

        const match = await prisma.match.findUnique({
            where: { id: matchIdNum },
            include: {
                competition: true,
                season: true,
                venue: true,
                teamA: true,
                teamB: true,
                tossWinner: true,
                winner: true,
                playerOfMatch: true,
                matchSummary: true,
                matchSquads: {
                    include: {
                        player: true,
                        team: true,
                    },
                },
                innings: {
                    orderBy: {
                        inningNumber: "asc",
                    },
                    include: {
                        battingTeam: true,
                        bowlingTeam: true,
                    },
                },
            },
        });

        if (!match) {
            return res.status(404).json({
                success: false,
                error: "Match not found",
            });
        }

        res.json({
            success: true,
            data: match,
        });
    } catch (error) {
        console.error("Error fetching match:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get match",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const getMatchInnings = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        if (!matchId) {
            return res.status(400).json({
                success: false,
                error: "Match ID is required",
            });
        }

        const matchIdNum = parseInt(matchId, 10);

        if (isNaN(matchIdNum)) {
            return res.status(400).json({
                success: false,
                error: "Invalid match ID",
            });
        }

        const matchExists = await prisma.match.findUnique({
            where: { id: matchIdNum },
            select: { id: true },
        });

        if (!matchExists) {
            return res.status(404).json({
                success: false,
                error: "Match not found",
            });
        }

        const innings = await prisma.inning.findMany({
            where: { matchId: matchIdNum },
            orderBy: {
                inningNumber: "asc",
            },
            include: {
                battingTeam: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                    },
                },
                bowlingTeam: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            data: innings,
            count: innings.length,
        });
    } catch (error) {
        console.error("Error fetching match innings:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get match innings",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const getMatchBallEvents = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        const { page, limit } = req.query;

        if (!matchId) {
            return res.status(400).json({
                success: false,
                error: "Match ID is required",
            });
        }

        const matchIdNum = parseInt(matchId, 10);

        if (isNaN(matchIdNum)) {
            return res.status(400).json({
                success: false,
                error: "Invalid match ID",
            });
        }

        const matchExists = await prisma.match.findUnique({
            where: { id: matchIdNum },
            select: { id: true },
        });

        if (!matchExists) {
            return res.status(404).json({
                success: false,
                error: "Match not found",
            });
        }

        const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

        const [ballEvents, total] = await Promise.all([
            prisma.ballEvent.findMany({
                where: { matchId: matchIdNum },
                skip,
                take: pageLimit,
                orderBy: [
                    { inningsId: "asc" },
                    { overNumber: "asc" },
                    { ballInOver: "asc" },
                ],
                include: {
                    innings: {
                        select: {
                            id: true,
                            inningNumber: true,
                        },
                    },
                    batsman: {
                        select: {
                            id: true,
                            fullName: true,
                            knownAs: true,
                        },
                    },
                    bowler: {
                        select: {
                            id: true,
                            fullName: true,
                            knownAs: true,
                        },
                    },
                    nonStriker: {
                        select: {
                            id: true,
                            fullName: true,
                            knownAs: true,
                        },
                    },
                    dismissedPlayer: {
                        select: {
                            id: true,
                            fullName: true,
                            knownAs: true,
                        },
                    },
                    fielder: {
                        select: {
                            id: true,
                            fullName: true,
                            knownAs: true,
                        },
                    },
                },
            }),
            prisma.ballEvent.count({ where: { matchId: matchIdNum } }),
        ]);

        const pagination = buildPaginationResponse(currentPage, pageLimit, total);

        res.json({
            success: true,
            data: ballEvents,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching match ball events:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get match ball events",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Helper function to build where clause for match squads
function buildMatchSquadWhereClause(
    search?: string,
    matchId?: string | number,
    teamId?: string | number,
    competitionId?: string | number,
    playerId?: string | number,
    role?: string
): any {
    const where: any = {};

    if (matchId) {
        const id = typeof matchId === 'string' ? parseInt(matchId) : matchId;
        if (!isNaN(id)) {
            where.matchId = id;
        }
    }

    if (teamId) {
        const id = typeof teamId === 'string' ? parseInt(teamId) : teamId;
        if (!isNaN(id)) {
            where.teamId = id;
        }
    }

    if (competitionId) {
        const id = typeof competitionId === 'string' ? parseInt(competitionId) : competitionId;
        if (!isNaN(id)) {
            where.match = { competitionId: id };
        }
    }

    if (playerId) {
        const id = typeof playerId === 'string' ? parseInt(playerId) : playerId;
        if (!isNaN(id)) {
            where.playerId = id;
        }
    }

    if (role && typeof role === 'string' && role.trim()) {
        where.role = role.toUpperCase();
    }

    // Search by player name, team name, or match name
    if (search && typeof search === 'string' && search.trim()) {
        where.OR = [
            {
                player: {
                    fullName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                player: {
                    knownAs: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                team: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                team: {
                    shortName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                match: {
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

// Get all match squads with pagination and filtering
export const getMatchSquads = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, matchId, teamId, playerId, role, competitionId } = req.query;

        // Build where clause
        const where = buildMatchSquadWhereClause(
            search as string | undefined,
            matchId as string | number | undefined,
            teamId as string | number | undefined,
            competitionId as string | number | undefined,
            playerId as string | number | undefined,
            role as string | undefined
        );

        // Parse pagination params
        const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

        // Execute query with pagination
        const [squads, total] = await Promise.all([
            prisma.matchSquad.findMany({
                where,
                skip,
                take: pageLimit,
                orderBy: [
                    { matchId: "asc" },
                    { teamId: "asc" },
                    { role: "asc" },
                ],
                include: {
                    match: {
                        select: {
                            id: true,
                            competitionId: true,
                            name: true,
                            slug: true,
                        },
                    },
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
                            logoUrl: true,
                        },
                    },
                },
            }),
            prisma.matchSquad.count({ where }),
        ]);

        // Build pagination response
        const pagination = buildPaginationResponse(currentPage, pageLimit, total);

        res.json({
            success: true,
            data: squads,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching match squads:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get match squads",
            details: error instanceof Error && error.message ? error.message : "Unknown error",
        });
    }
};

// Get match squads by match ID and team ID
export const getMatchSquadsByMatchIdAndTeamId = async (req: Request, res: Response) => {
    try {
        const { matchId, teamId } = req.params;

        if (!matchId || !teamId) {
            return res.status(400).json({
                success: false,
                error: "Match ID and Team ID are required",
            });
        }

        const matchIdNum = parseInt(matchId);
        const teamIdNum = parseInt(teamId);

        if (isNaN(matchIdNum) || isNaN(teamIdNum)) {
            return res.status(400).json({
                success: false,
                error: "Invalid Match ID or Team ID",
            });
        }

        // Get squads for the specific match and team
        const squads = await prisma.matchSquad.findMany({
            where: {
                matchId: matchIdNum,
                teamId: teamIdNum,
            },
            orderBy: [
                { role: "asc" },
                { player: { fullName: "asc" } },
            ],
            include: {
                match: {
                    select: {
                        id: true,
                        competitionId: true,
                        name: true,
                        slug: true,
                    },
                },
                player: {
                    select: {
                        id: true,
                        fullName: true,
                        knownAs: true,
                        playerRole: true,
                        nationality: true,
                        photoUrl: true,
                        battingStyle: true,
                        bowlingStyle: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                        logoUrl: true,
                    },
                },
            },
        });

        // Group by role for better organization
        const groupedByRole = {
            SELECTED: squads.filter(s => s.role === 'SELECTED'),
            PLAYING_XI: squads.filter(s => s.role === 'PLAYING_XI'),
            SUBSTITUTE: squads.filter(s => s.role === 'SUBSTITUTE'),
        };

        res.json({
            success: true,
            data: squads,
            groupedByRole,
            count: squads.length,
            matchId: matchIdNum,
            teamId: teamIdNum,
        });
    } catch (error) {
        console.error("Error fetching match squads by match and team:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get match squads",
            details: error instanceof Error && error.message ? error.message : "Unknown error",
        });
    }
};

