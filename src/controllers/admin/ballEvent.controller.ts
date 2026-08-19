import { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";
import { Prisma } from "../../../generated/prisma/index.js";
import { parsePaginationParams, buildPaginationResponse } from "../../utils/pagination.js";
import {
  emitBallEvent,
  emitInningsUpdate,
  emitMatchUpdate,
  emitWicketEvent,
  emitBoundaryEvent,
} from "../../utils/socket.js";

// Helper function to build where clause for filtering
function buildBallEventWhereClause(
  search?: string,
  matchId?: string | number,
  inningsId?: string | number,
  batsmanId?: string | number,
  bowlerId?: string | number,
  wicket?: string
): any {
  const where: any = {};

  if (matchId) {
    const id = typeof matchId === "string" ? parseInt(matchId) : matchId;
    if (!isNaN(id)) {
      where.matchId = id;
    }
  }

  if (inningsId) {
    const id = typeof inningsId === "string" ? parseInt(inningsId) : inningsId;
    if (!isNaN(id)) {
      where.inningsId = id;
    }
  }

  if (batsmanId) {
    const id = typeof batsmanId === "string" ? parseInt(batsmanId) : batsmanId;
    if (!isNaN(id)) {
      where.batsmanId = id;
    }
  }

  if (bowlerId) {
    const id = typeof bowlerId === "string" ? parseInt(bowlerId) : bowlerId;
    if (!isNaN(id)) {
      where.bowlerId = id;
    }
  }

  if (wicket !== undefined) {
    if (typeof wicket === 'string') {
      where.wicket = wicket === "true";
    } else {
      where.wicket = wicket === true;
    }
  }

  if (search && typeof search === "string" && search.trim()) {
    where.commentaryText = {
      contains: search,
      mode: "insensitive",
    };
  }

  return where;
}

// Get all ball events with pagination and filtering
export const getBallEvents = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, matchId, inningsId, batsmanId, bowlerId, wicket } = req.query;

    // Build where clause
    const where = buildBallEventWhereClause(
      search as string | undefined,
      matchId as string | number | undefined,
      inningsId as string | number | undefined,
      batsmanId as string | number | undefined,
      bowlerId as string | number | undefined,
      wicket as string | undefined
    );

    // Parse pagination params
    const { page: currentPage, limit: pageLimit, skip } = parsePaginationParams({ page, limit });

    // Execute query with pagination
    const [ballEvents, total] = await Promise.all([
      prisma.ballEvent.findMany({
        where,
        skip,
        take: pageLimit,
        orderBy: [
          { inningsId: "asc" },
          { overNumber: "asc" },
          { ballInOver: "asc" },
        ],
        include: {
          match: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        innings: {
          select: {
            id: true,
            inningNumber: true,
            runs: true,
            wickets: true,
            ballsBowled: true,
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
      prisma.ballEvent.count({ where }),
    ]);

    // Build pagination response
    const pagination = buildPaginationResponse(currentPage, pageLimit, total);

    res.json({
      success: true,
      data: ballEvents,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching ball events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get ball events",
      details: error instanceof Error && error.message ? error.message : "Unknown error",
    });
    return;
  }
};

// Get single ball event by ID
export const getBallEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: "Ball event ID is required",
      });
    return;
    }
    
    const ballEventId = parseInt(id);

    if (isNaN(ballEventId)) {
      res.status(400).json({
        success: false,
        error: "Invalid ball event ID",
      });
    return;
    }

    const ballEvent = await prisma.ballEvent.findUnique({
      where: { id: ballEventId },
      include: {
        match: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        innings: {
          select: {
            id: true,
            inningNumber: true,
            runs: true,
            wickets: true,
            ballsBowled: true,
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
    });

    if (!ballEvent) {
      res.status(404).json({
        success: false,
        error: "Ball event not found",
      });
    return;
    }

    res.json({
      success: true,
      data: ballEvent,
    });
  } catch (error) {
    console.error("Error fetching ball event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get ball event",
      details: error instanceof Error && error.message ? error.message : "Unknown error",
    });
    return;
  }
};

