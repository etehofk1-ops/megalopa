"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

import crabLight from "@/app/asset/crab-light.png";
import crabBackdrop from "@/app/asset/crab-light-N.png";
import eggLight from "@/app/asset/egg-light.png";
import eggBackdrop from "@/app/asset/egg-light-N.png";
import megalopaLight from "@/app/asset/megalopa-light.png";
import megalopaBackdrop from "@/app/asset/megalopa-light-N.png";
import zoeaLight from "@/app/asset/zoea-light.png";
import zoeaBackdrop from "@/app/asset/zoea-light-N.png";

type GrowthStage = {
  id: string;
  label: string;
  title: string;
  body: string;
  system: string;
  image: StaticImageData;
  backdrop: StaticImageData;
};

const stages: GrowthStage[] = [
  {
    id: "egg",
    label: "01 Egg",
    title: "원본 자료를 넣는 단계입니다.",
    body: "문서, PDF, 웹페이지, 메모처럼 흩어진 자료를 그대로 가져와 분석의 재료로 삼습니다.",
    system: "원본 자료 입력",
    image: eggLight,
    backdrop: eggBackdrop,
  },
  {
    id: "zoea",
    label: "02 Zoea",
    title: "LocalCrab이 후보 구조를 만듭니다.",
    body: "자료를 청크, 근거, 노드 후보, 관계 후보로 나누어 팩의 초안을 만듭니다.",
    system: "LocalCrab 후보 생성",
    image: zoeaLight,
    backdrop: zoeaBackdrop,
  },
  {
    id: "megalopa",
    label: "03 Megalopa",
    title: "Megalopa가 근거와 관계를 검수합니다.",
    body: "근거 없는 관계, 과한 인과 표현, 약한 출처, 편향된 이름을 찾아 수정 순서를 정합니다.",
    system: "Megalopa 감사와 정제",
    image: megalopaLight,
    backdrop: megalopaBackdrop,
  },
  {
    id: "crab",
    label: "04 Crab",
    title: "검수를 통과한 팩만 배포 준비가 됩니다.",
    body: "출처와 사용 범위가 분명해진 팩은 OpenCrab에 올릴 수 있는 상태로 정리됩니다.",
    system: "검수 완료 팩",
    image: crabLight,
    backdrop: crabBackdrop,
  },
];

export function GrowthPin() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activeStage = stages[activeIndex] ?? stages[0];

  useEffect(() => {
    let frame = 0;

    const updateStage = () => {
      frame = 0;
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const trackTop = rect.top + window.scrollY;
      const marker = window.scrollY + window.innerHeight * 0.52;
      const progress = (marker - trackTop) / track.offsetHeight;
      const clampedProgress = Math.min(1, Math.max(0, progress));
      const nextIndex = Math.min(stages.length - 1, Math.max(0, Math.floor(progress * stages.length)));

      sectionRef.current?.style.setProperty("--growth-bg-shift", `${Math.round((0.5 - clampedProgress) * 360)}px`);
      setActiveIndex(nextIndex);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateStage);
    };

    updateStage();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section ref={sectionRef} className="growth-section" aria-labelledby="growth-title">
      <div className="growth-section-backdrop" aria-hidden="true">
        <div className={`growth-section-backdrop-inner growth-section-backdrop-${activeStage.id}`}>
          <Image
            key={`growth-bg-${activeStage.id}`}
            src={activeStage.backdrop}
            alt=""
            fill
            className="growth-section-backdrop-image"
            loading="eager"
            sizes="100vw"
          />
        </div>
      </div>
      <div className="shell">
        <div className="section-kicker">Growth Map</div>
        <h2 id="growth-title" className="section-title section-title-dark">
          Egg에서 Crab까지, 지식은 한 번에 믿을 수 있게 태어나지 않습니다.
        </h2>
        <p className="section-lead section-lead-dark">
          Megalopa는 LocalCrab과 OpenCrab 사이에서 후보 팩이 신뢰 가능한 구조로 탈피하도록 돕는 사전 감사 단계입니다.
        </p>

        <div ref={trackRef} className="growth-pin-track">
          <div className="growth-stage-sticky" aria-live="polite">
            <aside className="growth-pin">
              <div className="growth-visual">
                <Image
                  key={activeStage.id}
                  src={activeStage.image}
                  alt={`${activeStage.label} 단계 이미지`}
                  className={`growth-stage-image growth-stage-image-${activeStage.id}`}
                  sizes="(max-width: 900px) 82vw, 421px"
                  priority={activeIndex === 0}
                />
              </div>
              <div className="growth-pin-copy">
                <span>{activeStage.label}</span>
                <strong>{activeStage.system}</strong>
              </div>
            </aside>

            <article key={activeStage.id} className="growth-active-card">
              <div className="growth-step-label">{activeStage.label}</div>
              <h3>{activeStage.title}</h3>
              <p>{activeStage.body}</p>
              <span>{activeStage.system}</span>
              <ol className="growth-stage-rail" aria-label="성장 단계 진행">
                {stages.map((stage, index) => (
                  <li key={stage.id} className={index === activeIndex ? "is-active" : ""}>
                    <span>{stage.label}</span>
                    <strong>{stage.system}</strong>
                  </li>
                ))}
              </ol>
            </article>
          </div>

          <div className="growth-scroll-track" aria-hidden="true">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                data-stage-index={index}
                className="growth-scroll-trigger"
              >
                <div className="growth-mobile-step-card">
                  <strong>{stage.label}</strong>
                  <span>{stage.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
