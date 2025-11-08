
export function parsePaginationParams(
    query: any,
    defaultLimit: number = 10,
    maxLimit: number = 100
): { page: number; limit: number; skip: number } {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit as string) || defaultLimit));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

export function buildPaginationResponse(
    page: number,
    limit: number,
    total: number
): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
} {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}