// Create a new ball event with transaction and real-time updates
export const createBallEvent = async (req: Request, res: Response) => {
  try {
    const {
      matchId,
      inningsId,
      overNumber,
      ballInOver,
      batsmanId,
      bowlerId,
      nonStrikerId,
      runsBatsman,
      runsExtras,
      extraType,
      wicket,
      wicketType,
      dismissedPlayerId,
      fielderId,
      commentaryText,
      ballTimestamp,
      isLegalDelivery,
      deliveryIndex,
      metadata,
    } = req.body;

    // Validation
    if (!matchId || !inningsId || overNumber === undefined || ballInOver === undefined ||
        !batsmanId || !bowlerId || !nonStrikerId) {
      res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    return;
    }

    // Use Prisma transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Determine if this is a legal delivery (not wide or no-ball)
      const isLegal = isLegalDelivery !== undefined 
        ? (isLegalDelivery === true || isLegalDelivery === "true")
        : !['Wide', 'NoBall'].includes(extraType ?? '');

      // Create ball event
      const ballEvent = await tx.ballEvent.create({
        data: {
          matchId: parseInt(matchId),
          inningsId: parseInt(inningsId),
          overNumber: parseInt(overNumber),
          ballInOver: parseInt(ballInOver),
          batsmanId: parseInt(batsmanId),
          bowlerId: parseInt(bowlerId),
          nonStrikerId: parseInt(nonStrikerId),
          runsBatsman: runsBatsman ? parseInt(runsBatsman) : 0,
          runsExtras: runsExtras ? parseInt(runsExtras) : 0,
          extraType: extraType || null,
          wicket: wicket === true || wicket === "true",
          wicketType: wicketType || null,
          dismissedPlayerId: dismissedPlayerId ? parseInt(dismissedPlayerId) : null,
          fielderId: fielderId ? parseInt(fielderId) : null,
          commentaryText: commentaryText || null,
          isLegalDelivery: isLegal,
          deliveryIndex: deliveryIndex !== undefined ? parseInt(deliveryIndex) : 0,
          ballTimestamp: ballTimestamp ? new Date(ballTimestamp) : new Date(),
          metadata: metadata || null,
        },
        include: {
          match: true,
          innings: true,
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
      });

      // Calculate total runs for this ball
      const totalRuns = (ballEvent.runsBatsman || 0) + (ballEvent.runsExtras || 0);

      // Update innings statistics
      const inningsUpdateData: any = {
        runs: { increment: totalRuns },
      };

      if (wicket === true || wicket === "true") {
        inningsUpdateData.wickets = { increment: 1 };
      }

      // Only increment ballsBowled for legal deliveries
      if (ballEvent.isLegalDelivery) {
        inningsUpdateData.ballsBowled = { increment: 1 };
      }

      if (runsExtras) {
        inningsUpdateData.extras = { increment: parseInt(runsExtras) };
      }

      const updatedInnings = await tx.inning.update({
        where: { id: parseInt(inningsId) },
        data: inningsUpdateData,
      });

      return { ballEvent, updatedInnings };
    });

    // Emit real-time events via Socket.IO
    const { ballEvent, updatedInnings } = result;

    // Emit ball event
    emitBallEvent(ballEvent.matchId, ballEvent.inningsId, {
      type: "ball-created",
      ballEvent,
      timestamp: new Date().toISOString(),
    });

    // Emit innings update
    emitInningsUpdate(ballEvent.matchId, ballEvent.inningsId, {
      type: "innings-updated",
      innings: updatedInnings,
      timestamp: new Date().toISOString(),
    });

    // Emit special events
    if (ballEvent.wicket) {
      emitWicketEvent(ballEvent.matchId, ballEvent.inningsId, {
        type: "wicket",
        ballEvent,
        innings: updatedInnings,
        timestamp: new Date().toISOString(),
      });
    }

    if (ballEvent.runsBatsman === 4 || ballEvent.runsBatsman === 6) {
      emitBoundaryEvent(ballEvent.matchId, ballEvent.inningsId, {
        type: "boundary",
        runs: ballEvent.runsBatsman,
        ballEvent,
        innings: updatedInnings,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      data: ballEvent,
      message: "Ball event created successfully",
    });
    return;
  } catch (error) {
    console.error("Error creating ball event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create ball event",
      details: error instanceof Error && error.message ? error.message : "Unknown error",
    });
    return;
  }
};

