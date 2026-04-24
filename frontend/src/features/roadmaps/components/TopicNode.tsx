import { Handle, Position, type NodeProps } from "reactflow";

import type { GraphNodeData } from "@/lib/types";

export function TopicNode({ data }: NodeProps<GraphNodeData>) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 min-w-[160px] max-w-[200px] cursor-pointer hover:border-blue-400 hover:shadow-md transition-all">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-300 !border-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-300 !border-none"
      />
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm font-semibold text-gray-900 leading-snug">
          {data.label}
        </strong>
        {data.isEntrypoint && (
          <span className="text-xs text-blue-500 border border-blue-200 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">
            Entry
          </span>
        )}
      </div>
      {data.contentAvailable ? (
        <div className="mt-1.5 text-xs text-gray-400 leading-snug">
          {data.contentTypes.join(", ")}
        </div>
      ) : (
        <div className="mt-1.5 text-xs text-gray-300">No assets yet</div>
      )}
      {data.groupKey && (
        <div className="mt-1 text-[10px] tracking-wide uppercase text-gray-300">
          {data.groupKey}
        </div>
      )}
    </div>
  );
}
