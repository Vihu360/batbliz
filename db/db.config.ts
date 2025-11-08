import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient({
    // Query logging disabled - set log: ["query"] for debugging if needed
    // log: ["query"] // Uncomment to enable query logging
});

export default prisma;