// Update ball event
export const updateBallEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: "Ball event ID is required",
      });
    return;
    }
    
    const ballEventId = parseInt(id);

    if (isNaN(ballEventId)) {
      res.status(400).json({
        success: false,
        error: "Invalid ball event ID",
      });
    return;
    }

    const {
      overNumber,
      ballInOver,
      runsBatsman,
      runsExtras,
      extraType,
      wicket,
      wicketType,
      dismissedPlayerId,
      fielderId,
      commentaryText,
      ballTimestamp,
      isLegalDelivery,
      deliveryIndex,
      metadata,
    } = req.body;

    // Check if ball event exists
    const existingBallEvent = await prisma.ballEvent.findUnique({
      where: { id: ballEventId },
    });

    if (!existingBallEvent) {
      res.status(404).json({
        success: false,
        error: "Ball event not found",
      });
    return;
    }

    // Use transaction to update ball event and recalculate innings stats
    const result = await prisma.$transaction(async (tx) => {
      // Calculate difference in runs
      const oldTotalRuns = (existingBallEvent.runsBatsman || 0) + (existingBallEvent.runsExtras || 0);
      const newRunsBatsman = runsBatsman !== undefined ? parseInt(runsBatsman) : existingBallEvent.runsBatsman;
      const newRunsExtras = runsExtras !== undefined ? parseInt(runsExtras) : existingBallEvent.runsExtras;
      const newTotalRuns = (newRunsBatsman || 0) + (newRunsExtras || 0);
      const runsDifference = newTotalRuns - oldTotalRuns;

      // Calculate wicket difference
      const oldWicket = existingBallEvent.wicket;
      const newWicket = wicket !== undefined ? (wicket === true || wicket === "true") : existingBallEvent.wicket;
      const wicketDifference = (newWicket && !oldWicket) ? 1 : (!newWicket && oldWicket) ? -1 : 0;

      // Calculate legal delivery difference
      const oldIsLegal = existingBallEvent.isLegalDelivery;
      let newIsLegal: boolean;
      if (isLegalDelivery !== undefined) {
        newIsLegal = isLegalDelivery === true || isLegalDelivery === "true";
      } else if (extraType !== undefined) {
        // If extraType changed, recalculate based on extraType
        newIsLegal = !['Wide', 'NoBall'].includes(extraType);
      } else {
        newIsLegal = oldIsLegal;
      }
      const legalDeliveryDifference = (newIsLegal && !oldIsLegal) ? 1 : (!newIsLegal && oldIsLegal) ? -1 : 0;

      // Prepare update data
      const updateData: any = {};
      if (overNumber !== undefined) updateData.overNumber = parseInt(overNumber);
      if (ballInOver !== undefined) updateData.ballInOver = parseInt(ballInOver);
      if (runsBatsman !== undefined) updateData.runsBatsman = newRunsBatsman;
      if (runsExtras !== undefined) updateData.runsExtras = newRunsExtras;
      if (extraType !== undefined) updateData.extraType = extraType;
      if (wicket !== undefined) updateData.wicket = newWicket;
      if (wicketType !== undefined) updateData.wicketType = wicketType;
      if (dismissedPlayerId !== undefined) updateData.dismissedPlayerId = dismissedPlayerId ? parseInt(dismissedPlayerId) : null;
      if (fielderId !== undefined) updateData.fielderId = fielderId ? parseInt(fielderId) : null;
      if (commentaryText !== undefined) updateData.commentaryText = commentaryText;
      if (isLegalDelivery !== undefined) updateData.isLegalDelivery = newIsLegal;
      if (deliveryIndex !== undefined) updateData.deliveryIndex = parseInt(deliveryIndex);
      if (ballTimestamp !== undefined) updateData.ballTimestamp = new Date(ballTimestamp);
      if (metadata !== undefined) updateData.metadata = metadata;

      // Update ball event
      const updatedBallEvent = await tx.ballEvent.update({
        where: { id: ballEventId },
        data: updateData,
        include: {
          match: true,
          innings: true,
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
      });

      // Update innings statistics if runs, wickets, or legal delivery status changed
      if (runsDifference !== 0 || wicketDifference !== 0 || legalDeliveryDifference !== 0) {
        const inningsUpdateData: any = {};
        if (runsDifference !== 0) {
          inningsUpdateData.runs = { increment: runsDifference };
        }
        if (wicketDifference !== 0) {
          inningsUpdateData.wickets = { increment: wicketDifference };
        }
        if (legalDeliveryDifference !== 0) {
          inningsUpdateData.ballsBowled = { increment: legalDeliveryDifference };
        }

        const updatedInnings = await tx.inning.update({
          where: { id: existingBallEvent.inningsId },
          data: inningsUpdateData,
        });

        return { updatedBallEvent, updatedInnings };
      }

      return { updatedBallEvent, updatedInnings: null };
    });

    // Emit real-time update
    emitBallEvent(result.updatedBallEvent.matchId, result.updatedBallEvent.inningsId, {
      type: "ball-updated",
      ballEvent: result.updatedBallEvent,
      timestamp: new Date().toISOString(),
    });

    if (result.updatedInnings) {
      emitInningsUpdate(result.updatedBallEvent.matchId, result.updatedBallEvent.inningsId, {
        type: "innings-updated",
        innings: result.updatedInnings,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: result.updatedBallEvent,
      message: "Ball event updated successfully",
    });
  } catch (error) {
    console.error("Error updating ball event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update ball event",
      details: error instanceof Error && error.message ? error.message : "Unknown error",
    });
    return;
  }
};

