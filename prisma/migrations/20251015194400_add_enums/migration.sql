/*
  Warnings:

  - The `toss_decision` column on the `matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `competitions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `competitions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `match_type` on the `matches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `matches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `player_role` on the `players` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `teams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CompetitionType" AS ENUM ('ODI', 'T20', 'TEST');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('NATIONAL', 'DOMESTIC', 'FRANCHISE', 'CLUB');

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('BATSMAN', 'BOWLER', 'ALLROUNDER', 'WICKETKEEPER');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('TEST', 'ODI', 'T20', 'T10', 'OTHER');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'ABANDONED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TossDecision" AS ENUM ('BAT', 'BOWL');

-- AlterTable: Convert competitions type and status to enums
ALTER TABLE "competitions" ALTER COLUMN "type" TYPE "CompetitionType" USING "type"::"CompetitionType";
ALTER TABLE "competitions" ALTER COLUMN "status" TYPE "CompetitionStatus" USING "status"::"CompetitionStatus";

-- AlterTable: Convert matches match_type, status, and toss_decision to enums
ALTER TABLE "matches" ALTER COLUMN "match_type" TYPE "MatchType" USING "match_type"::"MatchType";
ALTER TABLE "matches" ALTER COLUMN "status" TYPE "MatchStatus" USING "status"::"MatchStatus";
ALTER TABLE "matches" ALTER COLUMN "toss_decision" TYPE "TossDecision" USING "toss_decision"::"TossDecision";

-- AlterTable: Make date_of_birth optional and convert player_role to enum
ALTER TABLE "players" ALTER COLUMN "date_of_birth" DROP NOT NULL;
ALTER TABLE "players" ALTER COLUMN "player_role" TYPE "PlayerRole" USING "player_role"::"PlayerRole";

-- AlterTable: Convert teams type to enum
ALTER TABLE "teams" ALTER COLUMN "type" TYPE "TeamType" USING "type"::"TeamType";
