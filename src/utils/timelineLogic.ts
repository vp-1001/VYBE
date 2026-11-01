import { TaskItem } from '../types/event';

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycleNodes?: string[]; // IDs of tasks in the detected cycle
  message?: string;
}

/**
 * Checks if adding or modifying dependencies creates a cycle in the task graph (Directed Acyclic Graph check).
 * Uses Depth-First Search with coloring: 0 = unvisited, 1 = visiting (in stack), 2 = visited.
 */
export function detectDependencyCycle(tasks: TaskItem[], proposedTaskId?: string, proposedDeps?: string[]): CycleDetectionResult {
  const adjList = new Map<string, string[]>();

  for (const t of tasks) {
    if (proposedTaskId && t.id === proposedTaskId) {
      adjList.set(t.id, proposedDeps ? [...proposedDeps] : []);
    } else {
      adjList.set(t.id, [...(t.dependencies || [])]);
    }
  }

  if (proposedTaskId && !adjList.has(proposedTaskId)) {
    adjList.set(proposedTaskId, proposedDeps ? [...proposedDeps] : []);
  }

  const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
  const parent = new Map<string, string | null>();
  let cycleNodes: string[] = [];

  function dfs(node: string, stack: string[]): boolean {
    visited.set(node, 1);
    stack.push(node);

    const neighbors = adjList.get(node) || [];
    for (const neighbor of neighbors) {
      // If the dependency points to itself
      if (neighbor === node) {
        cycleNodes = [node, node];
        return true;
      }

      const state = visited.get(neighbor) || 0;
      if (state === 1) {
        // Found back-edge (cycle)
        const cycleStartIndex = stack.indexOf(neighbor);
        cycleNodes = stack.slice(cycleStartIndex).concat(neighbor);
        return true;
      }
      if (state === 0) {
        parent.set(neighbor, node);
        if (dfs(neighbor, stack)) return true;
      }
    }

    visited.set(node, 2);
    stack.pop();
    return false;
  }

  for (const taskId of adjList.keys()) {
    if ((visited.get(taskId) || 0) === 0) {
      if (dfs(taskId, [])) {
        const taskNameMap = new Map(tasks.map(t => [t.id, t.title]));
        const readableCycle = cycleNodes.map(id => taskNameMap.get(id) || id).join(' → ');
        return {
          hasCycle: true,
          cycleNodes,
          message: `Circular dependency detected: ${readableCycle}`,
        };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Given a delayed task ID, traverses downstream tasks that depend directly or transitively on it,
 * returning the list of impacted tasks with their recommended slip.
 */
export function findImpactedDownstreamTasks(tasks: TaskItem[], delayedTaskId: string, delayDays: number = 1): {
  impactedTaskIds: string[];
  impactedTasks: { id: string; title: string; currentDueDate: string; recommendedDueDate: string }[];
} {
  // Build reverse adjacency list: parent -> children that depend on parent
  const dependentsMap = new Map<string, string[]>();
  for (const t of tasks) {
    for (const dep of (t.dependencies || [])) {
      const arr = dependentsMap.get(dep) || [];
      arr.push(t.id);
      dependentsMap.set(dep, arr);
    }
  }

  const visited = new Set<string>();
  const queue = [delayedTaskId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = dependentsMap.get(current) || [];
    for (const child of children) {
      if (!visited.has(child)) {
        visited.add(child);
        queue.push(child);
      }
    }
  }

  const impactedTasks = tasks
    .filter((t) => visited.has(t.id))
    .map((t) => {
      const curDate = new Date(t.dueDate);
      const newDate = isNaN(curDate.getTime()) ? new Date() : new Date(curDate);
      newDate.setDate(newDate.getDate() + delayDays);
      return {
        id: t.id,
        title: t.title,
        currentDueDate: t.dueDate,
        recommendedDueDate: newDate.toISOString().split('T')[0],
      };
    });

  return {
    impactedTaskIds: Array.from(visited),
    impactedTasks,
  };
}

/**
 * Calculates topological order and marks critical path tasks based on dependency chain depth.
 */
export function calculateCriticalPath(tasks: TaskItem[]): {
  criticalTaskIds: Set<string>;
  longestChainLength: number;
} {
  const taskMap = new Map<string, TaskItem>(tasks.map(t => [t.id, t]));
  const memoDepth = new Map<string, number>();

  function getDepth(taskId: string, visited: Set<string>): number {
    if (memoDepth.has(taskId)) return memoDepth.get(taskId)!;
    if (visited.has(taskId)) return 0; // safety for cycles

    visited.add(taskId);
    const task = taskMap.get(taskId);
    if (!task) return 0;

    let maxDepDepth = 0;
    const duration = task.estimatedDurationHours ? Math.ceil(task.estimatedDurationHours / 8) : 1;

    for (const depId of (task.dependencies || [])) {
      const depDepth = getDepth(depId, new Set(visited));
      if (depDepth > maxDepDepth) {
        maxDepDepth = depDepth;
      }
    }

    const total = maxDepDepth + duration;
    memoDepth.set(taskId, total);
    return total;
  }

  let longestChainLength = 0;
  for (const t of tasks) {
    const depth = getDepth(t.id, new Set());
    if (depth > longestChainLength) {
      longestChainLength = depth;
    }
  }

  // Critical path includes tasks that belong to the longest chain(s) (>= 80% of max chain)
  const criticalTaskIds = new Set<string>();
  const threshold = longestChainLength * 0.75;
  for (const t of tasks) {
    if ((memoDepth.get(t.id) || 0) >= threshold && threshold > 1) {
      criticalTaskIds.add(t.id);
    }
  }

  return {
    criticalTaskIds,
    longestChainLength,
  };
}