// Delete ball event
export const deleteBallEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: "Ball event ID is required",
      });
    return;
    }
    
    const ballEventId = parseInt(id);

    if (isNaN(ballEventId)) {
      res.status(400).json({
        success: false,
        error: "Invalid ball event ID",
      });
    return;
    }

    // Use transaction to delete ball event and update innings stats
    const result = await prisma.$transaction(async (tx) => {
      // Get ball event before deletion
      const ballEvent = await tx.ballEvent.findUnique({
        where: { id: ballEventId },
      });

      if (!ballEvent) {
        throw new Error("Ball event not found");
      }

      // Calculate totals to subtract from innings
      const totalRuns = (ballEvent.runsBatsman || 0) + (ballEvent.runsExtras || 0);

      // Delete ball event
      await tx.ballEvent.delete({
        where: { id: ballEventId },
      });

      // Update innings statistics
      const inningsUpdateData: any = {
        runs: { decrement: totalRuns },
      };

      if (ballEvent.wicket) {
        inningsUpdateData.wickets = { decrement: 1 };
      }

      // Only decrement ballsBowled if it was a legal delivery
      if (ballEvent.isLegalDelivery) {
        inningsUpdateData.ballsBowled = { decrement: 1 };
      }

      if (ballEvent.runsExtras) {
        inningsUpdateData.extras = { decrement: ballEvent.runsExtras };
      }

      const updatedInnings = await tx.inning.update({
        where: { id: ballEvent.inningsId },
        data: inningsUpdateData,
      });

      return { ballEvent, updatedInnings };
    });

    // Emit real-time delete event
    emitBallEvent(result.ballEvent.matchId, result.ballEvent.inningsId, {
      type: "ball-deleted",
      ballEventId,
      timestamp: new Date().toISOString(),
    });

    emitInningsUpdate(result.ballEvent.matchId, result.ballEvent.inningsId, {
      type: "innings-updated",
      innings: result.updatedInnings,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Ball event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ball event:", error);
    const errorMessage = error instanceof Error && error.message ? error.message : "Unknown error";
    
    if (errorMessage === "Ball event not found") {
      res.status(404).json({
        success: false,
        error: errorMessage,
      });
    return;
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete ball event",
      details: errorMessage,
    });
    return;
  }
};

// Get ball events by match
export const getBallEventsByMatch = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    
    if (!matchId) {
      res.status(400).json({
        success: false,
        error: "Match ID is required",
      });
    return;
    }
    
    const matchIdNum = parseInt(matchId);

    if (isNaN(matchIdNum)) {
      res.status(400).json({
        success: false,
        error: "Invalid match ID",
      });
    return;
    }

    const ballEvents = await prisma.ballEvent.findMany({
      where: { matchId: matchIdNum },
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
      },
    });

    res.json({
      success: true,
      data: ballEvents,
      count: ballEvents.length,
    });
  } catch (error) {
    console.error("Error fetching ball events by match:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get ball events",
      details: error instanceof Error && error.message ? error.message : "Unknown error",
    });
    return;
  }
};

// Get ball events by innings
export const getBallEventsByInnings = async (req: Request, res: Response) => {
  try {
    const { inningsId } = req.params;
    
    if (!inningsId) {
      res.status(400).json({
        success: false,
        error: "Innings ID is required",
      });
    return;
    }
    
    const inningsIdNum = parseInt(inningsId);

    if (isNaN(inningsIdNum)) {
      res.status(400).json({
        success: false,
        error: "Invalid innings ID",
      });
    return;
    }

    const ballEvents = await prisma.ballEvent.findMany({
      where: { inningsId: inningsIdNum },
      orderBy: [
        { overNumber: "asc" },
        { ballInOver: "asc" },
      ],
      include: {
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
    });

    res.json({
      success: true,
      data: ballEvents,
      count: ballEvents.length,
    });
  } catch (error) {
    console.error("Error fetching ball events by innings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get ball events",
      details: error instanceof Error && error.message ? error.message : "Unknown error",
    });
    return;
  }
};

