import { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";
import { parsePaginationParams, buildPaginationResponse } from "../../utils/pagination.js";

function buildCompetitionWhereClause(search?: string, competitionId?: string | number): any {
    const where: any = {};

    if (competitionId) {
        const id = typeof competitionId === 'string' ? parseInt(competitionId) : competitionId;
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
                slug: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    return where;
}

export const getCompetitions = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, competitionId } = req.query;

        // Build where clause
        const where = buildCompetitionWhereClause(
            search as string | undefined,
            competitionId as string | number | undefined
        );

        // Parse pagination params
        const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

        // Execute query with pagination
        const [competitions, total] = await Promise.all([
            prisma.competition.findMany({
                where,
                skip,
                take: pageLimit,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.competition.count({ where }),
        ]);

        // Build pagination response
        const pagination = buildPaginationResponse(currentPage, pageLimit, total);

        res.json({
            success: true,
            data: competitions,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching competitions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get competitions",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};