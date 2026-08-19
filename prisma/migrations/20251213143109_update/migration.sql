/*
  Warnings:

  - You are about to drop the column `overs` on the `innings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[innings_id,over_number,ball_in_over,deliveryIndex]` on the table `ball_events` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ball_events" ADD COLUMN     "deliveryIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isLegalDelivery" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "ball_timestamp" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "innings" DROP COLUMN "overs",
ADD COLUMN     "ballsBowled" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ball_events_match_id_innings_id_idx" ON "ball_events"("match_id", "innings_id");

-- CreateIndex
CREATE INDEX "ball_events_innings_id_over_number_idx" ON "ball_events"("innings_id", "over_number");

-- CreateIndex
CREATE INDEX "ball_events_bowler_id_idx" ON "ball_events"("bowler_id");

-- CreateIndex
CREATE INDEX "ball_events_batsman_id_idx" ON "ball_events"("batsman_id");

-- CreateIndex
CREATE UNIQUE INDEX "ball_events_innings_id_over_number_ball_in_over_deliveryInd_key" ON "ball_events"("innings_id", "over_number", "ball_in_over", "deliveryIndex");
