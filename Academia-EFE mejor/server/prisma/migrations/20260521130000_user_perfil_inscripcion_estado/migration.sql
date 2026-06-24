-- AlterTable User: perfil y avatar
ALTER TABLE "User" ADD COLUMN "nombre" TEXT;
ALTER TABLE "User" ADD COLUMN "telefono" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

-- AlterTable Inscripcion: estado y vínculo con cuenta
ALTER TABLE "Inscripcion" ADD COLUMN "estado" TEXT NOT NULL DEFAULT 'PENDIENTE';
ALTER TABLE "Inscripcion" ADD COLUMN "userId" INTEGER;
CREATE INDEX "Inscripcion_userId_idx" ON "Inscripcion"("userId");
