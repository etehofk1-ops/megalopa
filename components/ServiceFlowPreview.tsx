"use client";

import { type CSSProperties, useState } from "react";

import { NodeIcon, ShieldIcon } from "@/components/icons";

const steps = [
  {
    id: "upload",
    label: "팩 업로드",
    title: "LocalCrab이 만든 후보 팩을 넣습니다.",
    metric: "3 노드 / 2 관계",
    checks: ["JSON 구조 확인", "노드와 관계 연결", "근거 항목 수집"],
  },
  {
    id: "audit",
    label: "검수 실행",
    title: "Megalopa가 위험한 관계를 먼저 찾습니다.",
    metric: "신뢰 점수 68",
    checks: ["근거 없는 관계", "강한 인과 표현", "약한 출처"],
  },
  {
    id: "repair",
    label: "수정 우선순위",
    title: "배포 전에 고칠 순서를 정리합니다.",
    metric: "상위 이슈 3개",
    checks: ["먼저 고칠 항목", "권장 수정 방향", "배포 전 확인"],
  },
];

export function ServiceFlowPreview() {
  const [activeIndex, setActiveIndex] = useState(1);
  const activeStep = steps[activeIndex] ?? steps[1];

  return (
    <section className="service-preview-section" aria-labelledby="service-preview-title">
      <div className="shell service-preview-layout">
        <div className="service-preview-copy">
          <p className="section-kicker">Inside Megalopa</p>
          <h2 id="service-preview-title" className="section-title section-title-dark">
            실제 화면은 점수보다 먼저,<br />
            무엇을 고칠지 보여줍니다.
          </h2>
          <p className="section-lead section-lead-dark">
            Megalopa는 팩을 받아 구조를 읽고, 위험한 관계를 분류한 뒤, 사람이 바로 판단할 수 있는 수정 큐로 정리합니다.
          </p>
        </div>

        <div className="service-console" aria-label="Megalopa 작동 흐름 미리보기">
          <div className="service-console-tabs" role="tablist" aria-label="서비스 작동 단계">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => setActiveIndex(index)}
              >
                {step.label}
              </button>
            ))}
          </div>

          <div key={activeStep.id} className="service-console-body">
            <div className="service-console-main">
              <div className="service-console-status">
                <ShieldIcon className="service-console-icon" />
                <span>{activeStep.metric}</span>
              </div>
              <h3>{activeStep.title}</h3>
              <div className="service-pack-card">
                <div>
                  <span>ontology-pack.json</span>
                  <strong>{activeStep.label}</strong>
                </div>
                <NodeIcon className="service-pack-icon" />
              </div>
            </div>

            <div className="service-checklist">
              {activeStep.checks.map((check, index) => (
                <div key={check} className="service-check-row" style={{ "--row-delay": `${index * 90}ms` } as CSSProperties}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{check}</strong>
                  <i aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
