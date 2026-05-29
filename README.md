# Megalopa

Megalopa is an ontology QA layer for auditing OpenCrab packs before humans or agents trust them.

Megalopa는 인간이나 에이전트가 OpenCrab 팩을 신뢰하기 전에, 해당 팩의 근거·관계·출처·편향·추론 안전성을 검수하는 온톨로지 QA 레이어입니다.

## MVP 0.1

- Next.js, TypeScript, Tailwind 기반 SaaS형 UI
- Home, Upload, Analysis Dashboard, Report 화면
- Python analyzer 패키지
- JSON/YAML pack parser
- schema, evidence, relation, bias naming validation
- reliability score, grade, risk level 계산
- Markdown audit report 생성

## Run

```bash
npm install
npm run analyze:sample
npm run dev
```

## Test

```bash
npm run test:py
```

## Design constraints

- UI에는 emoji를 사용하지 않고 SVG 아이콘만 사용합니다.
- Pretendard 기반 타이포그래피를 사용합니다.
- 화면 텍스트는 12px 이하로 유지합니다.
- 자간과 행간은 전역 토큰으로 일정하게 유지합니다.
