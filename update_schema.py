with open("prisma/schema.prisma") as f:
    text = f.read()

# Replace AgentTrigger definition with full Phase 6 fields
old_trigger = """model AgentTrigger {
  id            String   @id @default(uuid())
  agentId       String
  type          String   // MANUAL, SCHEDULE, EVENT, WEBHOOK, THRESHOLD, ANOMALY, DATA_CHANGE
  configuration String   @default("{}")
  status        String   @default("ACTIVE")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  agent         Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@index([agentId])
}"""

new_trigger = """model AgentTrigger {
  id               String            @id @default(uuid())
  tenantId         String
  agentId          String
  type             String            // MANUAL, SCHEDULE, EVENT
  status           String            @default("ENABLED") // ENABLED, DISABLED
  timezone         String            @default("UTC")
  cronExpression   String?
  misfirePolicy    String            @default("RUN_ONCE") // SKIP, RUN_ONCE, CATCH_UP
  configuration    String            @default("{}") // Event topic, conditions JSON
  lastTriggeredAt  DateTime?
  nextTriggerAt    DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  tenant           Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  agent            Agent             @relation(fields: [agentId], references: [id], onDelete: Cascade)
  occurrences      TriggerOccurrence[]

  @@index([tenantId])
  @@index([agentId])
  @@index([status])
  @@index([nextTriggerAt])
}

model TriggerOccurrence {
  id             String       @id @default(uuid())
  tenantId       String
  triggerId      String
  occurrenceKey  String       @unique // triggerId + scheduledFor (UTC ISO)
  scheduledFor   DateTime
  status         String       @default("QUEUED") // QUEUED, EXECUTED, SKIPPED
  jobId          String?
  createdAt      DateTime     @default(now())

  tenant         Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  trigger        AgentTrigger @relation(fields: [triggerId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([triggerId])
  @@index([occurrenceKey])
}"""

if old_trigger in text:
    text = text.replace(old_trigger, new_trigger)
    with open("prisma/schema.prisma", "w") as f:
        f.write(text)
    print("Prisma schema updated successfully.")
else:
    print("Old trigger string not found.")
