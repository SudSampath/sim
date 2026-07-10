import { db } from '@sim/db'
import { folder } from '@sim/db/schema'
import { eq } from 'drizzle-orm'
import type { FolderResourceType } from '@/lib/api/contracts/folders'
import type { DbOrTx } from '@/lib/db/types'
import type { OrchestrationErrorCode } from '@/lib/workflows/orchestration/types'

/**
 * Validates a prospective parent folder for a create/update against the
 * generic `folder` table: it must exist, be un-deleted, belong to the target
 * workspace, and (defense-in-depth alongside the DB trigger) match resourceType.
 * Mirrors the DB-level `folder_parent_resource_type_match` trigger.
 *
 * Kept in its own leaf module (no imports from `folders/orchestration.ts` or
 * `workflows/orchestration/folder-lifecycle.ts`) so both of those modules —
 * which import from each other — can share this single validation without a
 * circular import.
 */
export async function assertFolderParentValid(
  parentId: string | null | undefined,
  ctx: { workspaceId: string; resourceType: FolderResourceType },
  dbClient: DbOrTx = db
): Promise<{ error: string; errorCode: OrchestrationErrorCode } | null> {
  if (!parentId) return null

  const [parent] = await dbClient
    .select({
      workspaceId: folder.workspaceId,
      resourceType: folder.resourceType,
      deletedAt: folder.deletedAt,
    })
    .from(folder)
    .where(eq(folder.id, parentId))
    .limit(1)

  if (
    !parent ||
    parent.workspaceId !== ctx.workspaceId ||
    parent.resourceType !== ctx.resourceType ||
    parent.deletedAt
  ) {
    return { error: 'Parent folder not found', errorCode: 'validation' }
  }

  return null
}
