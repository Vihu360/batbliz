import { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";
import { parsePaginationParams, buildPaginationResponse } from "../../utils/pagination.js";

function buildVenueWhereClause(search?: string, venueId?: string | number): any {
    const where: any = {};

    if (venueId) {
        const id = typeof venueId === 'string' ? parseInt(venueId) : venueId;
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
                country: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    return where;
}

export const getVenues = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, venueId } = req.query;

        // Build where clause
        const where = buildVenueWhereClause(
            search as string | undefined,
            venueId as string | number | undefined
        );

        // Parse pagination params
        const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

        // Execute query with pagination
        const [venues, total] = await Promise.all([
            prisma.venue.findMany({
                where,
                skip,
                take: pageLimit,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.venue.count({ where }),
        ]);

        // Build pagination response
        const pagination = buildPaginationResponse(currentPage, pageLimit, total);

        res.json({
            success: true,
            data: venues,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching venues:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get venues",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};