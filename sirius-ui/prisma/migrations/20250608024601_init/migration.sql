-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "hosts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "hostname" TEXT,
    "os" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "service" TEXT,
    "version" TEXT,
    "hostId" INTEGER NOT NULL,
    CONSTRAINT "ports_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "hosts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vulnerabilities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "riskScore" REAL,
    "hostId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vulnerabilities_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "hosts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "target" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "results" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hosts_ip_key" ON "hosts"("ip");
