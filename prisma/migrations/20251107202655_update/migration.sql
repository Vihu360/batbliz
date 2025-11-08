/*
  Warnings:

  - The values [OTHER] on the enum `MatchType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `end_date` on the `competitions` table. All the data in the column will be lost.
  - You are about to drop the column `external_ids` on the `competitions` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `competitions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `competitions` table. All the data in the column will be lost.
  - You are about to drop the column `external_ids` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `external_ids` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `external_ids` on the `seasons` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `seasons` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `seasons` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the `external_providers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `follows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `provider_ids_map` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[competition_id,year]` on the table `seasons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `seasons` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `seasons` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MatchType_new" AS ENUM ('TEST', 'ODI', 'T20', 'T10');
ALTER TABLE "matches" ALTER COLUMN "match_type" TYPE "MatchType_new" USING ("match_type"::text::"MatchType_new");
ALTER TYPE "MatchType" RENAME TO "MatchType_old";
ALTER TYPE "MatchType_new" RENAME TO "MatchType";
DROP TYPE "public"."MatchType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."follows" DROP CONSTRAINT "follows_followed_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."follows" DROP CONSTRAINT "follows_following_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."player_contracts" DROP CONSTRAINT "player_contracts_season_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."posts" DROP CONSTRAINT "posts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."provider_ids_map" DROP CONSTRAINT "provider_ids_map_provider_id_fkey";

-- DropIndex
DROP INDEX "public"."players_slug_key";

-- DropIndex
DROP INDEX "public"."seasons_slug_key";

-- DropIndex
DROP INDEX "public"."teams_slug_key";

-- AlterTable
ALTER TABLE "competitions" DROP COLUMN "end_date",
DROP COLUMN "external_ids",
DROP COLUMN "start_date",
DROP COLUMN "status",
ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "external_ids",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "player_contracts" ADD COLUMN     "contractType" TEXT,
ALTER COLUMN "season_id" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL;

-- AlterTable
ALTER TABLE "players" DROP COLUMN "external_ids",
DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "seasons" DROP COLUMN "external_ids",
DROP COLUMN "format",
DROP COLUMN "name",
ADD COLUMN     "year" TEXT NOT NULL,
ALTER COLUMN "slug" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "CompetitionStatus" NOT NULL;

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "slug",
ALTER COLUMN "short_name" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."external_providers";

-- DropTable
DROP TABLE "public"."follows";

-- DropTable
DROP TABLE "public"."posts";

-- DropTable
DROP TABLE "public"."provider_ids_map";

-- DropTable
DROP TABLE "public"."users";

-- CreateIndex
CREATE UNIQUE INDEX "seasons_competition_id_year_key" ON "seasons"("competition_id", "year");

-- AddForeignKey
ALTER TABLE "player_contracts" ADD CONSTRAINT "player_contracts_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
