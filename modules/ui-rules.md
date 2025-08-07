# UI Development Rules

## Core Principles
- **템플릿 UI를 반드시 유지하고 사용하세요** - 기존 UI 컴포넌트와 스타일을 그대로 활용
- **모든 기능을 완전히 구현하세요** - UI에 있는 모든 버튼, 입력 필드, 기능을 작동하도록 구현
- **절대 UI 요소를 삭제하지 마세요** - 사용자의 명시적 지시 없이는 어떤 UI 요소도 제거 금지
- **기존 템플릿의 디자인 패턴을 따르세요** - 새로운 기능 추가 시에도 템플릿의 스타일 가이드 준수
- **하드코딩된 데이터는 동적으로 변경하되, UI 구조는 유지하세요**

## Language Preference
- 사용자는 한국인이므로 모든 대화는 한국어로 진행하세요
- 기술 용어나 코드 관련 용어는 영어를 그대로 사용해도 됩니다
- 설명과 응답은 한국어로 작성하세요

## Important Notes
- The development server is already running on port 3000. DO NOT start a new dev server.
- If you need to restart the server, ask the user first.
- When committing, always run lint and typecheck commands first if available.