import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Status } from "@/components/FormPrimitives";

export type TaskRunState = "running" | "paused" | "stopped" | "failed" | "completed";

const stages = [
  "Reviewing your request",
  "Checking independent sources",
  "Comparing price, delivery, and returns",
  "Preparing the decision summary",
];

interface TaskProgressProps {
  initialState?: TaskRunState;
}

export function TaskProgress({ initialState = "running" }: TaskProgressProps) {
  const [state, setState] = useState<TaskRunState>(initialState);
  const [stageIndex, setStageIndex] = useState(initialState === "completed" ? stages.length - 1 : 0);

  useEffect(() => {
    if (state !== "running") return undefined;

    const timer = window.setTimeout(() => {
      if (stageIndex >= stages.length - 1) {
        setState("completed");
        return;
      }
      setStageIndex((current) => current + 1);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [stageIndex, state]);

  const progress = state === "completed" ? 100 : Math.round(((stageIndex + 1) / stages.length) * 100);
  const tone = state === "failed" ? "danger" : state === "completed" ? "success" : state === "running" ? "progress" : "neutral";

  function restart() {
    setStageIndex(0);
    setState("running");
  }

  return (
    <section className="task-progress" aria-labelledby="task-progress-title">
      <div className="task-progress__copy">
        <div>
          <p className="eyebrow">Task status</p>
          <h2 id="task-progress-title">
            {state === "completed" ? "Comparison ready" : stages[stageIndex]}
          </h2>
        </div>
        <Status tone={tone} className="task-progress__status">
          {state === "running" && `${progress}% complete`}
          {state === "paused" && "Paused by you"}
          {state === "stopped" && "Stopped before completion"}
          {state === "failed" && "The demo task could not continue"}
          {state === "completed" && "Finished using demo data"}
        </Status>
      </div>

      <div
        className="task-progress__track"
        role="progressbar"
        aria-label="Comparison progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ inlineSize: `${progress}%` }} />
      </div>

      <div className="task-progress__actions">
        {state === "running" && (
          <>
            <Button variant="secondary" onClick={() => setState("paused")}>Pause</Button>
            <Button variant="quiet" onClick={() => setState("stopped")}>Stop</Button>
          </>
        )}
        {state === "paused" && <Button variant="secondary" onClick={() => setState("running")}>Resume</Button>}
        {(state === "stopped" || state === "failed" || state === "completed") && (
          <Button variant="quiet" onClick={restart}>Run demo again</Button>
        )}
        {state !== "failed" && state !== "completed" && (
          <button type="button" className="text-action" onClick={() => setState("failed")}>Simulate failure</button>
        )}
      </div>
    </section>
  );
}
