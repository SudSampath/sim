export type FolderResourceType = 'workflow' | 'file' | 'knowledge_base' | 'table'

export interface Folder {
  id: string
  resourceType: FolderResourceType
  name: string
  userId: string
  workspaceId: string
  parentId: string | null
  locked: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

/** @deprecated Temporary compat alias for the generalized {@link Folder} type. */
export type WorkflowFolder = Folder

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[]
  level: number
}
