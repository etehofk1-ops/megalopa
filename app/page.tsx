import Image from "next/image";
import Link from "next/link";

import { AppFrame } from "@/components/AppFrame";
import { GrowthPin } from "@/components/GrowthPin";
import { ServiceFlowPreview } from "@/components/ServiceFlowPreview";

import anatomyDark from "./asset/megalopa-anatomy-dark.png";
import heroMegalopa from "./asset/megalopa-dark.png";
import wordmarkDark from "./asset/megalopa-wordmark-dark.png";

const auditItems = [
  ["근거 없는 관계", "관계가 실제 근거와 연결되어 있는지 확인합니다."],
  ["너무 강한 주장", "causes처럼 단정적인 표현을 더 안전한 관계로 낮춥니다."],
  ["약한 출처", "공식 문서, 논문, 책, 추적 가능한 글인지 드러냅니다."],
  ["편향된 이름", "사람이나 집단을 단정하는 노드 이름을 먼저 고칩니다."],
];

export default function HomePage() {
  return (
    <AppFrame>
      <div className="landing-page">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-art" aria-hidden="true" style={{ position: "absolute" }}>
            <Image
              src={heroMegalopa}
              alt=""
              fill
              priority
              className="landing-hero-image"
              sizes="100vw"
            />
          </div>
          <div className="landing-hero-shade" aria-hidden="true" />
          <div className="shell landing-hero-inner">
            <p className="landing-kicker">Ontology QA Layer</p>
            <h1 id="landing-title" className="landing-title">Megalopa</h1>
            <p className="landing-statement">
              LocalCrab에서 만들고,<br />
              Megalopa에서 검수하고,<br />
              OpenCrab에 배포한다.
            </p>
            <p className="landing-philosophy">
              그래프는 태어날 때부터 신뢰할 수 있는 것이 아닙니다.<br />
              근거, 검수, 수정의 과정을 거쳐 탈피해야 합니다.
            </p>
            <div className="landing-actions">
              <Link href="/upload" className="landing-primary-action">팩 분석 시작</Link>
              <Link href="/docs/quick-start" className="landing-secondary-action">가이드 보기</Link>
            </div>
          </div>
          <div className="landing-flow-hint">
            <span>Egg</span>
            <span>Zoea</span>
            <span>Megalopa</span>
            <span>Crab</span>
          </div>
        </section>

        <GrowthPin />

        <ServiceFlowPreview />

        <section className="landing-philosophy-section" aria-labelledby="philosophy-title" style={{ position: "relative" }}>
          <Image
            src={anatomyDark}
            alt=""
            fill
            className="philosophy-bg"
            sizes="100vw"
          />
          <div className="philosophy-cover" aria-hidden="true" />
          <div className="shell philosophy-inner">
            <p className="section-kicker section-kicker-light">Audit Philosophy</p>
            <h2 id="philosophy-title" className="section-title">
              Megalopa는 만드는 단계가 아니라,<br />
              믿어도 되는지 따지는 단계입니다.
            </h2>
            <p className="section-lead">
              OpenCrab 팩은 에이전트가 추론할 수 있는 관계 그래프입니다. 그래서 잘못된 관계 하나가 단순 오타보다 더 멀리 퍼질 수 있습니다.
            </p>
            <div className="philosophy-lines" aria-label="Megalopa가 검수하는 항목">
              <span>근거 없는 관계를 찾고</span>
              <span>너무 강한 주장을 낮추고</span>
              <span>약한 출처를 드러내고</span>
              <span>편향된 이름을 고칩니다</span>
            </div>
          </div>
        </section>

        <section className="audit-section" aria-labelledby="audit-title">
          <div className="shell audit-layout">
            <div>
              <p className="section-kicker">What Megalopa Removes</p>
              <h2 id="audit-title" className="section-title section-title-dark">
                신뢰 가능한 팩이 되기 전,<br />
                껍질처럼 벗겨내야 하는 것들.
              </h2>
              <p className="section-lead section-lead-dark">
                Megalopa의 결과는 점수표로 끝나지 않습니다. 무엇을 먼저 고쳐야 하는지, 왜 위험한지, 어떤 표현으로 낮추면 좋은지까지 이어집니다.
              </p>
              <div className="audit-grid">
                {auditItems.map(([title, body]) => (
                  <article key={title} className="audit-item">
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="landing-final" aria-labelledby="final-title" style={{ position: "relative" }}>
          <Image
            src={wordmarkDark}
            alt=""
            fill
            className="final-bg"
            sizes="100vw"
          />
          <div className="final-cover" aria-hidden="true" />
          <div className="shell final-inner">
            <p className="section-kicker section-kicker-light">Pre-release Audit</p>
            <h2 id="final-title" className="section-title">
              OpenCrab에 올리기 전,<br />
              팩이 신뢰를 견딜 수 있는지 확인하세요.
            </h2>
            <p className="section-lead final-lead">
              LocalCrab이 만든 후보 팩을 넣으면 Megalopa가 근거, 관계, 출처, 편향을 검수하고 수정 우선순위를 제안합니다.
            </p>
            <div className="landing-actions">
              <Link href="/upload" className="landing-primary-action">팩 분석 시작</Link>
              <Link href="/reports/sample" className="landing-secondary-action">샘플 리포트 보기</Link>
            </div>
          </div>
        </section>
      </div>
    </AppFrame>
  );
}
