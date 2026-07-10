import { getExposedIntegrationTools } from '@/lib/copilot/integration-tools'
import type { ExecutionContext, ToolCallResult } from '@/lib/copilot/request/types'
import { stripVersionSuffix } from '@/tools/utils'

export async function executeListIntegrationTools(
  params: Record<string, unknown>,
  _context: ExecutionContext
): Promise<ToolCallResult> {
  const raw = typeof params.integration === 'string' ? params.integration.trim() : ''
  if (!raw) {
    return { success: false, error: "Missing required parameter 'integration'" }
  }

  const all = getExposedIntegrationTools()
  const service = stripVersionSuffix(raw.toLowerCase())
  const matches = all.filter((tool) => tool.service === service)

  if (matches.length === 0) {
    const services = Array.from(new Set(all.map((tool) => tool.service))).sort()
    return {
      success: false,
      error: `Unknown integration "${raw}". Available integrations: ${services.join(', ')}`,
    }
  }

  return {
    success: true,
    output: {
      integration: service,
      note: 'Read the entry\'s "path" verbatim for exact params, then load_integration_tool({tool_ids: ["<id>"]}) and call the tool by that exact id.',
      tools: matches.map((tool) => ({
        id: tool.toolId,
        operation: tool.operation,
        path: `components/integrations/${tool.service}/${tool.operation}.json`,
        name: tool.config.name,
        description: tool.config.description,
      })),
    },
  }
}
