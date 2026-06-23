-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "current_version" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_versions" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "schema" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "form_version_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "forms_status_idx" ON "forms"("status");

-- CreateIndex
CREATE INDEX "form_versions_form_id_idx" ON "form_versions"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_versions_form_id_version_number_key" ON "form_versions"("form_id", "version_number");

-- CreateIndex
CREATE INDEX "submissions_form_id_idx" ON "submissions"("form_id");

-- CreateIndex
CREATE INDEX "submissions_form_version_id_idx" ON "submissions"("form_version_id");

-- AddForeignKey
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
