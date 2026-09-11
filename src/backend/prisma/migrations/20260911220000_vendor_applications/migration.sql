CREATE TYPE "VendorApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "vendor_applications" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "businessName" VARCHAR(160),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "zipCode" VARCHAR(10) NOT NULL,
    "experience" VARCHAR(80),
    "services" TEXT[],
    "availability" TEXT,
    "notes" TEXT,
    "insured" BOOLEAN NOT NULL DEFAULT false,
    "agreed" BOOLEAN NOT NULL DEFAULT true,
    "status" "VendorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vendor_applications_status_createdAt_idx" ON "vendor_applications"("status", "createdAt");
CREATE INDEX "vendor_applications_email_idx" ON "vendor_applications"("email");
