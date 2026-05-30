export type GuideBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "list"; items: string[] }
  | { type: "note"; title: string; body: string }
  | { type: "example"; title: string; items: string[] }
  | { type: "cards"; items: Array<{ title: string; body: string; href?: string }> };

export type GuidePage = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  progressLabel: string;
  markdown: string;
  blocks: GuideBlock[];
};

export const guideGroups = [
  {
    title: "처음 시작",
    pages: [
      { slug: "quick-start", title: "5분 시작" },
      { slug: "why-megalopa", title: "왜 만들었나요" },
      { slug: "basic-terms", title: "기본 용어" },
    ],
  },
  {
    title: "핵심 기능",
    pages: [
      { slug: "how-it-works", title: "작동 방식" },
      { slug: "technology", title: "기술과 검수 기준" },
      { slug: "read-report", title: "리포트 읽는 법" },
      { slug: "repair-pack", title: "팩 고치는 법" },
    ],
  },
  {
    title: "도움말",
    pages: [
      { slug: "faq", title: "자주 묻는 질문" },
      { slug: "troubleshooting", title: "문제 해결" },
    ],
  },
] as const;

const quickStartMarkdown = `# 5분 시작

Megalopa를 처음 열고 OpenCrab 팩을 분석 결과까지 확인하는 가장 짧은 사용 흐름입니다.

처음 쓰는 분은 아래 순서만 따라오면 됩니다. 목표는 모든 기능을 외우는 것이 아니라 "이 팩을 그대로 믿어도 되는지"를 빠르게 확인하는 것입니다.

## 1단계 - 샘플 리포트 먼저 보기

1. Megalopa에서 가이드를 엽니다.
2. 샘플 리포트 보기를 누릅니다.
3. 신뢰도 점수, 사용 위험도, 먼저 고칠 문제 위치를 확인합니다.

## 2단계 - JSON 팩 넣기

OpenCrab 스타일 JSON을 붙여넣거나 1MB 이하 JSON 파일을 선택합니다.

## 3단계 - 분석 시작

분석 시작을 누르면 Megalopa가 노드, 관계, 근거, 출처, 관계 타입, 명명 위험을 검사합니다.

## 4단계 - 결과 읽기

점수보다 먼저 사용 위험도와 먼저 고칠 문제를 봅니다. 특히 근거 없는 관계와 강한 인과 관계는 먼저 수정해야 합니다.

## 5단계 - 수정 후 다시 분석

리포트의 수정 체크리스트를 따라 근거, 출처, 관계 표현, 편향적 이름을 고친 뒤 다시 분석합니다.`;

