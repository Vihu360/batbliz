import { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";
import { parsePaginationParams, buildPaginationResponse } from "../../utils/pagination.js";

function buildPlayerWhereClause(
    search?: string,
    playerId?: string | number,
    isActive?: string | boolean
): any {
    const where: any = {};

    if (playerId) {
        const id = typeof playerId === 'string' ? parseInt(playerId) : playerId;
        if (!isNaN(id)) {
            where.id = id;
        }
    }

    // Filter by isActive if provided
    if (isActive !== undefined && isActive !== null && isActive !== "") {
        const active = typeof isActive === 'string' 
            ? isActive.toLowerCase() === 'true' 
            : isActive;
        where.isActive = active;
    }

    // Search by fullName, nationality, and knownAs
    if (search && typeof search === 'string' && search.trim()) {
        where.OR = [
            {
                fullName: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                nationality: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                knownAs: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    return where;
}

/**
 * POST /player - Create a new player with team associations
 * 
 * Request body:
 * {
 *   "fullName": "Virat Kohli",
 *   "knownAs": "Kohli",
 *   "gender": "male",
 *   "nationality": "Indian",
 *   "playerRole": "BATSMAN",
 *   "battingStyle": "Right-hand bat",
 *   "bowlingStyle": "Right-arm medium",
 *   "teams": [
 *     { "teamId": 1, "role": "Captain" },
 *     { "teamId": 5, "role": "Batsman" }
 *   ]
 * }
 */
export const createPlayer = async (req: Request, res: Response) => {
    try {
        const {
            fullName,
            knownAs,
            gender,
            dateOfBirth,
            nationality,
            battingStyle,
            bowlingStyle,
            playerRole,
            photoUrl,
            metadata,
            teams, // Array of { teamId: number, role?: string, startDate?: string, endDate?: string }
        } = req.body;

        // Validation
        if (!fullName || !gender || !nationality || !playerRole) {
            res.status(400).json({
                success: false,
                error: "fullName, gender, nationality, and playerRole are required",
            });
            return;
        }

        // Validate playerRole
        const validRoles = ["BATSMAN", "BOWLER", "ALLROUNDER", "WICKETKEEPER"];
        if (!validRoles.includes(playerRole)) {
            res.status(400).json({
                success: false,
                error: `playerRole must be one of: ${validRoles.join(", ")}`,
            });
            return;
        }

        // Validate teams if provided
        let teamMap = new Map<number, string>();
        if (teams && Array.isArray(teams) && teams.length > 0) {
            // Check all team IDs exist
            const teamIds = teams.map((t: any) => t.teamId);
            const existingTeams = await prisma.team.findMany({
                where: { id: { in: teamIds } },
                select: { id: true, type: true },
            });

            if (existingTeams.length !== teamIds.length) {
                const foundIds = existingTeams.map(t => t.id);
                const missingIds = teamIds.filter((id: number) => !foundIds.includes(id));
                res.status(400).json({
                    success: false,
                    error: `Teams not found: ${missingIds.join(", ")}`,
                });
                return;
            }

            // Check for duplicate team types (one team per type rule)
            const teamTypes = existingTeams.map(t => t.type);
            const uniqueTypes = new Set(teamTypes);
            if (teamTypes.length !== uniqueTypes.size) {
                res.status(400).json({
                    success: false,
                    error: "Cannot assign multiple teams of the same type. A player can only play for one team per type (NATIONAL, FRANCHISE, DOMESTIC, CLUB).",
                });
                return;
            }

            // Build team ID -> type map for use inside transaction
            teamMap = new Map(existingTeams.map(t => [t.id, t.type]));
        }

        // Create player with team associations in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the player
            const player = await tx.player.create({
                data: {
                    fullName,
                    knownAs: knownAs || null,
                    gender,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    nationality,
                    battingStyle: battingStyle || null,
                    bowlingStyle: bowlingStyle || null,
                    playerRole,
                    photoUrl: photoUrl || null,
                    metadata: metadata || null,
                },
            });

            // Create PlayerTeam associations if provided
            let playerTeams: any[] = [];
            if (teams && Array.isArray(teams) && teams.length > 0) {
                playerTeams = await Promise.all(
                    teams.map(async (t: any) => {
                        const teamType = teamMap.get(t.teamId)!;
                        return tx.playerTeam.create({
                            data: {
                                playerId: player.id,
                                teamId: t.teamId,
                                teamType: teamType as any,
                                role: t.role || null,
                                startDate: t.startDate ? new Date(t.startDate) : new Date(),
                                endDate: t.endDate ? new Date(t.endDate) : null,
                            },
                            include: {
                                team: {
                                    select: {
                                        id: true,
                                        name: true,
                                        shortName: true,
                                        type: true,
                                    },
                                },
                            },
                        });
                    })
                );
            }

            return { player, playerTeams };
        });

        res.status(201).json({
            success: true,
            data: {
                ...result.player,
                playerTeams: result.playerTeams,
            },
            message: "Player created successfully",
        });
    } catch (error) {
        console.error("Error creating player:", error);
        // Handle unique constraint violation
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            res.status(409).json({
                success: false,
                error: "A player with this name or team assignment already exists",
                details: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: "Failed to create player",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const getPlayers = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, playerId, isActive } = req.query;

        // Build where clause
        const where = buildPlayerWhereClause(
            search as string | undefined,
            playerId as string | number | undefined,
            isActive as string | boolean | undefined
        );

        // Parse pagination params
        const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

        // Execute query with pagination
        const [players, total] = await Promise.all([
            prisma.player.findMany({
                where,
                skip,
                take: pageLimit,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    playerTeams: {
                        where: { isActive: true },
                        include: {
                            team: {
                                select: {
                                    id: true,
                                    name: true,
                                    shortName: true,
                                    type: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.player.count({ where }),
        ]);

        // Build pagination response
        const pagination = buildPaginationResponse(currentPage, pageLimit, total);

        res.json({
            success: true,
            data: players,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching players:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get players",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

