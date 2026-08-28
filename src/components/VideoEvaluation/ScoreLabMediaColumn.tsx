"use client";

import { useCallback, useRef } from "react";

import type { EvaluationDimension, VideoCase } from "@/types/evaluation";

import { EvaluationVideo, type EvaluationVideoHandle, type EvaluationVideoProgress } from "./EvaluationVideo";
import { FrameEvidencePanel, type FrameEvidencePanelHandle } from "./FrameEvidencePanel";

interface ScoreLabMediaColumnProps {
  caseData: VideoCase;
  dimension: EvaluationDimension;
  productName: string;
}

export function ScoreLabMediaColumn({ caseData, dimension, productName }: ScoreLabMediaColumnProps) {
  const videoRef = useRef<EvaluationVideoHandle>(null);
  const evidenceRef = useRef<FrameEvidencePanelHandle>(null);

  const handleProgress = useCallback((progress: EvaluationVideoProgress) => {
    evidenceRef.current?.updateProgress(progress.currentTime, progress.duration, progress.playing);
  }, []);

  const handleSeek = useCallback((time: number, focusVideo = false) => {
    videoRef.current?.seekTo(time);
    if (focusVideo) videoRef.current?.focus();
  }, []);

  return (
    <>
      <EvaluationVideo
        caseData={caseData}
        compact
        dimension={dimension}
        onProgress={handleProgress}
        productName={productName}
        ref={videoRef}
      />
      <FrameEvidencePanel caseData={caseData} dimension={dimension} onSeek={handleSeek} ref={evidenceRef} />
    </>
  );
}
