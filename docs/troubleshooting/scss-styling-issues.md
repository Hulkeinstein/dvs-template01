---
title: "SCSS 스타일링 트러블슈팅"
tags:
  - type/troubleshooting
  - component/scss
created: 2025-12-25
updated: 2025-12-25
status: active
---

# SCSS 스타일링 트러블슈팅

HiStudy 템플릿 기반 프로젝트에서 발생하는 SCSS 스타일 문제와 해결 방법.

---

## 모달에서 글씨가 작아지는 문제

### 증상

- 일반 페이지에서는 글씨 크기가 정상
- 모달 안에서 갑자기 글씨가 작아짐
- `font-size: 1.8rem`이 18px가 아닌 더 작게 렌더링됨

### 원인

HiStudy 템플릿의 `html { font-size: 62.5% }` 설정 때문:

```scss
// HiStudy 기본 설정
html {
  font-size: 62.5%;  // 1rem = 10px (브라우저 기본 16px × 0.625)
}
```

**모달 내부에서 다른 CSS가 `font-size`를 재정의**하면 `rem` 계산 기준이 바뀜:

```scss
// 문제가 되는 코드 예시
.modal-body {
  font-size: 14px;  // 여기서 rem 기준이 변경될 수 있음
}
```

### 해결

**방법 1**: 모달 내부에서 명시적으로 `rem` 값 사용

```scss
.modal .my-component {
  font-size: 1.8rem;  // HiStudy 기준: 18px
}
```

**방법 2**: `px` 단위로 고정 (권장하지 않음)

```scss
.modal .my-component {
  font-size: 18px;  // rem 계산 문제 회피
}
```

**방법 3**: 부모 요소의 `font-size` 리셋

```scss
.modal-body {
  font-size: 62.5%;  // rem 기준 복원
}
```

---

## gap vs margin 정렬 문제

### 증상

- Flexbox에서 `gap` 사용 시 좌우 균형이 안 맞음
- 왼쪽이 오른쪽보다 넓어 보임

### 원인

```scss
// 문제 코드
.timestamp-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;  // 아이콘과 텍스트 사이에 gap 추가
  padding: 0.5rem 1.2rem;
}
```

**구조**:
```
[패딩] [아이콘] [gap] [텍스트] [패딩]
```

- 왼쪽: 패딩 + 아이콘 + gap의 절반
- 오른쪽: 패딩만
- **결과**: 시각적으로 왼쪽이 더 넓어 보임

### 해결

`gap` 제거하고 필요하면 아이콘에 `margin-right` 사용:

```scss
// 해결 코드
.timestamp-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  // gap 삭제
  padding: 0.5rem 1.2rem;

  i {
    font-size: 1.4rem;
    line-height: 1;
    // margin-right: 0.4rem;  // 필요 시에만 추가
  }
}
```

**결과**: 아이콘과 텍스트가 붙어서 좌우 대칭 유지

---

## SCSS 파일 위치 규칙 위반

### 증상

- 컴포넌트 폴더에 SCSS 파일 생성
- 스타일이 적용 안 됨 또는 빌드 경고

### 원인

프로젝트 원칙 위반:

```
❌ 잘못된 위치
components/Lesson/SummaryDisplay.scss

✅ 올바른 위치
public/scss/elements/_summary-display.scss
```

### 해결

1. SCSS 파일을 `public/scss/elements/`로 이동
2. `styles.scss`에 import 추가
3. 컴포넌트에서 직접 import 제거

```bash
# 1. 파일 이동
mv components/Lesson/SummaryDisplay.scss public/scss/elements/_summary-display.scss

# 2. styles.scss에 import 추가
@import 'elements/summary-display';

# 3. 컴포넌트에서 import 제거
// 삭제: import './SummaryDisplay.scss';
```

---

## 다크모드 스타일 미적용

### 증상

- 라이트모드에서는 정상
- 다크모드에서 색상이 안 바뀜

### 원인

다크모드 선택자 순서 또는 네스팅 문제:

```scss
// 잘못된 네스팅 (적용 안 됨)
.my-component {
  color: #333;

  [data-theme="dark"] & {
    color: #e0e0e0;  // 선택자: [data-theme="dark"] .my-component
  }
}
```

### 해결

다크모드 선택자를 올바르게 배치:

```scss
// 올바른 방법 1: 부모 선택자 사용
.my-component {
  color: #333;
}

[data-theme="dark"] .my-component,
.active-dark-mode .my-component {
  color: #e0e0e0;
}

// 올바른 방법 2: 네스팅 내부에서
.my-component {
  color: #333;

  [data-theme="dark"] &,
  .active-dark-mode & {
    color: #e0e0e0;
  }
}
```

---

## rem 단위 빠른 참조

HiStudy 템플릿 기준 (`html { font-size: 62.5% }`):

| rem | px |
|-----|-----|
| 1rem | 10px |
| 1.4rem | 14px |
| 1.6rem | 16px |
| 1.8rem | 18px |
| 2rem | 20px |
| 2.4rem | 24px |

---

## 관련 문서

- [HiStudy SCSS 가이드](../guides/histudy-scss-guide.md)
- [Lilys Summary Library](../library/lilys-summary.md)
- [아키텍처 - 스타일링](../../modules/architecture.md#스타일링)
