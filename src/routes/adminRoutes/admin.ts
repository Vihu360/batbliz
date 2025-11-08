import express, { type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";

const router = express.Router();

// Database introspection - Get all table names and their columns
router.get("/schema", async (req: Request, res: Response) => {
  try {
    // Get all table names from PostgreSQL (excluding Prisma migrations)
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      ORDER BY table_name;
    `;

    // Get column information for each table
    const schemaInfo = await Promise.all(
      tables.map(async (table) => {
        const columns = await prisma.$queryRaw<Array<{
          column_name: string;
          data_type: string;
          is_nullable: string;
          column_default: string | null;
          character_maximum_length: number | null;
        }>>`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = ${table.table_name}
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `;

        return {
          tableName: table.table_name,
          columns: columns.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            defaultValue: col.column_default,
            maxLength: col.character_maximum_length
          }))
        };
      })
    );

    res.json({
      success: true,
      data: schemaInfo
    });
  } catch (error) {
    console.error("Error fetching schema:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch database schema",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get table names only
router.get("/tables", async (req: Request, res: Response) => {
  try {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      ORDER BY table_name;
    `;

    res.json({
      success: true,
      data: tables.map(t => t.table_name)
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch table names",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get columns for a specific table
router.get("/tables/:tableName/columns", async (req: Request, res: Response) => {
  try {
    let { tableName } = req.params;

    if (tableName === 'competition') {
      tableName = 'competitions';
    }

    if (tableName === 'match') {
      tableName = 'matches';
    }

    if (tableName === 'player') {
      tableName = 'players';
    }

    if (tableName === 'team') {
      tableName = 'teams';
    }

    if (tableName === "inning") {
      tableName = "innings";
    }

    if (tableName == "ball_event") {
      tableName = "ball_events";
    }

    if (tableName == "season") {
      tableName = "seasons";
    }
    
    const columns = await prisma.$queryRaw<Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
      character_maximum_length: number | null;
    }>>`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    if (columns.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Table '${tableName}' not found`
      });
    }

    res.json({
      success: true,
      data: {
        tableName,
        columns: columns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          defaultValue: col.column_default,
          maxLength: col.character_maximum_length
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch column information",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
