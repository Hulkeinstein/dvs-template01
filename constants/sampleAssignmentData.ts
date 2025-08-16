// Sample Assignment Data for Testing

interface TimeLimit {
  value: number;
  unit: 'hours' | 'days' | 'weeks' | 'months';
}

interface Attachment {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface AssignmentData {
  title: string;
  summary: string;
  timeLimit: TimeLimit;
  totalPoints: number;
  passingPoints: number;
  maxUploads: number;
  maxFileSize: number;
  attachments: Attachment[];
}

type AssignmentType = 'basic' | 'advanced' | 'quiz' | 'report' | 'group' | 'practice';

type SampleAssignmentData = Record<AssignmentType, AssignmentData>;

export const sampleAssignmentData: SampleAssignmentData = {
  // 기본 Assignment 데이터
  basic: {
    title: '프로젝트 제출 과제',
    summary:
      '<p>이번 과제는 React를 사용하여 간단한 Todo 앱을 만드는 것입니다.</p><p><strong>요구사항:</strong></p><ul><li>할 일 추가/삭제 기능</li><li>완료 상태 토글</li><li>로컬 스토리지 저장</li></ul>',
    timeLimit: { value: 2, unit: 'weeks' },
    totalPoints: 100,
    passingPoints: 70,
    maxUploads: 3,
    maxFileSize: 10,
    attachments: [],
  },

  // 복잡한 Assignment 데이터
  advanced: {
    title: '최종 프로젝트 - E-commerce 웹사이트',
    summary: `
      <h3>프로젝트 개요</h3>
      <p>완전한 기능을 갖춘 E-commerce 웹사이트를 구현하세요.</p>
      
      <h4>필수 기능:</h4>
      <ol>
        <li>사용자 인증 (로그인/회원가입)</li>
        <li>상품 목록 및 상세 페이지</li>
        <li>장바구니 기능</li>
        <li>결제 프로세스 (모의)</li>
        <li>관리자 대시보드</li>
      </ol>
      
      <h4>기술 스택:</h4>
      <ul>
        <li>Frontend: React 또는 Next.js</li>
        <li>Backend: Node.js + Express 또는 Next.js API Routes</li>
        <li>Database: MongoDB 또는 PostgreSQL</li>
        <li>Styling: Tailwind CSS 또는 Material-UI</li>
      </ul>
      
      <h4>평가 기준:</h4>
      <table>
        <tr>
          <th>항목</th>
          <th>배점</th>
        </tr>
        <tr>
          <td>기능 구현</td>
          <td>40점</td>
        </tr>
        <tr>
          <td>코드 품질</td>
          <td>20점</td>
        </tr>
        <tr>
          <td>UI/UX 디자인</td>
          <td>20점</td>
        </tr>
        <tr>
          <td>문서화</td>
          <td>10점</td>
        </tr>
        <tr>
          <td>테스트</td>
          <td>10점</td>
        </tr>
      </table>
      
      <p><strong>제출 기한: 4주</strong></p>
    `,
    timeLimit: { value: 4, unit: 'weeks' },
    totalPoints: 100,
    passingPoints: 80,
    maxUploads: 5,
    maxFileSize: 50,
    attachments: [
      {
        name: 'project-requirements.pdf',
        size: 245760,
        type: 'application/pdf',
        url: '#',
      },
      {
        name: 'design-mockup.fig',
        size: 1048576,
        type: 'application/octet-stream',
        url: '#',
      },
    ],
  },

  // 퀴즈형 Assignment
  quiz: {
    title: '코딩 테스트 - 알고리즘 문제',
    summary: `
      <h3>문제 1: Two Sum (30점)</h3>
      <p>정수 배열과 타겟 숫자가 주어졌을 때, 합이 타겟이 되는 두 숫자의 인덱스를 반환하세요.</p>
      <pre><code>
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9
      </code></pre>
      
      <h3>문제 2: Valid Parentheses (35점)</h3>
      <p>괄호로만 이루어진 문자열이 유효한지 판단하세요.</p>
      <pre><code>
Input: s = "()[]{}"
Output: true

Input: s = "([)]"
Output: false
      </code></pre>
      
      <h3>문제 3: Merge Two Sorted Lists (35점)</h3>
      <p>정렬된 두 연결 리스트를 병합하여 하나의 정렬된 리스트로 만드세요.</p>
      
      <p><strong>제출 형식:</strong> JavaScript 또는 Python 파일</p>
      <p><strong>시간 제한:</strong> 2시간</p>
    `,
    timeLimit: { value: 2, unit: 'hours' },
    totalPoints: 100,
    passingPoints: 60,
    maxUploads: 3,
    maxFileSize: 1,
    attachments: [],
  },

  // 리포트형 Assignment
  report: {
    title: '기술 리서치 보고서',
    summary: `
      <h2>과제 주제: AI와 웹 개발의 미래</h2>
      
      <h3>작성 가이드라인:</h3>
      <ul>
        <li>분량: A4 10-15페이지</li>
        <li>폰트: 맑은 고딕 11pt</li>
        <li>줄간격: 1.5</li>
        <li>여백: 기본 설정</li>
      </ul>
      
      <h3>필수 포함 내용:</h3>
      <ol>
        <li><strong>서론 (10점)</strong>
          <ul>
            <li>연구 배경 및 목적</li>
            <li>연구 범위</li>
          </ul>
        </li>
        <li><strong>본론 (60점)</strong>
          <ul>
            <li>현재 AI 기술 동향</li>
            <li>웹 개발에서의 AI 활용 사례</li>
            <li>ChatGPT, GitHub Copilot 등 분석</li>
            <li>미래 전망 및 예측</li>
          </ul>
        </li>
        <li><strong>결론 (20점)</strong>
          <ul>
            <li>요약 및 시사점</li>
            <li>개인적 견해</li>
          </ul>
        </li>
        <li><strong>참고문헌 (10점)</strong>
          <ul>
            <li>최소 10개 이상의 신뢰할 수 있는 출처</li>
          </ul>
        </li>
      </ol>
      
      <p><em>표절 검사를 실시합니다. 표절률 20% 이상 시 0점 처리됩니다.</em></p>
    `,
    timeLimit: { value: 1, unit: 'weeks' },
    totalPoints: 100,
    passingPoints: 70,
    maxUploads: 2,
    maxFileSize: 20,
    attachments: [
      {
        name: 'report-template.docx',
        size: 35840,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '#',
      },
    ],
  },

  // 그룹 프로젝트 Assignment
  group: {
    title: '팀 프로젝트 - 스타트업 아이디어 구현',
    summary: `
      <h2>🚀 스타트업 MVP 개발 프로젝트</h2>
      
      <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>📋 프로젝트 요구사항</h3>
        <p><strong>팀 구성:</strong> 3-4명</p>
        <p><strong>기간:</strong> 6주</p>
        <p><strong>목표:</strong> 실제 사용 가능한 MVP(Minimum Viable Product) 개발</p>
      </div>
      
      <h3>단계별 진행 계획:</h3>
      
      <h4>Week 1-2: 기획 및 설계</h4>
      <ul>
        <li>아이디어 도출 및 시장 조사</li>
        <li>사용자 페르소나 정의</li>
        <li>기능 명세서 작성</li>
        <li>와이어프레임 및 프로토타입 제작</li>
      </ul>
      
      <h4>Week 3-4: 개발</h4>
      <ul>
        <li>Frontend 개발</li>
        <li>Backend API 구현</li>
        <li>Database 설계 및 구축</li>
        <li>기본 기능 통합</li>
      </ul>
      
      <h4>Week 5: 테스트 및 개선</h4>
      <ul>
        <li>단위 테스트 및 통합 테스트</li>
        <li>사용자 테스트 (최소 10명)</li>
        <li>피드백 반영 및 버그 수정</li>
      </ul>
      
      <h4>Week 6: 발표 준비</h4>
      <ul>
        <li>프레젠테이션 자료 제작</li>
        <li>데모 시나리오 준비</li>
        <li>배포 (Vercel, Netlify 등)</li>
      </ul>
      
      <h3>제출물:</h3>
      <ol>
        <li>소스 코드 (GitHub 저장소 링크)</li>
        <li>프로젝트 문서 (README, API 문서 등)</li>
        <li>발표 자료 (PPT/PDF)</li>
        <li>데모 영상 (5-10분)</li>
        <li>팀원별 기여도 보고서</li>
      </ol>
      
      <div style="border: 2px solid #ff6b6b; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>⚠️ 평가 항목 및 배점</h4>
        <ul>
          <li>아이디어 창의성 및 실용성 - 20점</li>
          <li>기술 구현 완성도 - 30점</li>
          <li>UI/UX 디자인 - 15점</li>
          <li>코드 품질 및 문서화 - 15점</li>
          <li>프레젠테이션 - 10점</li>
          <li>팀워크 및 협업 - 10점</li>
        </ul>
      </div>
      
      <p><strong>💡 보너스 점수 (최대 10점):</strong></p>
      <ul>
        <li>실제 사용자 확보 (10명 이상) - 5점</li>
        <li>모바일 반응형 완벽 구현 - 3점</li>
        <li>CI/CD 파이프라인 구축 - 2점</li>
      </ul>
    `,
    timeLimit: { value: 6, unit: 'weeks' },
    totalPoints: 100,
    passingPoints: 75,
    maxUploads: 10,
    maxFileSize: 100,
    attachments: [],
  },

  // 간단한 실습 Assignment
  practice: {
    title: 'CSS 레이아웃 실습',
    summary: `
      <h3>실습 목표</h3>
      <p>Flexbox와 Grid를 사용하여 반응형 레이아웃을 구현하세요.</p>
      
      <h4>요구사항:</h4>
      <ul>
        <li>헤더, 사이드바, 메인 콘텐츠, 푸터 구조</li>
        <li>모바일, 태블릿, 데스크톱 반응형</li>
        <li>다크 모드 지원</li>
      </ul>
      
      <p>제공된 HTML 구조를 수정하지 말고 CSS만으로 구현하세요.</p>
    `,
    timeLimit: { value: 3, unit: 'days' },
    totalPoints: 50,
    passingPoints: 30,
    maxUploads: 2,
    maxFileSize: 5,
    attachments: [
      {
        name: 'starter-template.html',
        size: 4096,
        type: 'text/html',
        url: '#',
      },
    ],
  },
} as const;

// 여러 Assignment를 한번에 테스트하기 위한 배열
export const multipleAssignments: AssignmentData[] = [
  sampleAssignmentData.basic,
  sampleAssignmentData.quiz,
  sampleAssignmentData.practice,
];

// Assignment Modal에서 직접 사용할 수 있는 함수
export const loadSampleAssignment = (type: AssignmentType = 'basic'): AssignmentData => {
  return sampleAssignmentData[type] || sampleAssignmentData.basic;
};