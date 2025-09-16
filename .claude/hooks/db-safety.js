#!/usr/bin/env node
const toolInput = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
const query = (toolInput.query || '').toLowerCase();

class DatabaseSafetyValidator {
  constructor() {
    // 위험한 작업 패턴
    this.dangerousPatterns = [
      /drop\s+(table|database|schema|index)/i,
      /truncate\s+table/i,
      /delete\s+from\s+\w+\s*$/i, // WHERE 절 없는 DELETE
      /update\s+\w+\s+set.*(?!where)/i, // WHERE 절 없는 UPDATE
      /alter\s+table.*drop\s+column/i,
      /drop\s+constraint/i,
    ];

    // 완전 차단 패턴
    this.blockedPatterns = [
      /drop\s+database/i,
      /drop\s+schema\s+(public|auth|storage)/i,
      /truncate\s+table\s+(user|courses|enrollments)/i,
      /delete\s+from\s+(user|courses|enrollments)\s*$/i,
    ];

    // 보호된 테이블
    this.protectedTables = [
      'user',
      'courses',
      'enrollments',
      'orders',
      'lesson_progress',
      'quiz_attempts',
    ];

    // 백업 필요 작업
    this.backupRequired = [/alter\s+table/i, /update.*set/i, /delete\s+from/i];
  }

  validate(query) {
    // 1. 완전 차단 패턴 체크
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(query)) {
        this.block(`Blocked dangerous query: ${pattern}`);
        return false;
      }
    }

    // 2. 위험 패턴 경고
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(query)) {
        console.warn(`WARNING: Potentially dangerous query detected`);
        console.warn(`Pattern: ${pattern}`);
        console.warn(`Query: ${query.substring(0, 100)}...`);

        // WHERE 절 체크
        if (!this.hasWhereClause(query)) {
          console.warn(`WARNING: No WHERE clause detected!`);
        }
      }
    }

    // 3. 보호된 테이블 체크
    for (const table of this.protectedTables) {
      const tablePattern = new RegExp(
        `(drop|truncate)\\s+(table\\s+)?${table}`,
        'i'
      );
      if (tablePattern.test(query)) {
        this.block(`Protected table operation: ${table}`);
        return false;
      }
    }

    // 4. 백업 권장 체크
    for (const pattern of this.backupRequired) {
      if (pattern.test(query)) {
        console.log(`BACKUP RECOMMENDED: Query modifies data`);
        this.suggestBackup(query);
      }
    }

    // 5. 대량 영향 체크
    if (this.estimateAffectedRows(query) > 1000) {
      console.warn(`WARNING: Query may affect >1000 rows`);
      console.warn(`Consider adding LIMIT or more specific WHERE clause`);
    }

    return true;
  }

  hasWhereClause(query) {
    // UPDATE나 DELETE에 WHERE 절이 있는지 체크
    if (/update|delete/i.test(query)) {
      return /where\s+/i.test(query);
    }
    return true;
  }

  estimateAffectedRows(query) {
    // 간단한 휴리스틱으로 영향받을 행 추정
    if (/where\s+/i.test(query)) {
      if (/where\s+id\s*=/i.test(query)) return 1;
      if (/where.*in\s*\(/i.test(query)) return 10;
      return 100;
    }
    return 10000; // WHERE 절 없으면 전체
  }

  suggestBackup(query) {
    // 백업 명령 제안
    const tables = this.extractTables(query);
    if (tables.length > 0) {
      console.log(`\nSuggested backup command:`);
      tables.forEach((table) => {
        console.log(
          `pg_dump -t ${table} > backup_${table}_$(date +%Y%m%d_%H%M%S).sql`
        );
      });
    }
  }

  extractTables(query) {
    const tables = [];
    const patterns = [
      /from\s+(\w+)/gi,
      /update\s+(\w+)/gi,
      /into\s+(\w+)/gi,
      /table\s+(\w+)/gi,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(query)) !== null) {
        if (!tables.includes(match[1])) {
          tables.push(match[1]);
        }
      }
    });

    return tables;
  }

  block(reason) {
    console.error(`BLOCKED: ${reason}`);
    console.error(`Query was not executed for safety reasons`);
    process.exit(1);
  }
}

// 실행
const validator = new DatabaseSafetyValidator();
if (query) {
  validator.validate(query);
}