export const guidePages: Record<string, GuidePage> = {
  "quick-start": {
    slug: "quick-start",
    category: "처음 시작",
    title: "5분 시작",
    summary: "Megalopa를 처음 열고 샘플 분석부터 리포트 해석까지 가는 가장 짧은 흐름입니다.",
    progressLabel: "1단계 - 샘플 리포트 먼저 보기",
    markdown: quickStartMarkdown,
    blocks: [
      {
        type: "paragraph",
        text: "처음 쓰는 분은 아래 흐름만 따라오면 됩니다. 목표는 모든 기능을 보는 것이 아니라 이 팩을 그대로 믿어도 되는지 빠르게 확인하는 것입니다.",
      },
      { type: "heading", text: "1단계 - 샘플 리포트 먼저 보기" },
      {
        type: "steps",
        items: [
          "상단 또는 사이드바에서 샘플 리포트를 엽니다.",
          "신뢰도 점수, 사용 위험도, 먼저 고칠 문제가 어디에 있는지 확인합니다.",
          "Megalopa가 점수를 매기지만, 점수는 진리 판정이 아니라 사용 위험도 안내라는 점을 기억합니다.",
        ],
      },
      {
        type: "note",
        title: "처음에는 샘플부터 보세요",
        body: "샘플 리포트에는 일부러 근거 없는 관계와 강한 인과 관계가 들어 있습니다. 실제 팩을 넣기 전에 결과 화면을 먼저 익히기 좋습니다.",
      },
      { type: "heading", text: "2단계 - JSON 팩 넣기" },
      {
        type: "paragraph",
        text: "현재 버전은 OpenCrab 스타일 JSON 입력을 기준으로 합니다. 붙여넣기 또는 1MB 이하 JSON 파일 업로드를 사용할 수 있습니다.",
      },
      {
        type: "example",
        title: "처음 넣어볼 수 있는 최소 구조",
        items: [
          `"nodes": 지식 항목 목록`,
          `"edges": 항목 사이의 관계`,
          `"evidence": 근거와 출처 목록`,
          `"evidence_ids": 노드나 관계가 어떤 근거를 참조하는지`,
        ],
      },
      { type: "heading", text: "3단계 - 분석 시작" },
      {
        type: "steps",
        items: [
          "팩 분석 시작을 누릅니다.",
          "Megalopa가 구조 오류, 근거 누락, 과도한 관계 표현, 약한 출처, 편향적 명명을 찾습니다.",
          "결과는 현재 브라우저 탭에 임시 저장되고 리포트 화면으로 이동합니다.",
        ],
      },
      { type: "heading", text: "4단계 - 결과 읽기" },
      {
        type: "list",
        items: [
          "사용 위험도: 이 팩을 어디까지 써도 되는지 보는 첫 신호입니다.",
          "먼저 고칠 문제: 공개 배포나 에이전트 자동 판단 전에 먼저 고쳐야 할 항목입니다.",
          "확인 필요한 관계: 관계 이름이 표준 어휘에 맞지 않거나 근거가 부족한 관계입니다.",
          "너무 단정적인 관계: causes, proves처럼 너무 강하게 단정하는 관계입니다.",
          "편향 표현: 낙인, 혐오, 과잉 일반화로 읽힐 수 있는 이름입니다.",
        ],
      },
      { type: "heading", text: "5단계 - 수정 후 다시 분석" },
      {
        type: "paragraph",
        text: "리포트의 수정 체크리스트를 따라 근거, 출처, 관계 표현, 편향적 이름을 고친 뒤 다시 분석합니다. 점수가 올라가는 것보다 중요한 것은 위험한 관계가 줄어드는 것입니다.",
      },
      {
        type: "cards",
        items: [
          { title: "작동 방식 이해하기", body: "Megalopa가 팩을 어떤 순서로 검사하는지 봅니다.", href: "/docs/how-it-works" },
          { title: "기술과 검수 기준", body: "점수가 어떤 기술 흐름과 규칙에서 나오는지 확인합니다.", href: "/docs/technology" },
          { title: "리포트 읽는 법", body: "점수, 위험도, 이슈 그룹을 해석하는 기준입니다.", href: "/docs/read-report" },
        ],
      },
    ],
  },
  "why-megalopa": {
    slug: "why-megalopa",
    category: "처음 시작",
    title: "왜 만들었나요",
    summary: "OpenCrab 팩을 사람이 읽거나 에이전트가 쓰기 전에 신뢰 가능한 범위를 확인하기 위해 만들었습니다.",
    progressLabel: "제품 목적 이해",
    markdown: `# 왜 만들었나요

Megalopa는 OpenCrab 팩을 그대로 믿어도 되는지 판정하는 진리 판정기가 아닙니다. 대신 그 팩을 어디까지 믿고 써도 되는지 알려주는 검수 레이어입니다.`,
    blocks: [
      {
        type: "paragraph",
        text: "OpenCrab 팩은 지식을 노드와 관계로 묶습니다. 이 구조는 에이전트가 추론하기 좋지만, 관계가 너무 강하거나 근거가 약하면 잘못된 결론을 빠르게 확산시킬 수 있습니다.",
      },
      {
        type: "note",
        title: "Megalopa의 기준",
        body: "이 팩은 맞다/틀리다가 아니라, 탐색용인지, 콘텐츠 생성용인지, 공개 배포 가능한지, 자동 판단에는 위험한지를 구분합니다.",
      },
      {
        type: "list",
        items: [
          "근거 없는 관계를 찾습니다.",
          "출처가 약하거나 알 수 없는 근거를 표시합니다.",
          "causes, proves 같은 강한 관계 표현을 완화하도록 제안합니다.",
          "편향적이거나 낙인처럼 보일 수 있는 이름을 알려줍니다.",
        ],
      },
    ],
  },
  "basic-terms": {
    slug: "basic-terms",
    category: "처음 시작",
    title: "기본 용어",
    summary: "노드, 관계, 근거, 출처, 위험도처럼 리포트에서 반복되는 말을 쉽게 정리합니다.",
    progressLabel: "용어 먼저 익히기",
    markdown: `# 기본 용어

노드는 지식 항목, 관계는 항목 사이의 연결, 근거는 그 관계를 뒷받침하는 자료입니다.`,
    blocks: [
      { type: "heading", text: "노드" },
      { type: "paragraph", text: "팩 안에 들어있는 지식 항목입니다. 사람, 개념, 행동, 상태, 도구 등이 노드가 될 수 있습니다." },
      { type: "heading", text: "관계" },
      { type: "paragraph", text: "노드와 노드 사이의 관계입니다. Megalopa는 노드보다 관계를 더 엄격하게 봅니다. 잘못된 관계가 에이전트 추론에 더 큰 영향을 주기 때문입니다." },
      { type: "heading", text: "근거" },
      { type: "paragraph", text: "노드나 관계를 뒷받침하는 근거입니다. 논문, 공식 문서, 책, 기사처럼 출처가 분명할수록 좋습니다." },
      { type: "heading", text: "사용 위험도" },
      { type: "paragraph", text: "이 팩을 어디까지 써도 되는지 알려주는 신호입니다. low, medium, high, critical 순서로 위험도가 커집니다." },
    ],
  },
  "how-it-works": {
    slug: "how-it-works",
    category: "핵심 기능",
    title: "작동 방식",
    summary: "Megalopa가 입력된 팩을 분석하고 리포트를 만드는 내부 흐름을 설명합니다.",
    progressLabel: "팩 파싱과 검수",
    markdown: `# 작동 방식

Megalopa는 입력된 JSON 팩을 파싱한 뒤 구조, 근거, 관계, 편향, 점수 계산 순서로 검사합니다.`,
    blocks: [
      {
        type: "steps",
        items: [
          "팩 메타데이터, 노드, 관계, 근거 목록을 읽습니다.",
          "필수 필드와 중복 노드, 없는 노드를 참조하는 관계를 검사합니다.",
          "노드와 관계가 근거를 갖고 있는지 확인합니다.",
          "표준 관계 어휘에 없는 관계와 너무 강한 관계를 찾습니다.",
          "편향적이거나 낙인처럼 보일 수 있는 이름을 탐지합니다.",
          "신뢰도 점수와 사용 위험도를 계산하고 Markdown 리포트를 만듭니다.",
        ],
      },
      {
        type: "note",
        title: "현재 버전의 범위",
        body: "현재는 규칙 기반 분석이 중심입니다. LLM 기반 claim splitter나 relation risk analyzer는 다음 단계에서 붙이기 좋은 영역입니다.",
      },
      {
        type: "cards",
        items: [
          { title: "기술과 검수 기준", body: "분석이 어떤 기술 스택과 규칙으로 돌아가는지 자세히 봅니다.", href: "/docs/technology" },
          { title: "리포트 읽는 법", body: "점수보다 먼저 봐야 할 위험 신호를 확인합니다.", href: "/docs/read-report" },
        ],
      },
    ],
  },
  technology: {
    slug: "technology",
    category: "핵심 기능",
    title: "기술과 검수 기준",
    summary: "Megalopa가 어떤 기술 구성으로 팩을 읽고, 어떤 규칙으로 검수하는지 설명합니다.",
    progressLabel: "검수 신뢰 기준",
    markdown: `# 기술과 검수 기준

Megalopa의 점수는 블랙박스 AI가 감으로 매기는 숫자가 아닙니다. 현재 버전은 입력된 JSON 팩을 규칙 기반 분석기로 검사하고, 근거와 관계의 위험도를 사람이 확인할 수 있는 리포트로 바꿉니다.`,
    blocks: [
      {
        type: "paragraph",
        text: "Megalopa는 OpenCrab에 올리기 전 후보 팩을 점검하는 사전 검수 레이어입니다. 그래서 목표는 팩의 모든 내용이 참인지 판정하는 것이 아니라, 이 팩을 어디까지 믿고 써도 되는지 판단할 단서를 주는 것입니다.",
      },
      { type: "heading", text: "현재 기술 스택" },
      {
        type: "list",
        items: [
          "Next.js App Router: 랜딩, 업로드, 가이드, 대시보드, 리포트 화면을 구성합니다.",
          "TypeScript API Route: 업로드된 JSON을 분석기로 넘기고 결과를 화면에서 읽을 수 있는 형태로 돌려줍니다.",
          "Python Analyzer: 팩 파싱, 스키마 검증, 관계 규칙, 근거 연결, 출처 품질, 편향 명명을 검사합니다.",
          "JSON Schema: 팩, 이슈, 리포트가 어떤 구조를 가져야 하는지 계약을 정의합니다.",
          "Pytest: 샘플 팩이 같은 규칙으로 안정적으로 분석되는지 확인합니다.",
          "Session Storage: 분석 결과를 현재 브라우저 탭에 임시 저장해 리포트 화면으로 이어줍니다.",
        ],
      },
      { type: "heading", text: "검수는 어떤 순서로 되나요?" },
      {
        type: "steps",
        items: [
          "입력된 JSON을 읽고 노드, 관계, 근거 목록을 분리합니다.",
          "필수 필드, 중복 노드, 존재하지 않는 노드를 가리키는 관계를 검사합니다.",
          "노드와 관계가 evidence_ids로 근거를 연결하고 있는지 확인합니다.",
          "causes, proves, always_leads_to처럼 너무 강한 관계 표현을 경고합니다.",
          "unknown, llm_generated처럼 추적하기 어려운 출처를 약한 출처로 표시합니다.",
          "낙인이나 과잉 일반화로 읽힐 수 있는 이름을 찾아 중립적인 표현으로 바꾸도록 제안합니다.",
          "위 결과를 점수, 위험도, 수정 우선순위, Markdown 리포트로 정리합니다.",
        ],
      },
      { type: "heading", text: "점수는 무엇을 보나요?" },
      {
        type: "list",
        items: [
          "근거 연결률: 노드와 관계가 근거를 갖고 있는지 봅니다.",
          "관계 표현 안정성: 표준 관계인지, 너무 단정적인 관계인지 봅니다.",
          "구조 일관성: 필수 필드, 중복, 잘못된 참조가 있는지 봅니다.",
          "출처 신뢰도: 공식 문서, 논문, 책, 기사처럼 추적 가능한 출처인지 봅니다.",
          "현재 일부 항목은 기본값으로 계산됩니다. 그래서 점수만 보지 말고 위험도와 먼저 고칠 문제를 함께 봐야 합니다.",
        ],
      },
      { type: "heading", text: "왜 신뢰할 수 있나요?" },
      {
        type: "list",
        items: [
          "같은 입력에는 같은 결과가 나오는 결정적 규칙을 우선 사용합니다.",
          "각 경고는 어떤 노드나 관계가 문제인지 대상과 이유를 함께 보여줍니다.",
          "진실 여부를 단정하지 않고, 사용 위험도와 수정 필요성을 분리해서 보여줍니다.",
          "LLM 추론은 현재 기본 판정 경로가 아닙니다. 추후 붙이더라도 근거 추출과 관계 위험 보조 역할로 두는 편이 안전합니다.",
        ],
      },
      {
        type: "note",
        title: "사용자가 알아야 할 한계",
        body: "Megalopa는 도메인 전문가를 대체하지 않습니다. 법률, 의료, 금융처럼 영향이 큰 팩은 점수가 높아도 사람이 근거와 표현을 다시 확인해야 합니다.",
      },
      {
        type: "cards",
        items: [
          { title: "작동 방식", body: "팩이 리포트로 바뀌는 전체 흐름을 봅니다.", href: "/docs/how-it-works" },
          { title: "리포트 읽는 법", body: "점수, 위험도, 수정 우선순위를 해석합니다.", href: "/docs/read-report" },
        ],
      },
    ],
  },
  "read-report": {
    slug: "read-report",
    category: "핵심 기능",
    title: "리포트 읽는 법",
    summary: "점수보다 위험도와 이슈 그룹을 먼저 보는 방식으로 리포트를 읽습니다.",
    progressLabel: "결과 해석",
    markdown: `# 리포트 읽는 법

Megalopa 리포트는 점수보다 먼저 위험도와 고쳐야 할 항목을 보도록 설계되어야 합니다.`,
    blocks: [
      {
        type: "list",
        items: [
          "신뢰도 점수: 0-100점 신뢰도입니다. 단독 결론이 아니라 참고 지표입니다.",
          "사용 위험도: 실제 사용 가능 범위를 판단하는 핵심 신호입니다.",
          "먼저 고칠 문제: 자동 판단이나 공개 배포 전에 먼저 고쳐야 합니다.",
          "수정 우선순위: 사용자가 바로 고칠 수 있는 작업 목록입니다.",
        ],
      },
      {
        type: "example",
        title: "추천 읽기 순서",
        items: [
          "1. 사용 위험도 확인",
          "2. 먼저 고칠 문제 확인",
          "3. 너무 단정적인 관계 확인",
          "4. 편향 표현 확인",
          "5. Markdown 리포트를 저장하거나 공유",
        ],
      },
    ],
  },
  "repair-pack": {
    slug: "repair-pack",
    category: "핵심 기능",
    title: "팩 고치는 법",
    summary: "리포트에서 나온 문제를 OpenCrab 팩에 다시 반영하는 실전 수정 순서입니다.",
    progressLabel: "수정 후 재검수",
    markdown: `# 팩 고치는 법

근거 없는 관계, 강한 인과 관계, 약한 출처, 편향적 이름을 먼저 고치면 팩의 실사용 안정성이 좋아집니다.`,
    blocks: [
      {
        type: "steps",
        items: [
          "근거 없는 관계에 evidence_ids를 연결하거나 관계를 제거합니다.",
          "causes, proves 같은 표현은 can_contribute_to, supports처럼 완화합니다.",
          "unknown 또는 llm_generated 출처를 공식 문서, 논문, 책, 기사로 보강합니다.",
          "낙인처럼 읽힐 수 있는 노드 이름을 행동이나 구조 중심의 중립적 이름으로 바꿉니다.",
          "수정한 팩을 다시 분석해 high/critical 위험이 줄었는지 확인합니다.",
        ],
      },
    ],
  },
  faq: {
    slug: "faq",
    category: "도움말",
    title: "자주 묻는 질문",
    summary: "Megalopa를 처음 쓸 때 자주 헷갈리는 부분을 정리합니다.",
    progressLabel: "FAQ",
    markdown: `# 자주 묻는 질문`,
    blocks: [
      { type: "heading", text: "Megalopa가 팩의 진실 여부를 판단하나요?" },
      { type: "paragraph", text: "아니요. Megalopa는 진리 판정기가 아닙니다. 근거와 관계 표현을 보고 사용 위험도를 안내합니다." },
      { type: "heading", text: "점수가 높으면 자동 판단에 써도 되나요?" },
      { type: "paragraph", text: "점수가 높아도 도메인 전문가 검토가 필요할 수 있습니다. 자동 판단용 여부는 사용 위험도와 먼저 고칠 문제를 함께 봐야 합니다." },
      { type: "heading", text: "YAML도 되나요?" },
      { type: "paragraph", text: "현재 버전 화면은 JSON만 받습니다. YAML 입력은 다음 단계에서 추가할 수 있습니다." },
    ],
  },
  troubleshooting: {
    slug: "troubleshooting",
    category: "도움말",
    title: "문제 해결",
    summary: "분석이 실패하거나 결과가 이상할 때 먼저 확인할 항목입니다.",
    progressLabel: "문제 해결",
    markdown: `# 문제 해결`,
    blocks: [
      {
        type: "list",
        items: [
          "분석 실패: JSON 문법이 깨졌는지 확인합니다.",
          "파일 업로드 실패: 현재는 1MB 이하 JSON 파일만 지원합니다.",
          "리포트 링크가 비어 있음: 결과는 현재 탭 sessionStorage에 임시 저장됩니다.",
          "점수가 예상보다 낮음: 근거 없는 관계나 unknown 출처가 있는지 먼저 확인합니다.",
        ],
      },
    ],
  },
};

export function getGuidePage(slug?: string) {
  return guidePages[slug || "quick-start"];
}
