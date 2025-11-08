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

