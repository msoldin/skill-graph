import { Handle, Position, type NodeProps } from "reactflow";

import type { GraphNodeData } from "@/lib/types";

export function TopicNode({ data }: NodeProps<GraphNodeData>) {
  return (
    <div className="topic-node bg-white rounded-2xl px-5 py-3 min-w-[172px] max-w-[220px] cursor-pointer transition-all">
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
        <strong className="text-sm font-semibold text-gray-950 leading-snug">
          {data.label}
        </strong>
        {data.isEntrypoint && (
          <span className="text-xs text-blue-500 border border-blue-200 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">
            Entry
          </span>
        )}
      </div>
      {data.contentAvailable ? (
        <div className="mt-1.5 text-xs text-gray-500 leading-snug">
          {data.contentTypes.join(", ")}
        </div>
      ) : (
        <div className="mt-1.5 text-xs text-gray-400">No assets yet</div>
      )}
      {data.groupKey && (
        <div className="mt-1 text-[10px] tracking-wide uppercase text-gray-400 font-medium">
          {data.groupKey}
        </div>
      )}
    </div>
  );
}
