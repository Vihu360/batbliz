/*
  Warnings:

  - The primary key for the `ball_events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ball_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dismissed_player_id` column on the `ball_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fielder_id` column on the `ball_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `competitions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `competitions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `innings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `innings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `match_summary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `match_summary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `matches` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `toss_winner_id` column on the `matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `winner_team_id` column on the `matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `player_of_match_id` column on the `matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `player_contracts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `player_contracts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `season_id` column on the `player_contracts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `player_match_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `player_match_stats` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `players` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `players` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `seasons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `seasons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `team_match_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `team_match_stats` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `teams` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `home_venue_id` column on the `teams` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `venues` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `venues` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `match_id` on the `ball_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `innings_id` on the `ball_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `batsman_id` on the `ball_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `bowler_id` on the `ball_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `non_striker_id` on the `ball_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `match_id` on the `innings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `batting_team_id` on the `innings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `bowling_team_id` on the `innings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `match_id` on the `match_summary` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `competition_id` on the `matches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `season_id` on the `matches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `venue_id` on the `matches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_a_id` on the `matches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_b_id` on the `matches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `player_id` on the `player_contracts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `player_contracts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `match_id` on the `player_match_stats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `player_id` on the `player_match_stats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `player_match_stats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `competition_id` on the `seasons` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `match_id` on the `team_match_stats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `team_match_stats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."ball_events" DROP CONSTRAINT "ball_events_batsman_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ball_events" DROP CONSTRAINT "ball_events_bowler_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ball_events" DROP CONSTRAINT "ball_events_dismissed_player_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ball_events" DROP CONSTRAINT "ball_events_fielder_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ball_events" DROP CONSTRAINT "ball_events_innings_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ball_events" DROP CONSTRAINT "ball_events_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ball_events" DROP CONSTRAINT "ball_events_non_striker_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."innings" DROP CONSTRAINT "innings_batting_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."innings" DROP CONSTRAINT "innings_bowling_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."innings" DROP CONSTRAINT "innings_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."match_summary" DROP CONSTRAINT "match_summary_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_player_of_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_season_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_team_a_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_team_b_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_toss_winner_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_venue_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_winner_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."player_contracts" DROP CONSTRAINT "player_contracts_player_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."player_contracts" DROP CONSTRAINT "player_contracts_season_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."player_contracts" DROP CONSTRAINT "player_contracts_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."player_match_stats" DROP CONSTRAINT "player_match_stats_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."player_match_stats" DROP CONSTRAINT "player_match_stats_player_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."player_match_stats" DROP CONSTRAINT "player_match_stats_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."seasons" DROP CONSTRAINT "seasons_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."team_match_stats" DROP CONSTRAINT "team_match_stats_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."team_match_stats" DROP CONSTRAINT "team_match_stats_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teams" DROP CONSTRAINT "teams_home_venue_id_fkey";

-- AlterTable
ALTER TABLE "ball_events" DROP CONSTRAINT "ball_events_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "match_id",
ADD COLUMN     "match_id" INTEGER NOT NULL,
DROP COLUMN "innings_id",
ADD COLUMN     "innings_id" INTEGER NOT NULL,
DROP COLUMN "batsman_id",
ADD COLUMN     "batsman_id" INTEGER NOT NULL,
DROP COLUMN "bowler_id",
ADD COLUMN     "bowler_id" INTEGER NOT NULL,
DROP COLUMN "non_striker_id",
ADD COLUMN     "non_striker_id" INTEGER NOT NULL,
DROP COLUMN "dismissed_player_id",
ADD COLUMN     "dismissed_player_id" INTEGER,
DROP COLUMN "fielder_id",
ADD COLUMN     "fielder_id" INTEGER,
ADD CONSTRAINT "ball_events_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "competitions" DROP CONSTRAINT "competitions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "competitions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "innings" DROP CONSTRAINT "innings_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "match_id",
ADD COLUMN     "match_id" INTEGER NOT NULL,
DROP COLUMN "batting_team_id",
ADD COLUMN     "batting_team_id" INTEGER NOT NULL,
DROP COLUMN "bowling_team_id",
ADD COLUMN     "bowling_team_id" INTEGER NOT NULL,
ADD CONSTRAINT "innings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "match_summary" DROP CONSTRAINT "match_summary_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "match_id",
ADD COLUMN     "match_id" INTEGER NOT NULL,
ADD CONSTRAINT "match_summary_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "matches" DROP CONSTRAINT "matches_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "competition_id",
ADD COLUMN     "competition_id" INTEGER NOT NULL,
DROP COLUMN "season_id",
ADD COLUMN     "season_id" INTEGER NOT NULL,
DROP COLUMN "venue_id",
ADD COLUMN     "venue_id" INTEGER NOT NULL,
DROP COLUMN "team_a_id",
ADD COLUMN     "team_a_id" INTEGER NOT NULL,
DROP COLUMN "team_b_id",
ADD COLUMN     "team_b_id" INTEGER NOT NULL,
DROP COLUMN "toss_winner_id",
ADD COLUMN     "toss_winner_id" INTEGER,
DROP COLUMN "winner_team_id",
ADD COLUMN     "winner_team_id" INTEGER,
DROP COLUMN "player_of_match_id",
ADD COLUMN     "player_of_match_id" INTEGER,
ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "player_contracts" DROP CONSTRAINT "player_contracts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "player_id",
ADD COLUMN     "player_id" INTEGER NOT NULL,
DROP COLUMN "team_id",
ADD COLUMN     "team_id" INTEGER NOT NULL,
DROP COLUMN "season_id",
ADD COLUMN     "season_id" INTEGER,
ADD CONSTRAINT "player_contracts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "player_match_stats" DROP CONSTRAINT "player_match_stats_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "match_id",
ADD COLUMN     "match_id" INTEGER NOT NULL,
DROP COLUMN "player_id",
ADD COLUMN     "player_id" INTEGER NOT NULL,
DROP COLUMN "team_id",
ADD COLUMN     "team_id" INTEGER NOT NULL,
ADD CONSTRAINT "player_match_stats_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "players" DROP CONSTRAINT "players_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "seasons" DROP CONSTRAINT "seasons_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "competition_id",
ADD COLUMN     "competition_id" INTEGER NOT NULL,
ADD CONSTRAINT "seasons_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "team_match_stats" DROP CONSTRAINT "team_match_stats_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "match_id",
ADD COLUMN     "match_id" INTEGER NOT NULL,
DROP COLUMN "team_id",
ADD COLUMN     "team_id" INTEGER NOT NULL,
ADD CONSTRAINT "team_match_stats_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "teams" DROP CONSTRAINT "teams_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "home_venue_id",
ADD COLUMN     "home_venue_id" INTEGER,
ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "venues" DROP CONSTRAINT "venues_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "venues_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "match_summary_match_id_key" ON "match_summary"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_competition_id_year_key" ON "seasons"("competition_id", "year");

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_home_venue_id_fkey" FOREIGN KEY ("home_venue_id") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_contracts" ADD CONSTRAINT "player_contracts_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_contracts" ADD CONSTRAINT "player_contracts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_contracts" ADD CONSTRAINT "player_contracts_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_fkey" FOREIGN KEY ("team_b_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_toss_winner_id_fkey" FOREIGN KEY ("toss_winner_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_of_match_id_fkey" FOREIGN KEY ("player_of_match_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_batting_team_id_fkey" FOREIGN KEY ("batting_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_bowling_team_id_fkey" FOREIGN KEY ("bowling_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_innings_id_fkey" FOREIGN KEY ("innings_id") REFERENCES "innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_batsman_id_fkey" FOREIGN KEY ("batsman_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_non_striker_id_fkey" FOREIGN KEY ("non_striker_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_dismissed_player_id_fkey" FOREIGN KEY ("dismissed_player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_fielder_id_fkey" FOREIGN KEY ("fielder_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_match_stats" ADD CONSTRAINT "team_match_stats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_match_stats" ADD CONSTRAINT "team_match_stats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_summary" ADD CONSTRAINT "match_summary_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
