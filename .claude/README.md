# Claude Code Safety System

AI 어시스턴트(Claude Code)가 실수로 대량 삭제나 파괴적인 변경을 하는 것을 방지하는 안전 시스템입니다.

## 🎯 목적

Claude Code와 같은 AI 코드 어시스턴트가:
- 실수로 중요 파일 삭제하는 것 방지
- `rm -rf /` 같은 위험한 명령 차단
- Git 히스토리 파괴 방지
- 데이터베이스 대량 삭제 방지
- 자동 백업으로 복구 가능하도록

## 🚀 설치

```bash
# 설치 스크립트 실행
node .claude/install.js

# 또는 수동 설치
npm run claude:verify
```

## 📁 구조

```
.claude/
├── settings.json          # 메인 설정 파일
├── hooks/                 # 작업 전 검증 훅
│   ├── pre-exec.js       # Bash 명령 검증
│   ├── file-safety.js    # 파일 작업 보호
│   ├── git-safety.js     # Git 명령 보호
│   └── db-safety.js      # DB 쿼리 필터링
├── backup/               # 자동 백업 시스템
│   ├── auto-backup.js    # 백업 관리자
│   └── snapshots/        # 백업 파일 저장
├── emergency/            # 긴급 제어
│   └── stop.js          # 긴급 정지 스크립트
└── logs/                # 작업 로그

```

## 🛡️ 주요 기능

### 1. 명령어 차단 (pre-exec.js)
- `rm -rf /`, `rm -rf /*` 같은 위험 명령 차단
- 포맷 명령 차단 (format, mkfs, fdisk)
- 삭제 속도 제한 (분당 10개 파일)

### 2. 파일 보호 (file-safety.js)
- `.git/`, `node_modules/`, `.env` 파일 보호
- 민감 정보 감지 (API 키, 비밀번호)
- 삭제 전 자동 백업

### 3. Git 안전 (git-safety.js)
- `--force` push 차단
- main/master 브랜치 직접 push 차단
- 위험한 reset 전 자동 stash

### 4. DB 보호 (db-safety.js)
- DROP DATABASE 차단
- WHERE 절 없는 DELETE/UPDATE 경고
- 중요 테이블 보호

### 5. 자동 백업 (auto-backup.js)
- 파일 수정/삭제 전 자동 백업
- 최대 50개 스냅샷 유지
- 7일 후 자동 정리

### 6. 긴급 정지 (emergency/stop.js)
- 모든 작업 즉시 중단
- 현재 상태 스냅샷
- 안전 모드 활성화

## 📖 사용법

### 긴급 정지
문제가 발생했을 때 즉시 모든 작업 중단:

```bash
npm run claude:emergency-stop
```

### 정상 재개
안전 확인 후 정상 작동 재개:

```bash
npm run claude:resume
```

### 백업 관리
```bash
# 백업 목록 조회
npm run claude:backup-list

# 백업에서 복원 (수동)
cp .claude/backup/snapshots/[백업파일명] [원본경로]
```

### 시스템 검증
```bash
npm run claude:verify
```

## ⚙️ 설정 커스터마이징

`settings.json` 파일 수정:

```json
{
  "safety": {
    "maxFilesPerOperation": 5,      // 한 번에 처리할 최대 파일 수
    "maxDeletePerMinute": 10,       // 분당 최대 삭제 수
    "requireConfirmation": [         // 확인 필요 명령
      "rm -rf",
      "git reset --hard"
    ],
    "protectedPaths": [              // 보호된 경로
      ".git/**",
      ".env*",
      "node_modules/**"
    ]
  }
}
```

## 🚨 트러블슈팅

### 정상 작업이 차단될 때
1. `settings.json`에서 제한 완화
2. 특정 경로를 보호 목록에서 제외
3. 필요시 훅 임시 비활성화

### 백업 공간 부족
1. 오래된 백업 수동 삭제
2. `retentionDays` 값 줄이기
3. `maxSnapshots` 값 줄이기

### 긴급 정지 후 복구
1. `npm run claude:resume` 실행
2. Git stash 확인 및 복원
3. 백업에서 필요한 파일 복원

## 📊 로그 확인

작업 로그는 `.claude/logs/` 디렉토리에 저장됩니다:
- `operations.log` - 모든 파일 작업
- `blocked.log` - 차단된 작업
- `emergency.log` - 긴급 정지 기록

## 🔧 제거

시스템 완전 제거:

```bash
npm run claude:uninstall
```

⚠️ **주의**: 모든 백업과 로그가 삭제됩니다.

## 📝 라이선스

MIT

## 🤝 기여

문제나 개선 사항이 있으면 GitHub Issues로 알려주세요.

---

**Version**: 1.0.0
**Last Updated**: 2025-02-14
**Author**: DVS Development Team