---
title: "HiStudy SCSS 가이드"
tags:
  - type/guide
  - component/scss
created: 2025-12-25
updated: 2025-12-25
status: active
---

# HiStudy SCSS 가이드

HiStudy 템플릿 기반 프로젝트의 SCSS 작성 규칙과 참고사항.

---

## 핵심 규칙

### 1. Font Size 기준

```scss
// HiStudy 전역 설정
html {
  font-size: 62.5%;  // 1rem = 10px
}
```

**rem 변환표**:

| rem | px | 용도 |
|-----|-----|------|
| 1.2rem | 12px | 작은 텍스트, 캡션 |
| 1.4rem | 14px | 버튼, 타임스탬프 |
| 1.6rem | 16px | 기본 본문 |
| 1.8rem | 18px | 본문, 서브 제목 |
| 2rem | 20px | 섹션 제목 |
| 2.4rem | 24px | 큰 제목 |

### 2. SCSS 파일 위치

```
public/scss/
├── elements/           # 컴포넌트 스타일
│   └── _summary-display.scss
├── template/           # 페이지 템플릿
├── default/            # 변수, 믹스인
└── styles.scss         # 메인 진입점
```

**절대 금지**:
- `components/` 폴더에 SCSS 파일 생성
- `/public/css/` 직접 수정 (auto-generated)

### 3. Import 규칙

```scss
// styles.scss에 추가
@import 'elements/my-component';  // _ 접두사와 .scss 생략
```

컴포넌트에서 직접 import 금지:
```tsx
// ❌ 잘못된 방법
import './MyComponent.scss';

// ✅ 올바른 방법
// styles.scss에서 import, 컴포넌트에서는 클래스만 사용
```

---

## 네이밍 규칙

### BEM Lite

```scss
.block {}
.block__element {}
.block--modifier {}

// 예시
.summary-display {}
.summary-display__title {}
.summary-display--lilys {}
```

### 파일 네이밍

```
_component-name.scss   // 언더스코어 접두사 필수
```

---

## 다크모드

### 선택자

```scss
// 두 가지 모두 지원
[data-theme="dark"] .my-component {}
.active-dark-mode .my-component {}
```

### 패턴

```scss
.my-component {
  color: #333;
  background: #fff;

  // 다크모드 오버라이드
  [data-theme="dark"] &,
  .active-dark-mode & {
    color: #e0e0e0;
    background: #2d2d2d;
  }
}
```

### 다크모드 색상 가이드

| 용도 | 라이트 | 다크 |
|------|--------|------|
| 배경 | #fff | #2d2d2d |
| 텍스트 | #333 | #e0e0e0 |
| 보조 텍스트 | #6c757d | #bdbdbd |
| 테두리 | #e9ecef | #444 |
| 강조 (핑크) | #d63384 | #ff80ab |
| 링크 | #0d6efd | #90caf9 |

---

## Flexbox 정렬 주의사항

### gap 사용 시 좌우 비대칭

```scss
// ⚠️ 주의: gap이 좌우 균형을 깨뜨릴 수 있음
.badge {
  display: inline-flex;
  gap: 0.5rem;  // 아이콘-텍스트 사이 공간
  padding: 0.5rem 1rem;
}

// 결과: [패딩][아이콘][gap][텍스트][패딩]
// 왼쪽이 더 넓어 보임
```

### 해결책

```scss
// gap 대신 margin 사용
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;

  i {
    margin-right: 0.4rem;  // 필요시에만
  }
}
```

---

## 모달 내 스타일

### 문제

모달 내부에서 `rem` 기준이 달라질 수 있음:

```scss
// Bootstrap 모달이 font-size를 재정의할 수 있음
.modal-body {
  font-size: 14px;  // rem 계산에 영향
}
```

### 해결

명시적으로 `rem` 사용하거나 부모 스타일 확인:

```scss
.modal .my-component {
  font-size: 1.8rem;  // 18px (HiStudy 기준)
}
```

---

## 반응형 브레이크포인트

HiStudy 기본 브레이크포인트:

```scss
// Bootstrap 5 기준
$breakpoints: (
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

// 사용 예
@media (max-width: 768px) {
  .my-component {
    font-size: 1.6rem;
  }
}
```

---

## 자주 쓰는 패턴

### 호버 줌 효과

```scss
.img-zoom {
  overflow: hidden;

  img {
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }
}
```

### 카드 호버

```scss
.card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```

### 그라데이션 뱃지

```scss
.badge {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 0.8rem;
}
```

---

## 체크리스트

새 컴포넌트 스타일 작성 시:

- [ ] `public/scss/elements/` 또는 `template/`에 파일 생성
- [ ] 파일명: `_component-name.scss`
- [ ] `styles.scss`에 import 추가
- [ ] BEM 네이밍 사용
- [ ] 다크모드 스타일 추가
- [ ] rem 단위 사용 (HiStudy 기준)
- [ ] 컴포넌트에서 직접 import 하지 않음

---

## 관련 문서

- [SCSS 트러블슈팅](../troubleshooting/scss-styling-issues.md)
- [아키텍처 - 스타일링](../../modules/architecture.md#스타일링)
- [SCSS 원칙 (글로벌)](~/.claude/modules/scss-styling.md)
