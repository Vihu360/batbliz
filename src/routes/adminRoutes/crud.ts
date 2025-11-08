import express, { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";

const router = express.Router();

// ============================================
// ENUMS - For validation
// ============================================
const ENUMS = {
  CompetitionStatus: ["PLANNED", "ONGOING", "COMPLETED"],
  CompetitionType: ["ODI", "T20", "TEST", "MIX"],
  TeamType: ["NATIONAL", "DOMESTIC", "FRANCHISE", "CLUB"],
  PlayerRole: ["BATSMAN", "BOWLER", "ALLROUNDER", "WICKETKEEPER"],
  MatchType: ["TEST", "ODI", "T20", "T10", "OTHER"],
  MatchStatus: ["SCHEDULED", "LIVE", "COMPLETED", "ABANDONED", "CANCELLED"],
  TossDecision: ["BAT", "BOWL"],
};

// ============================================
// MODEL CONFIGURATION
// ============================================
interface ModelConfig {
  name: string;
  prismaModel: any;
  searchFields?: string[];
  defaultSort?: { field: string; order: "asc" | "desc" };
}

const MODELS: Record<string, ModelConfig> = {
  competition: {
    name: "Competition",
    prismaModel: prisma.competition,
    searchFields: ["name", "slug"],
    defaultSort: { field: "createdAt", order: "desc" },
  },
  season: {
    name: "Season",
    prismaModel: prisma.season,
    searchFields: ["name", "slug"],
    defaultSort: { field: "createdAt", order: "desc" },
  },
  venue: {
    name: "Venue",
    prismaModel: prisma.venue,
    searchFields: ["name", "city", "country"],
    defaultSort: { field: "name", order: "asc" },
  },
  team: {
    name: "Team",
    prismaModel: prisma.team,
    searchFields: ["name", "shortName", "slug", "country"],
    defaultSort: { field: "name", order: "asc" },
  },
  player: {
    name: "Player",
    prismaModel: prisma.player,
    searchFields: ["fullName", "knownAs", "slug", "nationality"],
    defaultSort: { field: "fullName", order: "asc" },
  },
  playerContract: {
    name: "PlayerContract",
    prismaModel: prisma.playerContract,
    searchFields: ["role"],
    defaultSort: { field: "createdAt", order: "desc" },
  },
  match: {
    name: "Match",
    prismaModel: prisma.match,
    searchFields: ["title", "slug"],
    defaultSort: { field: "startTimeUtc", order: "desc" },
  },
  inning: {
    name: "Inning",
    prismaModel: prisma.inning,
    searchFields: [],
    defaultSort: { field: "inningNumber", order: "asc" },
  },
  ball_events: {
    name: "ball_events",
    prismaModel: prisma.ballEvent,
    searchFields: ["commentaryText"],
    defaultSort: { field: "ballTimestamp", order: "asc" },
  },
  playerMatchStat: {
    name: "PlayerMatchStat",
    prismaModel: prisma.playerMatchStat,
    searchFields: [],
    defaultSort: { field: "createdAt", order: "desc" },
  },
  teamMatchStat: {
    name: "TeamMatchStat",
    prismaModel: prisma.teamMatchStat,
    searchFields: ["result"],
    defaultSort: { field: "createdAt", order: "desc" },
  },
  matchSummary: {
    name: "MatchSummary",
    prismaModel: prisma.matchSummary,
    searchFields: ["summaryText"],
    defaultSort: { field: "createdAt", order: "desc" },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate if a model exists
 */
function validateModel(modelName: string | undefined): ModelConfig | null {
  if (!modelName) {
    return null;
  }
  const model = MODELS[modelName.toLowerCase()];
  if (!model) {
    return null;
  }
  return model;
}

/**
 * Transform date strings to proper DateTime format*/
function transformDateFields(data: any): any {
  const transformed = { ...data };
  
  // List of fields that should be DateTime
  const dateFields = [
    'startDate', 'endDate', 'dateOfBirth', 'startTimeUtc', 'endTimeUtc',
    'inningsStartTime', 'inningsEndTime', 'ballTimestamp', 'createdAt', 'updatedAt'
  ];
  
  dateFields.forEach(field => {
    if (transformed[field] && typeof transformed[field] === 'string') {
      // If it's just a date (YYYY-MM-DD), convert to full DateTime
      if (/^\d{4}-\d{2}-\d{2}$/.test(transformed[field])) {
        transformed[field] = new Date(transformed[field] + 'T00:00:00.000Z');
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(transformed[field])) {
        // If it's already a DateTime string, ensure it has proper timezone
        transformed[field] = new Date(transformed[field]);
      }
    }
  });
  
  return transformed;
}

/**
 * Convert snake_case keys in incoming payloads to camelCase expected by Prisma
 * without overwriting already-present camelCase keys.
 */
function normalizeInputFields(input: any): any {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return input;
  }

  const toCamel = (str: string) =>
    str.replace(/_([a-z])/g, (_m, p1: string) => p1.toUpperCase());

  const normalized: any = { ...input };
  Object.keys(input).forEach((key) => {
    if (key.includes('_')) {
      const camelKey = toCamel(key);
      if (!(camelKey in normalized)) {
        normalized[camelKey] = input[key];
      }
      delete normalized[key];
    }
  });

  return normalized;
}

/*** Validate enum values*/
function validateEnumFields(data: any, modelName: string | undefined): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!modelName) {
    return { isValid: true, errors };
  }
  
  // Define enum field mappings for each model
  const enumMappings: Record<string, Record<string, string[]>> = {
    competition: {
      type: ENUMS.CompetitionType,
      status: ENUMS.CompetitionStatus,
    },
    team: {
      type: ENUMS.TeamType,
    },
    player: {
      playerRole: ENUMS.PlayerRole,
    },
    match: {
      matchType: ENUMS.MatchType,
      status: ENUMS.MatchStatus,
      tossDecision: ENUMS.TossDecision,
    },
  };
  
  const modelEnums = enumMappings[modelName.toLowerCase()];
  if (modelEnums) {
    Object.entries(modelEnums).forEach(([field, validValues]) => {
      if (data[field] && !validValues.includes(data[field])) {
        errors.push(`Invalid value for ${field}: '${data[field]}'. Valid values are: ${validValues.join(', ')}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Build where clause for filtering and search
 */
function buildWhereClause(
  searchFields: string[],
  search?: string,
  filters?: Record<string, any>
): any {
  const where: any = {};

  // Handle search
  if (search && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: {
        contains: search,
        mode: "insensitive",
      },
    }));
  }

  // Handle filters
  if (filters) {
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
        where[key] = filters[key];
      }
    });
  }

  return where;
}

/*** Parse pagination params*/
function parsePaginationParams(query: any) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/*** Parse sort params*/
function parseSortParams(query: any, defaultSort?: { field: string; order: "asc" | "desc" }) {
  const sortField = query.sortBy || defaultSort?.field || "createdAt";
  const sortOrder = query.sortOrder === "asc" || query.sortOrder === "desc" 
    ? query.sortOrder 
    : (defaultSort?.order || "desc");

  return { [sortField]: sortOrder };
}

// ============================================
// CRUD ENDPOINTS
// ============================================

/*** GET /:model - List all records with pagination */
router.get("/:model", async (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    const modelConfig = validateModel(model);

    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model '${model}' not found`,
        availableModels: Object.keys(MODELS),
      });
    }

    // Parse query params
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { search, include } = req.query;

    
    // Build query
    const where = buildWhereClause(
      modelConfig.searchFields || [],
      search as string | undefined,
    );

    const orderBy = parseSortParams(req.query, modelConfig.defaultSort);

    // Parse include relations (if provided)
    let includeClause: any = undefined;
    if (include && typeof include === "string") {
      const includes = include.split(",");
      includeClause = {};
      includes.forEach((inc) => {
        includeClause[inc.trim()] = true;
      });
    }

    // Execute query with pagination
    const [data, total] = await Promise.all([
      modelConfig.prismaModel.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: includeClause,
      }),
      modelConfig.prismaModel.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.model}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch records",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/*** GET /:model/:id - Get a single record by ID*/
router.get("/:model/:id", async (req: Request, res: Response) => {
  try {
    const { model, id } = req.params;
    const modelConfig = validateModel(model);

    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model '${model}' not found`,
      });
    }

    const { include } = req.query;

    // Parse include relations (if provided)
    let includeClause: any = undefined;
    if (include && typeof include === "string") {
      const includes = include.split(",");
      includeClause = {};
      includes.forEach((inc) => {
        includeClause[inc.trim()] = true;
      });
    }

    const data = await modelConfig.prismaModel.findUnique({
      where: { id },
      include: includeClause,
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        error: `${modelConfig.name} with id '${id}' not found`,
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.model}/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch record",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/*** POST /:model - Create a new record*/
router.post("/:model", async (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    const modelConfig = validateModel(model);

    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model '${model}' not found`,
      });
    }

    // Validate body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body is required",
      });
    }

    // Normalize keys (e.g., competition_id -> competitionId)
    const normalizedBody = normalizeInputFields(req.body);

    // Validate enum fields
    const enumValidation = validateEnumFields(normalizedBody, model);
    if (!enumValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: enumValidation.errors,
      });
    }

    // Transform date fields
    const transformedData = transformDateFields(normalizedBody);
    const data = await modelConfig.prismaModel.create({
      data: transformedData,
    });

    res.status(201).json({
      success: true,
      data,
      message: `${modelConfig.name} created successfully`,
    });
  } catch (error) {
    console.error(`Error creating ${req.params.model}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to create record",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/*** PUT /:model/:id - Update a record by ID*/
router.put("/:model/:id", async (req: Request, res: Response) => {
  try {
    let { model, id } = req.params;
    const modelConfig = validateModel(model);

    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model '${model}' not found`,
      });
    }

    // Validate body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body is required",
      });
    }

    // Normalize keys
    const normalizedBody = normalizeInputFields(req.body);

    // Validate enum fields
    const enumValidation = validateEnumFields(normalizedBody, model);
    if (!enumValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: enumValidation.errors,
      });
    }

    // Validate and parse ID
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID is required",
      });
    }
    const recordId = parseInt(id);
    if (isNaN(recordId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format",
      });
    }

    // Check if record exists
    const existing = await modelConfig.prismaModel.findUnique({
      where: { id: recordId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `${modelConfig.name} with id '${id}' not found`,
      });
    }

    // Transform date fields
    const transformedData = transformDateFields(normalizedBody);

    const data = await modelConfig.prismaModel.update({
      where: { id: recordId },
      data: transformedData,
    });

    res.json({
      success: true,
      data,
      message: `${modelConfig.name} updated successfully`,
    });
  } catch (error) {
    console.error(`Error updating ${req.params.model}/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to update record",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/*** PATCH /:model/:id - Partially update a record by ID*/
router.patch("/:model/:id", async (req: Request, res: Response) => {
  try {
    const { model, id } = req.params;
    const modelConfig = validateModel(model);

    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model '${model}' not found`,
      });
    }

    // Validate body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body is required",
      });
    }

    // Normalize keys
    const normalizedBody = normalizeInputFields(req.body);

    // Validate enum fields
    const enumValidation = validateEnumFields(normalizedBody, model);
    if (!enumValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: enumValidation.errors,
      });
    }

    // Validate and parse ID
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID is required",
      });
    }
    const recordId = parseInt(id, 10);
    if (isNaN(recordId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format",
      });
    }

    // Check if record exists
    const existing = await modelConfig.prismaModel.findUnique({
      where: { id: recordId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `${modelConfig.name} with id '${id}' not found`,
      });
    }

    // Transform date fields
    const transformedData = transformDateFields(normalizedBody);

    const data = await modelConfig.prismaModel.update({
      where: { id: recordId },
      data: transformedData,
    });

    res.json({
      success: true,
      data,
      message: `${modelConfig.name} updated successfully`,
    });
  } catch (error) {
    console.error(`Error updating ${req.params.model}/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to update record",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/*** DELETE /:model/:id - Delete a record by ID*/
router.delete("/:model/:id", async (req: Request, res: Response) => {
  try {
    const { model, id } = req.params;
    const modelConfig = validateModel(model);

    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model '${model}' not found`,
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID is required",
      });
    }

    const recordId = parseInt(id);
    if (isNaN(recordId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format",
      });
    }

    // Check if record exists
    const existing = await modelConfig.prismaModel.findUnique({
      where: { id: recordId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `${modelConfig.name} with id '${id}' not found`,
      });
    }

    await modelConfig.prismaModel.delete({
      where: { id: recordId },
    });

    res.json({
      success: true,
      message: `${modelConfig.name} deleted successfully`,
      deletedId: recordId,
    });
  } catch (error) {
    console.error(`Error deleting ${req.params.model}/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to delete record",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/*** POST /:model/bulk - Bulk create records*/
router.post("/:model/bulk", async (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    const modelConfig = validateModel(model);

    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model '${model}' not found`,
      });
    }

    // Validate body
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body must be a non-empty array",
      });
    }

    // Validate and transform each item
    const transformedData = req.body.map((item, index) => {
      // Validate enum fields for each item
      const normalizedItem = normalizeInputFields(item);
      const enumValidation = validateEnumFields(normalizedItem, model);
      if (!enumValidation.isValid) {
        throw new Error(`Item ${index}: ${enumValidation.errors.join(', ')}`);
      }
      
      // Transform date fields
      return transformDateFields(normalizedItem);
    });

    const result = await modelConfig.prismaModel.createMany({
      data: transformedData,
      skipDuplicates: true,
    });

    res.status(201).json({
      success: true,
      message: `${result.count} ${modelConfig.name}(s) created successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error(`Error bulk creating ${req.params.model}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk create records",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/*** DELETE /:model/bulk - Bulk delete records*/
router.delete("/:model/bulk", async (req: Request, res: Response) => {
  try {
    const { model } = req.params;
    const modelConfig = validateModel(model);

    if (!modelConfig) {
      return res.status(404).json({
        success: false,
        error: `Model '${model}' not found`,
      });
    }

    // Validate body
    if (!Array.isArray(req.body.ids) || req.body.ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body must contain 'ids' array with at least one ID",
      });
    }

    const result = await modelConfig.prismaModel.deleteMany({
      where: {
        id: {
          in: req.body.ids,
        },
      },
    });

    res.json({
      success: true,
      message: `${result.count} ${modelConfig.name}(s) deleted successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error(`Error bulk deleting ${req.params.model}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk delete records",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============================================
// UTILITY ENDPOINTS
// ============================================

/**
 * GET /models - List all available models
 */
router.get("/meta", async (req: Request, res: Response) => {
  const modelsList = Object.entries(MODELS).map(([key, model]) => ({
    key,
    name: model.name,
    searchFields: model.searchFields,
    defaultSort: model.defaultSort,
  }));

  res.json({
    success: true,
    data: modelsList,
    enums: ENUMS,
  });
});

/*** GET /enums - Get all enum values*/
router.get("/enums", async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: ENUMS,
  });
});

/*** GET /enums/:enumName - Get specific enum values*/
router.get("/enums/:enumName", async (req: Request, res: Response) => {
  const { enumName } = req.params;
  const enumValues = ENUMS[enumName as keyof typeof ENUMS];

  if (!enumValues) {
    return res.status(404).json({
      success: false,
      error: `Enum '${enumName}' not found`,
      availableEnums: Object.keys(ENUMS),
    });
  }

  res.json({
    success: true,
    data: {
      name: enumName,
      values: enumValues,
    },
  });
});

export default router;

