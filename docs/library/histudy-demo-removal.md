---
title: "HiStudy 데모 삭제 기록 (T2)"
tags:
  - type/docs
  - component/ui
  - progress/in-progress
created: 2026-09-16
updated: 2026-09-16
lifecycle: draft
---

## 개요

HiStudy 데모 화면(번호 데모 홈·요소·페이지·코스·퀴즈·lesson·profile·블로그)을 걷어내면서, 어떤 화면이 어떤 컴포넌트·데이터를 함께 썼는지와 되살리는 명령을 기록한다. 화면 하나를 되살려야 하면 이 문서의 해당 라우트 섹션의 **복구 명령**을 그대로 실행하면 된다.

기준 태그: `pre-demo-removal` (커밋 `91d9fd9541217e68312dd6f8c0cca4eb1b80991c`) · 계획 기준: route-map.json의 deleteFiles

생성 명령: `node scripts/demo-removal/render-doc.mjs --date 2026-09-16 --links .tmp/demo-removal/links-baseline.txt`

이 문서는 `scripts/demo-removal/render-doc.mjs`의 생성물이다 — 손으로 고치지 말고 다시 생성한다.

## 복구 방법

전체 복구 — 아래 **삭제한 파일 전체 목록** 블록을 읽어 한 번에 되살린다.

```bash
awk '/^## 삭제한 파일 전체 목록/{f=1;next} f&&/^```text/{g=1;next} g&&/^```/{exit} g' \
  docs/library/histudy-demo-removal.md \
  | xargs -d '\n' git checkout pre-demo-removal --
```

화면 하나만 되살리려면 해당 라우트 섹션(`### /...`)의 **복구 명령** 블록만 실행한다.

## 되살릴 때 알아둘 점

**(a)** 메뉴·링크·경로 분기는 유지 파일에서 지웠으므로 화면 파일만 되살리면 메뉴에는 나오지 않는다.

수정한 유지 파일 목록: Phase 2 이후 채워짐

**(b)** 섹션 복구 명령에는 다른 삭제 화면과 함께 쓰던 파일도 들어 있을 수 있다 — 중복 복구는 무해하다.

**(c)** T5(Next 15·React 19 전환) 이후에는 되살린 파일이 전환되지 않은 상태다.

**(d)** SCSS·이미지는 지우지 않았다.

**(e)** `.prettierignore`에서 뺀 항목: 아직 없음(T013 이후 채워짐)

## 요약

| 그룹 | 라우트 섹션 수 | 진입점 수 | 삭제 파일 수 |
| --- | --- | --- | --- |
| Phase 3 — 번호 데모 홈 | 24 | 24 | 138 |
| Phase 4 — 요소·페이지·코스·퀴즈 데모 | 58 | 71 | 305 |
| Phase 5 — lesson 데모·profile | 7 | 8 | 22 |
| Phase 6 — 블로그 | 10 | 16 | 39 |
| 합계 | 99 | 119 | 504 |

## Phase 3 — 번호 데모 홈

### /02-course-school

**진입 파일**:

- app/02-course-school/page.js

**함께 삭제한 컴포넌트**:

- components/02-course-school/CourseSchool.js
- components/Common/CourseTag-Two.js
- components/Events/Events.js
- components/Footer/FooterFour.js
- components/Header/HeaderStyle-Six.js
- components/Header/Headers/Header-Six.js
- components/Services/Service-Three.js
- components/Team/TeamHead.js
- components/Team/TeamSix.js
- components/Testimonials/Testimonial-Three.js

**함께 삭제한 데이터**:

- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- components/Newsletters/Newsletter-Three.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/newsletter.json
- data/elements/team.json
- data/elements/testimonial.json
- data/events.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/02-course-school/(course-school)/index.js' \
  'app/02-course-school/page.js' \
  'components/02-course-school/CourseSchool.js' \
  'components/Common/CourseTag-Two.js' \
  'components/Events/Events.js' \
  'components/Footer/FooterFour.js' \
  'components/Header/HeaderStyle-Six.js' \
  'components/Header/Headers/Header-Six.js' \
  'components/Services/Service-Three.js' \
  'components/Team/TeamHead.js' \
  'components/Team/TeamSix.js' \
  'components/Testimonials/Testimonial-Three.js' \
  'data/elements/service.json'
```

### /03-online-school

**진입 파일**:

- app/03-online-school/page.js

**함께 삭제한 컴포넌트**:

- components/03-online-school/OnlineSchool.js
- components/03-online-school/OnlineSchoolForm.js
- components/Call-To-Action/CallToAction-Five.js
- components/Category/CategoryThree.js
- components/Category/Filter/Course-Six.js
- components/Counters/Counter-Five.js
- components/Events/Events.js
- components/Header/HeaderStyle-Eleven.js
- components/Header/Headers/Header-Nine.js
- components/Services/Service-Nine.js
- components/Services/Service-Ten.js
- components/Team/TeamTen.js
- components/Testimonials/Testimonial-Two.js

**함께 삭제한 데이터**:

- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Cards/Card.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Testimonials/Testimonial-Scroll/Scroll.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/calltoaction.json
- data/elements/counter.json
- data/elements/team.json
- data/elements/testimonial.json
- data/events.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/03-online-school/(online-school)/index.js' \
  'app/03-online-school/page.js' \
  'components/03-online-school/OnlineSchool.js' \
  'components/03-online-school/OnlineSchoolForm.js' \
  'components/Call-To-Action/CallToAction-Five.js' \
  'components/Category/CategoryThree.js' \
  'components/Category/Filter/Course-Six.js' \
  'components/Counters/Counter-Five.js' \
  'components/Events/Events.js' \
  'components/Header/HeaderStyle-Eleven.js' \
  'components/Header/Headers/Header-Nine.js' \
  'components/Services/Service-Nine.js' \
  'components/Services/Service-Ten.js' \
  'components/Team/TeamTen.js' \
  'components/Testimonials/Testimonial-Two.js' \
  'data/elements/service.json'
```

### /04-kindergarten

**진입 파일**:

- app/04-kindergarten/page.js

**함께 삭제한 컴포넌트**:

- components/04-kindergarten/04-kindergarten.js
- components/Cards/Card-Five.js
- components/Counters/Counter-Two.js
- components/Gallery/Gallery.js
- components/Header/Header-Top/Header-Language.js
- components/Header/Header-Top/HeaderTop-Seven.js
- components/Header/HeaderStyle-Eight.js
- components/Header/Headers/Header-Six.js
- components/Pricing/Plans/BasicPlan.js
- components/Pricing/Plans/ExclusivePlan.js
- components/Pricing/Plans/StandardPlan.js
- components/Pricing/Pricing.js
- components/Services/Service-Eleven.js
- components/Team/TeamFour.js
- components/Team/TeamHead.js
- components/Testimonials/Testimonial.js

**함께 삭제한 데이터**:

- data/elements/card.json
- data/elements/gallery.json
- data/elements/pricing.json
- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Call-To-Action/CallToAction.js
- components/Common/Separator.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/elements/calltoaction.json
- data/elements/counter.json
- data/elements/team.json
- data/elements/testimonial.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/04-kindergarten/(kindergarten)/index.js' \
  'app/04-kindergarten/page.js' \
  'components/04-kindergarten/04-kindergarten.js' \
  'components/Cards/Card-Five.js' \
  'components/Counters/Counter-Two.js' \
  'components/Gallery/Gallery.js' \
  'components/Header/Header-Top/Header-Language.js' \
  'components/Header/Header-Top/HeaderTop-Seven.js' \
  'components/Header/HeaderStyle-Eight.js' \
  'components/Header/Headers/Header-Six.js' \
  'components/Pricing/Plans/BasicPlan.js' \
  'components/Pricing/Plans/ExclusivePlan.js' \
  'components/Pricing/Plans/StandardPlan.js' \
  'components/Pricing/Pricing.js' \
  'components/Services/Service-Eleven.js' \
  'components/Team/TeamFour.js' \
  'components/Team/TeamHead.js' \
  'components/Testimonials/Testimonial.js' \
  'data/elements/card.json' \
  'data/elements/gallery.json' \
  'data/elements/pricing.json' \
  'data/elements/service.json'
```

### /05-classic-lms

**진입 파일**:

- app/05-classic-lms/page.js

**함께 삭제한 컴포넌트**:

- components/05-classic-lms/05-ClassicLms.js
- components/Blogs/BlogGrid.js
- components/Category/CategorySix.js
- components/Header/Header-Top/Header-Language.js
- components/Header/Header-Top/HeaderTopMid-Three.js
- components/Header/HeaderStyle-Nine.js
- components/Header/Headers/Header-Seven.js
- components/Testimonials/Testimonial-Four.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/01-Main-Demo/Home-Sections/HomeCourse.js
- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Cards/Card.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Instagram/Instagram.js
- components/Newsletters/Newsletter-Three.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/instagram.json
- data/elements/newsletter.json
- data/elements/testimonial.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/05-classic-lms/(classic-lms)/index.js' \
  'app/05-classic-lms/page.js' \
  'components/05-classic-lms/05-ClassicLms.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Category/CategorySix.js' \
  'components/Header/Header-Top/Header-Language.js' \
  'components/Header/Header-Top/HeaderTopMid-Three.js' \
  'components/Header/HeaderStyle-Nine.js' \
  'components/Header/Headers/Header-Seven.js' \
  'components/Testimonials/Testimonial-Four.js'
```

### /06-university-status

**진입 파일**:

- app/06-university-status/page.js

**함께 삭제한 컴포넌트**:

- components/06-university-status/UniversityStatus.js
- components/Abouts/About-Four.js
- components/Abouts/About-Three.js
- components/Accordions/Course.js
- components/AdvanceTab/AdvanceTab-Four.js
- components/AdvanceTab/SectionHead.js
- components/Call-To-Action/CallToAction-Four.js
- components/Call-To-Action/CallToAction-Six.js
- components/Category/Filter/CourseCard-Three.js
- components/Counters/Counter-Six.js
- components/Header/Header-Top/HeaderTop-Four.js
- components/Header/HeaderStyle-Four.js
- components/Header/Headers/Header-Four.js
- components/Services/Service-Three.js
- components/Services/Service-Twelve.js
- components/Split/Split.js

**함께 삭제한 데이터**:

- data/elements/advanceTab.json
- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Counters/Counter-Head.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/about.json
- data/elements/accordion.json
- data/elements/calltoaction.json
- data/elements/counter.json
- data/elements/split.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/06-university-status/(university-status)/index.js' \
  'app/06-university-status/page.js' \
  'components/06-university-status/UniversityStatus.js' \
  'components/Abouts/About-Four.js' \
  'components/Abouts/About-Three.js' \
  'components/Accordions/Course.js' \
  'components/AdvanceTab/AdvanceTab-Four.js' \
  'components/AdvanceTab/SectionHead.js' \
  'components/Call-To-Action/CallToAction-Four.js' \
  'components/Call-To-Action/CallToAction-Six.js' \
  'components/Category/Filter/CourseCard-Three.js' \
  'components/Counters/Counter-Six.js' \
  'components/Header/Header-Top/HeaderTop-Four.js' \
  'components/Header/HeaderStyle-Four.js' \
  'components/Header/Headers/Header-Four.js' \
  'components/Services/Service-Three.js' \
  'components/Services/Service-Twelve.js' \
  'components/Split/Split.js' \
  'data/elements/advanceTab.json' \
  'data/elements/service.json'
```

### /07-instructor-portfolio

**진입 파일**:

- app/07-instructor-portfolio/page.js

**함께 삭제한 컴포넌트**:

- components/07-instructor-portfolio/InstructorForm.js
- components/07-instructor-portfolio/InstructorPortfolio.js
- components/Abouts/About-Five.js
- components/Category/CategoryEight.js
- components/Counters/Counter-Six.js
- components/Header/Header-Top/HeaderTop-Two.js
- components/Header/HeaderStyle-Seven.js
- components/Header/Headers/Header-Two.js
- components/Pricing/Pricing-Five.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Counters/Counter-Head.js
- components/Counters/CounterWrap.js
- components/Footer/Footer-Two.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- components/Newsletters/Newsletter-Three.js
- components/Testimonials/Testimonial-Scroll/Scroll.js
- components/Testimonials/Testimonial-Six.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/about.json
- data/elements/counter.json
- data/elements/newsletter.json
- data/elements/testimonial.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/07-instructor-portfolio/(instructor-portfolio)/index.js' \
  'app/07-instructor-portfolio/page.js' \
  'components/07-instructor-portfolio/InstructorForm.js' \
  'components/07-instructor-portfolio/InstructorPortfolio.js' \
  'components/Abouts/About-Five.js' \
  'components/Category/CategoryEight.js' \
  'components/Counters/Counter-Six.js' \
  'components/Header/Header-Top/HeaderTop-Two.js' \
  'components/Header/HeaderStyle-Seven.js' \
  'components/Header/Headers/Header-Two.js' \
  'components/Pricing/Pricing-Five.js'
```

### /08-language-academy

**진입 파일**:

- app/08-language-academy/page.js

**함께 삭제한 컴포넌트**:

- components/08-language-academy/LanguageAcademy.js
- components/Category/CategoryFour.js
- components/Counters/CountDownTwo.js
- components/Header/Header-Top/Header-Language.js
- components/Header/Header-Top/HeaderTop-Seven.js
- components/Header/HeaderStyle-Eight.js
- components/Header/Headers/Header-Six.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Abouts/About-Two.js
- components/Common/Separator.js
- components/Counters/Counter-Head.js
- components/Counters/Counter.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- components/Maintenance/CountDonw.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/about.json
- data/elements/counter.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/08-language-academy/(language-academy)/index.js' \
  'app/08-language-academy/page.js' \
  'components/08-language-academy/LanguageAcademy.js' \
  'components/Category/CategoryFour.js' \
  'components/Counters/CountDownTwo.js' \
  'components/Header/Header-Top/Header-Language.js' \
  'components/Header/Header-Top/HeaderTop-Seven.js' \
  'components/Header/HeaderStyle-Eight.js' \
  'components/Header/Headers/Header-Six.js'
```

### /10-online-course

**진입 파일**:

- app/10-online-course/page.js

**함께 삭제한 컴포넌트**:

- components/10-online-course/OnlineCourse.js
- components/10-online-course/OnlineCourseBanner.js
- components/Abouts/About-Six.js
- components/Call-To-Action/CallToAction-Six.js
- components/Category/CategoryThree.js
- components/Category/Filter/Course-Six.js
- components/Header/Category/SearchWithCategory.js
- components/Header/Header-Top/HeaderMid-One.js
- components/Header/HeaderStyle-Three.js
- components/Header/Headers/Header-Ten.js
- components/Services/Service-Saven.js
- components/Testimonials/Testimonial-Two.js

**함께 삭제한 데이터**:

- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Newsletters/Newsletter-Three.js
- components/Testimonials/Testimonial-Scroll/Scroll.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/about.json
- data/elements/calltoaction.json
- data/elements/newsletter.json
- data/elements/testimonial.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/10-online-course/(online-course)/index.js' \
  'app/10-online-course/page.js' \
  'components/10-online-course/OnlineCourse.js' \
  'components/10-online-course/OnlineCourseBanner.js' \
  'components/Abouts/About-Six.js' \
  'components/Call-To-Action/CallToAction-Six.js' \
  'components/Category/CategoryThree.js' \
  'components/Category/Filter/Course-Six.js' \
  'components/Header/Category/SearchWithCategory.js' \
  'components/Header/Header-Top/HeaderMid-One.js' \
  'components/Header/HeaderStyle-Three.js' \
  'components/Header/Headers/Header-Ten.js' \
  'components/Services/Service-Saven.js' \
  'components/Testimonials/Testimonial-Two.js' \
  'data/elements/service.json'
```

### /11-single-course

**진입 파일**:

- app/11-single-course/page.js

**함께 삭제한 컴포넌트**:

- components/11-single-course/CourseLessonProp.js
- components/11-single-course/CourseSlider.js
- components/11-single-course/SingleCourse.js
- components/11-single-course/SingleCourseBanner.js
- components/11-single-course/SingleCourseProp.js
- components/Header/HeaderStyle-Eleven.js
- components/Header/Headers/Header-Nine.js
- components/Newsletters/Newsletter-Four.js
- components/Pricing/Pricing-Five.js

**함께 삭제한 데이터**:

- data/pages/11-singleCourse.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Testimonials/Testimonial-Seven.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/newsletter.json
- data/elements/team.json
- data/elements/testimonial.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/11-single-course/(single-course)/index.js' \
  'app/11-single-course/page.js' \
  'components/11-single-course/CourseLessonProp.js' \
  'components/11-single-course/CourseSlider.js' \
  'components/11-single-course/SingleCourse.js' \
  'components/11-single-course/SingleCourseBanner.js' \
  'components/11-single-course/SingleCourseProp.js' \
  'components/Header/HeaderStyle-Eleven.js' \
  'components/Header/Headers/Header-Nine.js' \
  'components/Newsletters/Newsletter-Four.js' \
  'components/Pricing/Pricing-Five.js' \
  'data/pages/11-singleCourse.json'
```

### /12-marketplace

**진입 파일**:

- app/12-marketplace/page.js

**함께 삭제한 컴포넌트**:

- components/12-Marketplace/12-Marketplace.js
- components/Blogs/BlogGridMinimal.js
- components/Category/CategoryEight.js
- components/Counters/Counter-Five.js
- components/Header/Header-Top/Header-Language.js
- components/Header/Header-Top/HeaderTopMid-Three.js
- components/Header/HeaderStyle-Nine.js
- components/Header/Headers/Header-Seven.js
- components/Newsletters/Newsletter-Four.js
- components/Testimonials/Testimonial-Five.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Cards/Card.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/counter.json
- data/elements/newsletter.json
- data/elements/testimonial.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/12-marketplace/(marketplace)/index.js' \
  'app/12-marketplace/page.js' \
  'components/12-Marketplace/12-Marketplace.js' \
  'components/Blogs/BlogGridMinimal.js' \
  'components/Category/CategoryEight.js' \
  'components/Counters/Counter-Five.js' \
  'components/Header/Header-Top/Header-Language.js' \
  'components/Header/Header-Top/HeaderTopMid-Three.js' \
  'components/Header/HeaderStyle-Nine.js' \
  'components/Header/Headers/Header-Seven.js' \
  'components/Newsletters/Newsletter-Four.js' \
  'components/Testimonials/Testimonial-Five.js'
```

### /13-university-classic

**진입 파일**:

- app/13-university-classic/page.js

**함께 삭제한 컴포넌트**:

- components/13-university-classic/13-University-Classic.js
- components/13-university-classic/UniversityBanner.js
- components/Accordions/Course.js
- components/AdvanceTab/AdvanceTab.js
- components/AdvanceTab/SectionHead.js
- components/Blogs/BlogGrid.js
- components/Brand/Brand-One.js
- components/Cards/Card-Three.js
- components/Events/Events.js
- components/Gallery/Gallery.js
- components/Header/Header-Top/HeaderTop-Four.js
- components/Header/HeaderStyle-Four.js
- components/Header/Headers/Header-Four.js
- components/Services/Service-Eight.js
- components/Testimonials/Testimonial.js

**함께 삭제한 데이터**:

- data/elements/advanceTab.json
- data/elements/brands.json
- data/elements/card.json
- data/elements/gallery.json
- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/accordion.json
- data/elements/testimonial.json
- data/events.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/13-university-classic/(university-classic)/index.js' \
  'app/13-university-classic/page.js' \
  'components/13-university-classic/13-University-Classic.js' \
  'components/13-university-classic/UniversityBanner.js' \
  'components/Accordions/Course.js' \
  'components/AdvanceTab/AdvanceTab.js' \
  'components/AdvanceTab/SectionHead.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Brand/Brand-One.js' \
  'components/Cards/Card-Three.js' \
  'components/Events/Events.js' \
  'components/Gallery/Gallery.js' \
  'components/Header/Header-Top/HeaderTop-Four.js' \
  'components/Header/HeaderStyle-Four.js' \
  'components/Header/Headers/Header-Four.js' \
  'components/Services/Service-Eight.js' \
  'components/Testimonials/Testimonial.js' \
  'data/elements/advanceTab.json' \
  'data/elements/brands.json' \
  'data/elements/card.json' \
  'data/elements/gallery.json' \
  'data/elements/service.json'
```

### /14-home-elegant

**진입 파일**:

- app/14-home-elegant/page.js

**함께 삭제한 컴포넌트**:

- components/14-home-elegant/14-Home-Elegant.js
- components/14-home-elegant/CrashCourse.js
- components/14-home-elegant/HomeElegantBanner.js
- components/Brand/Brand-Three.js
- components/Cards/Card-Six.js
- components/Header/HeaderStyle-Six.js
- components/Header/Headers/Header-Six.js
- components/Testimonials/Testimonial-Two.js

**함께 삭제한 데이터**:

- data/elements/brands.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- components/Testimonials/Testimonial-Scroll/Scroll.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/testimonial.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/14-home-elegant/(home-elegant)/index.js' \
  'app/14-home-elegant/page.js' \
  'components/14-home-elegant/14-Home-Elegant.js' \
  'components/14-home-elegant/CrashCourse.js' \
  'components/14-home-elegant/HomeElegantBanner.js' \
  'components/Brand/Brand-Three.js' \
  'components/Cards/Card-Six.js' \
  'components/Header/HeaderStyle-Six.js' \
  'components/Header/Headers/Header-Six.js' \
  'components/Testimonials/Testimonial-Two.js' \
  'data/elements/brands.json'
```

### /15-home-technology

**진입 파일**:

- app/15-home-technology/page.js

**함께 삭제한 컴포넌트**:

- components/11-single-course/CourseLessonProp.js
- components/11-single-course/CourseSlider.js
- components/11-single-course/SingleCourseProp.js
- components/15-home-technology/HomeTechnology.js
- components/15-home-technology/HomeTechnologyBanner.js
- components/Abouts/About-Saven.js
- components/Brand/Brand-Three.js
- components/Header/HeaderStyle-Twelve.js
- components/Header/SideNav.js
- components/Newsletters/Newsletter-Four.js
- components/Services/Service.js
- components/Team/TeamEight.js
- components/Team/TeamHead.js
- components/Testimonials/Testimonial-Four.js

**함께 삭제한 데이터**:

- data/elements/brands.json
- data/elements/service.json
- data/pages/11-singleCourse.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Become-a-Teacher/TeacherGallery.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- data/elements/about.json
- data/elements/newsletter.json
- data/elements/team.json
- data/elements/testimonial.json
- data/footer.json
- data/pages/become-A-Teacher.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/15-home-technology/(home-technology)/index.js' \
  'app/15-home-technology/page.js' \
  'components/11-single-course/CourseLessonProp.js' \
  'components/11-single-course/CourseSlider.js' \
  'components/11-single-course/SingleCourseProp.js' \
  'components/15-home-technology/HomeTechnology.js' \
  'components/15-home-technology/HomeTechnologyBanner.js' \
  'components/Abouts/About-Saven.js' \
  'components/Brand/Brand-Three.js' \
  'components/Header/HeaderStyle-Twelve.js' \
  'components/Header/SideNav.js' \
  'components/Newsletters/Newsletter-Four.js' \
  'components/Services/Service.js' \
  'components/Team/TeamEight.js' \
  'components/Team/TeamHead.js' \
  'components/Testimonials/Testimonial-Four.js' \
  'data/elements/brands.json' \
  'data/elements/service.json' \
  'data/pages/11-singleCourse.json'
```

### /16-udemy-affiliate

**진입 파일**:

- app/16-udemy-affiliate/page.js

**함께 삭제한 컴포넌트**:

- components/16-udemy-affiliate/UdemyAffiliate-Banner.js
- components/16-udemy-affiliate/UdemyAffiliate.js
- components/Abouts/About-Eight.js
- components/Brand/Brand-One.js
- components/Testimonials/Testimonial-Five.js

**함께 삭제한 데이터**:

- data/elements/brands.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Cards/Card.js
- components/Category/CategoryOne.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/about.json
- data/elements/category.json
- data/elements/testimonial.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/16-udemy-affiliate/(udemy-affiliate)/index.js' \
  'app/16-udemy-affiliate/page.js' \
  'components/16-udemy-affiliate/UdemyAffiliate-Banner.js' \
  'components/16-udemy-affiliate/UdemyAffiliate.js' \
  'components/Abouts/About-Eight.js' \
  'components/Brand/Brand-One.js' \
  'components/Testimonials/Testimonial-Five.js' \
  'data/elements/brands.json'
```

### /17-online-academy

**진입 파일**:

- app/17-online-academy/page.js

**함께 삭제한 컴포넌트**:

- components/17-online-academy/OnlineAcademy-Banner.js
- components/17-online-academy/OnlineAcademy.js
- components/Blogs/BlogGrid.js
- components/Header/Header-Top/HeaderTop-Four.js
- components/Header/Headers/Header-Four.js
- components/Header/package/HeaderType-Container-Four.js
- components/Testimonials/Testimonial-Four.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Abouts/About-Two.js
- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Category/CategoryOne.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Counters/Counter-Head.js
- components/Counters/Counter.js
- components/Counters/CounterWrap.js
- components/Events/EventCarouse.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/about.json
- data/elements/counter.json
- data/elements/testimonial.json
- data/events.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/17-online-academy/(online-academy)/index.js' \
  'app/17-online-academy/page.js' \
  'components/17-online-academy/OnlineAcademy-Banner.js' \
  'components/17-online-academy/OnlineAcademy.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Header/Header-Top/HeaderTop-Four.js' \
  'components/Header/Headers/Header-Four.js' \
  'components/Header/package/HeaderType-Container-Four.js' \
  'components/Testimonials/Testimonial-Four.js'
```

### /18-instructors-coaches

**진입 파일**:

- app/18-instructors-coaches/page.js

**함께 삭제한 컴포넌트**:

- components/18-instructors-coaches/InstructorsCoaches-Banner.js
- components/18-instructors-coaches/InstructorsCoaches.js
- components/Blogs/BlogGrid.js
- components/Header/HeaderStyle-Six.js
- components/Header/Headers/Header-Six.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- components/Newsletters/Newsletter-Two.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/newsletter.json
- data/elements/testimonial.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/18-instructors-coaches/(instructors-coaches)/index.js' \
  'app/18-instructors-coaches/page.js' \
  'components/18-instructors-coaches/InstructorsCoaches-Banner.js' \
  'components/18-instructors-coaches/InstructorsCoaches.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Header/HeaderStyle-Six.js' \
  'components/Header/Headers/Header-Six.js'
```

### /19-modern-university

**진입 파일**:

- app/19-modern-university/page.js

**함께 삭제한 컴포넌트**:

- components/19-modern-university/ModernUniversity-Banner.js
- components/19-modern-university/ModernUniversity-Props.js
- components/19-modern-university/ModernUniversity.js
- components/Blogs/BlogGrid.js
- components/Header/Header-Top/HeaderTop-Four.js
- components/Header/HeaderStyle-Four.js
- components/Header/Headers/Header-Four.js
- components/Testimonials/Testimonial-Four.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/accordion.json
- data/elements/testimonial.json
- data/events.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/19-modern-university/(modern-university)/index.js' \
  'app/19-modern-university/page.js' \
  'components/19-modern-university/ModernUniversity-Banner.js' \
  'components/19-modern-university/ModernUniversity-Props.js' \
  'components/19-modern-university/ModernUniversity.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Header/Header-Top/HeaderTop-Four.js' \
  'components/Header/HeaderStyle-Four.js' \
  'components/Header/Headers/Header-Four.js' \
  'components/Testimonials/Testimonial-Four.js'
```

### /20-multilingual

**진입 파일**:

- app/20-multilingual/page.js

**함께 삭제한 컴포넌트**:

- components/20-multilingual/Multilingual-Banner.js
- components/20-multilingual/Multilingual.js
- components/Blogs/BlogGrid.js
- components/Counters/CountDownTwo.js
- components/Header/Header-Top/Header-Language.js
- components/Header/Header-Top/HeaderTop-Seven.js
- components/Header/HeaderStyle-Five.js
- components/Header/Headers/Header-Five.js
- components/Testimonials/Testimonial-Four.js

**함께 삭제한 데이터**:

- data/elements/advanceTab.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/dark-switch.js
- components/Maintenance/CountDonw.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/testimonial.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/20-multilingual/(multilingual)/index.js' \
  'app/20-multilingual/page.js' \
  'components/20-multilingual/Multilingual-Banner.js' \
  'components/20-multilingual/Multilingual.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Counters/CountDownTwo.js' \
  'components/Header/Header-Top/Header-Language.js' \
  'components/Header/Header-Top/HeaderTop-Seven.js' \
  'components/Header/HeaderStyle-Five.js' \
  'components/Header/Headers/Header-Five.js' \
  'components/Testimonials/Testimonial-Four.js' \
  'data/elements/advanceTab.json'
```

### /21-art-design-school

**진입 파일**:

- app/21-art-design-school/page.js

**함께 삭제한 컴포넌트**:

- components/21-art-design-school/ArtDesignSchool-Banner.js
- components/21-art-design-school/ArtDesignSchool.js
- components/Blogs/BlogGrid.js
- components/Cards/Card-Seven.js
- components/Header/HeaderStyle-Six.js
- components/Header/Headers/Header-Six.js
- components/Testimonials/Testimonial.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/instagram.json
- data/elements/testimonial.json
- data/events.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/21-art-design-school/(art-design-school)/index.js' \
  'app/21-art-design-school/page.js' \
  'components/21-art-design-school/ArtDesignSchool-Banner.js' \
  'components/21-art-design-school/ArtDesignSchool.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Cards/Card-Seven.js' \
  'components/Header/HeaderStyle-Six.js' \
  'components/Header/Headers/Header-Six.js' \
  'components/Testimonials/Testimonial.js'
```

### /22-wishlist

**진입 파일**:

- app/22-wishlist/page.js

**함께 삭제한 컴포넌트**:

- components/22-wishlist/Wishlist-Banner.js
- components/22-wishlist/Wishlist.js
- components/Footer/FooterFive.js
- components/Header/HeaderStyle-Six.js
- components/Header/Headers/Header-Six.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Header/DashboardNav.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/22-wishlist/(wishlist)/index.js' \
  'app/22-wishlist/page.js' \
  'components/22-wishlist/Wishlist-Banner.js' \
  'components/22-wishlist/Wishlist.js' \
  'components/Footer/FooterFive.js' \
  'components/Header/HeaderStyle-Six.js' \
  'components/Header/Headers/Header-Six.js'
```

### /23-coaching

**진입 파일**:

- app/23-coaching/page.js

**함께 삭제한 컴포넌트**:

- components/23-coaching/Coaching-Banner.js
- components/23-coaching/Coaching.js
- components/23-coaching/CoachingForm.js
- components/Blogs/BlogGrid.js
- components/Header/Header-Right/HeaderRight-Three.js
- components/Header/HeaderStyle-Thirteen.js
- components/Header/Headers/Header-Eleven.js
- components/Services/Service.js

**함께 삭제한 데이터**:

- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/testimonial.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/23-coaching/(coaching)/index.js' \
  'app/23-coaching/page.js' \
  'components/23-coaching/Coaching-Banner.js' \
  'components/23-coaching/Coaching.js' \
  'components/23-coaching/CoachingForm.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Header/Header-Right/HeaderRight-Three.js' \
  'components/Header/HeaderStyle-Thirteen.js' \
  'components/Header/Headers/Header-Eleven.js' \
  'components/Services/Service.js' \
  'data/elements/service.json'
```

### /24-health-wellness-institute

**진입 파일**:

- app/24-health-wellness-institute/page.js

**함께 삭제한 컴포넌트**:

- components/24-health-wellness-institute/Health-Banner.js
- components/24-health-wellness-institute/HealthFeature.js
- components/24-health-wellness-institute/HealthGoal.js
- components/24-health-wellness-institute/HealthInstitute.js
- components/24-health-wellness-institute/InstituteGallery.js
- components/Blogs/BlogGrid.js
- components/Counters/Counter-Six.js
- components/Header/Header-Top/HeaderTop-Four.js
- components/Header/HeaderStyle-Four.js
- components/Header/Headers/Header-Four.js

**함께 삭제한 데이터**:

- data/pages/healthInstitute.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Counters/Counter-Head.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/counter.json
- data/elements/testimonial.json
- data/events.json
- data/footer.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/24-health-wellness-institute/(health-wellness-institute)/index.js' \
  'app/24-health-wellness-institute/page.js' \
  'components/24-health-wellness-institute/Health-Banner.js' \
  'components/24-health-wellness-institute/HealthFeature.js' \
  'components/24-health-wellness-institute/HealthGoal.js' \
  'components/24-health-wellness-institute/HealthInstitute.js' \
  'components/24-health-wellness-institute/InstituteGallery.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Counters/Counter-Six.js' \
  'components/Header/Header-Top/HeaderTop-Four.js' \
  'components/Header/HeaderStyle-Four.js' \
  'components/Header/Headers/Header-Four.js' \
  'data/pages/healthInstitute.json'
```

### /25-life-coach

**진입 파일**:

- app/25-life-coach/page.js

**함께 삭제한 컴포넌트**:

- components/25-life-coach/LifeCoach-Banner.js
- components/25-life-coach/LifeCoach.js
- components/25-life-coach/LifeCoachFeature.js
- components/Blogs/BlogGrid.js
- components/Counters/CountDownTwo.js
- components/Header/Header-Right/HeaderRight-Three.js
- components/Header/HeaderStyle-Thirteen.js
- components/Header/Headers/Header-Eleven.js

**함께 삭제한 데이터**:

- data/pages/lifeCoach.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/dark-switch.js
- components/Maintenance/CountDonw.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/testimonial.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/25-life-coach/(life-coach)/index.js' \
  'app/25-life-coach/page.js' \
  'components/25-life-coach/LifeCoach-Banner.js' \
  'components/25-life-coach/LifeCoach.js' \
  'components/25-life-coach/LifeCoachFeature.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Counters/CountDownTwo.js' \
  'components/Header/Header-Right/HeaderRight-Three.js' \
  'components/Header/HeaderStyle-Thirteen.js' \
  'components/Header/Headers/Header-Eleven.js' \
  'data/pages/lifeCoach.json'
```

### /26-islamic-center

**진입 파일**:

- app/26-islamic-center/page.js

**함께 삭제한 컴포넌트**:

- components/26-islamic-center/IslamicCenter-Banner.js
- components/26-islamic-center/IslamicCenter.js
- components/Blogs/BlogGrid.js
- components/Header/Header-Right/HeaderRight-Three.js
- components/Header/HeaderStyle-Thirteen.js
- components/Header/Headers/Header-Eleven.js
- components/Testimonials/Testimonial-Four.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/DashboardNav.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/accordion.json
- data/elements/team.json
- data/elements/testimonial.json
- data/footer.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/26-islamic-center/(islamic-center)/index.js' \
  'app/26-islamic-center/page.js' \
  'components/26-islamic-center/IslamicCenter-Banner.js' \
  'components/26-islamic-center/IslamicCenter.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Header/Header-Right/HeaderRight-Three.js' \
  'components/Header/HeaderStyle-Thirteen.js' \
  'components/Header/Headers/Header-Eleven.js' \
  'components/Testimonials/Testimonial-Four.js'
```

## Phase 4 — 요소·페이지·코스·퀴즈 데모

### /all-questions

**진입 파일**:

- app/(courses)/(lessons)/all-questions/page.js

**함께 삭제한 컴포넌트**:

- components/Lesson/QuestionAll.js
- components/Lesson/Quiz/FillBlanks.js
- components/Lesson/Quiz/MutipleSelect.js
- components/Lesson/Quiz/Ordering.js
- components/Lesson/Quiz/SingleSelect.js
- components/Lesson/Quiz/Summary.js
- components/Lesson/Quiz/TrueFalse.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/course-details/courseData.json
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/all-questions/(question)/index.js' \
  'app/(courses)/(lessons)/all-questions/page.js' \
  'components/Lesson/QuestionAll.js' \
  'components/Lesson/Quiz/FillBlanks.js' \
  'components/Lesson/Quiz/MutipleSelect.js' \
  'components/Lesson/Quiz/Ordering.js' \
  'components/Lesson/Quiz/SingleSelect.js' \
  'components/Lesson/Quiz/Summary.js' \
  'components/Lesson/Quiz/TrueFalse.js'
```

### /pagination-quiz

**진입 파일**:

- app/(courses)/(lessons)/pagination-quiz/page.js

**함께 삭제한 컴포넌트**:

- components/Lesson/PaginationQuiz.js
- components/Lesson/Quiz/FillBlanks.js
- components/Lesson/Quiz/MutipleSelect.js
- components/Lesson/Quiz/Ordering.js
- components/Lesson/Quiz/SingleSelect.js
- components/Lesson/Quiz/Summary.js
- components/Lesson/Quiz/TrueFalse.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/course-details/courseData.json
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/pagination-quiz/(pagination)/index.js' \
  'app/(courses)/(lessons)/pagination-quiz/page.js' \
  'components/Lesson/PaginationQuiz.js' \
  'components/Lesson/Quiz/FillBlanks.js' \
  'components/Lesson/Quiz/MutipleSelect.js' \
  'components/Lesson/Quiz/Ordering.js' \
  'components/Lesson/Quiz/SingleSelect.js' \
  'components/Lesson/Quiz/Summary.js' \
  'components/Lesson/Quiz/TrueFalse.js'
```

### /questions-types

**진입 파일**:

- app/(courses)/(lessons)/questions-types/page.js

**함께 삭제한 컴포넌트**:

- components/Lesson/QuestionType.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/questions-types/(types)/index.js' \
  'app/(courses)/(lessons)/questions-types/page.js' \
  'components/Lesson/QuestionType.js'
```

### /quiz-with-custom-timer

**진입 파일**:

- app/(courses)/(lessons)/quiz-with-custom-timer/page.js

**함께 삭제한 컴포넌트**:

- components/Lesson/QuestionAll.js
- components/Lesson/Quiz/FillBlanks.js
- components/Lesson/Quiz/MutipleSelect.js
- components/Lesson/Quiz/Ordering.js
- components/Lesson/Quiz/SingleSelect.js
- components/Lesson/Quiz/Summary.js
- components/Lesson/Quiz/TrueFalse.js
- components/Lesson/Timer.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/course-details/courseData.json
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/quiz-with-custom-timer/(timer)/index.js' \
  'app/(courses)/(lessons)/quiz-with-custom-timer/page.js' \
  'components/Lesson/QuestionAll.js' \
  'components/Lesson/Quiz/FillBlanks.js' \
  'components/Lesson/Quiz/MutipleSelect.js' \
  'components/Lesson/Quiz/Ordering.js' \
  'components/Lesson/Quiz/SingleSelect.js' \
  'components/Lesson/Quiz/Summary.js' \
  'components/Lesson/Quiz/TrueFalse.js' \
  'components/Lesson/Timer.js'
```

### /quiz-with-point

**진입 파일**:

- app/(courses)/(lessons)/quiz-with-point/page.js

**함께 삭제한 컴포넌트**:

- components/Lesson/QuestionAll.js
- components/Lesson/Quiz/FillBlanks.js
- components/Lesson/Quiz/MutipleSelect.js
- components/Lesson/Quiz/Ordering.js
- components/Lesson/Quiz/SingleSelect.js
- components/Lesson/Quiz/Summary.js
- components/Lesson/Quiz/TrueFalse.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/course-details/courseData.json
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/quiz-with-point/(point)/index.js' \
  'app/(courses)/(lessons)/quiz-with-point/page.js' \
  'components/Lesson/QuestionAll.js' \
  'components/Lesson/Quiz/FillBlanks.js' \
  'components/Lesson/Quiz/MutipleSelect.js' \
  'components/Lesson/Quiz/Ordering.js' \
  'components/Lesson/Quiz/SingleSelect.js' \
  'components/Lesson/Quiz/Summary.js' \
  'components/Lesson/Quiz/TrueFalse.js'
```

### /single-question

**진입 파일**:

- app/(courses)/(lessons)/single-question/page.js

**함께 삭제한 컴포넌트**:

- components/Lesson/SingleQuestion.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/single-question/(single)/index.js' \
  'app/(courses)/(lessons)/single-question/page.js' \
  'components/Lesson/SingleQuestion.js'
```

### /course-card-2

**진입 파일**:

- app/(courses)/course-card-2/page.js

**함께 삭제한 컴포넌트**:

- components/Call-To-Action/CallToAction-Four.js
- components/Category/Filter/CourseCard-Two.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/calltoaction.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-card-2/index.js' \
  'app/(courses)/course-card-2/page.js' \
  'components/Call-To-Action/CallToAction-Four.js' \
  'components/Category/Filter/CourseCard-Two.js'
```

### /course-card-3

**진입 파일**:

- app/(courses)/course-card-3/page.js

**함께 삭제한 컴포넌트**:

- components/Call-To-Action/CallToAction-Four.js
- components/Category/Filter/CourseCard-Three.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/calltoaction.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-card-3/index.js' \
  'app/(courses)/course-card-3/page.js' \
  'components/Call-To-Action/CallToAction-Four.js' \
  'components/Category/Filter/CourseCard-Three.js'
```

### /course-detail-2

**진입 파일**:

- app/(courses)/course-detail-2/[courseId]/page.js
- app/(courses)/course-detail-2/page.js

**함께 삭제한 컴포넌트**:

- components/Course-Details/CourseDetails-Two.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BookmarkButton.tsx
- components/Common/CourseBadges.js
- components/Common/Separator.js
- components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Five.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Four.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Seven.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Six.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Three.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Two.js
- components/Course-Details/Course-Sections/Content.js
- components/Course-Details/Course-Sections/Course-Action-Bottom.js
- components/Course-Details/Course-Sections/Course-Menu.js
- components/Course-Details/Course-Sections/Featured.js
- components/Course-Details/Course-Sections/Instructor.js
- components/Course-Details/Course-Sections/Overview.js
- components/Course-Details/Course-Sections/RelatedCourse.js
- components/Course-Details/Course-Sections/Requirements.js
- components/Course-Details/Course-Sections/Review.js
- components/Course-Details/Course-Sections/SimilarCourses.js
- components/Course-Details/Course-Sections/Viedo.tsx
- components/Course-Details/Course-Sections/course-head.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-detail-2/[courseId]/page.js' \
  'app/(courses)/course-detail-2/index.js' \
  'app/(courses)/course-detail-2/page.js' \
  'components/Course-Details/CourseDetails-Two.js'
```

### /course-detail-3

**진입 파일**:

- app/(courses)/course-detail-3/[courseId]/page.js
- app/(courses)/course-detail-3/page.js

**함께 삭제한 컴포넌트**:

- components/Course-Details/CourseDetails-Three.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BookmarkButton.tsx
- components/Common/CourseBadges.js
- components/Common/Separator.js
- components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Five.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Four.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Seven.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Six.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Three.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Two.js
- components/Course-Details/Course-Sections/Content.js
- components/Course-Details/Course-Sections/Course-Action-Bottom.js
- components/Course-Details/Course-Sections/Course-Menu.js
- components/Course-Details/Course-Sections/Featured.js
- components/Course-Details/Course-Sections/Instructor.js
- components/Course-Details/Course-Sections/Overview.js
- components/Course-Details/Course-Sections/RelatedCourse.js
- components/Course-Details/Course-Sections/Requirements.js
- components/Course-Details/Course-Sections/Review.js
- components/Course-Details/Course-Sections/Viedo.tsx
- components/Course-Details/Course-Sections/course-head.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-detail-3/[courseId]/page.js' \
  'app/(courses)/course-detail-3/index.js' \
  'app/(courses)/course-detail-3/page.js' \
  'components/Course-Details/CourseDetails-Three.js'
```

### /course-detail-4

**진입 파일**:

- app/(courses)/course-detail-4/[courseId]/page.js
- app/(courses)/course-detail-4/page.js

**함께 삭제한 컴포넌트**:

- components/Course-Details/CourseDetails-Four.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BookmarkButton.tsx
- components/Common/CourseBadges.js
- components/Common/Separator.js
- components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Five.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Four.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Seven.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Six.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Three.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Two.js
- components/Course-Details/Course-Sections/Content.js
- components/Course-Details/Course-Sections/Course-Action-Bottom.js
- components/Course-Details/Course-Sections/Course-Menu.js
- components/Course-Details/Course-Sections/Featured.js
- components/Course-Details/Course-Sections/Instructor.js
- components/Course-Details/Course-Sections/Overview.js
- components/Course-Details/Course-Sections/RelatedCourse.js
- components/Course-Details/Course-Sections/Requirements.js
- components/Course-Details/Course-Sections/Review.js
- components/Course-Details/Course-Sections/Viedo.tsx
- components/Course-Details/Course-Sections/course-head.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-detail-4/[courseId]/page.js' \
  'app/(courses)/course-detail-4/index.js' \
  'app/(courses)/course-detail-4/page.js' \
  'components/Course-Details/CourseDetails-Four.js'
```

### /course-detail-5

**진입 파일**:

- app/(courses)/course-detail-5/[courseId]/page.js
- app/(courses)/course-detail-5/page.js

**함께 삭제한 컴포넌트**:

- components/Course-Details/CourseDetails-Five.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BookmarkButton.tsx
- components/Common/CourseBadges.js
- components/Common/Separator.js
- components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Five.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Four.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Seven.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Six.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Three.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Two.js
- components/Course-Details/Course-Sections/Content.js
- components/Course-Details/Course-Sections/Course-Action-Bottom.js
- components/Course-Details/Course-Sections/Course-Menu.js
- components/Course-Details/Course-Sections/Featured.js
- components/Course-Details/Course-Sections/Instructor.js
- components/Course-Details/Course-Sections/Overview.js
- components/Course-Details/Course-Sections/RelatedCourse.js
- components/Course-Details/Course-Sections/Requirements.js
- components/Course-Details/Course-Sections/Review.js
- components/Course-Details/Course-Sections/Viedo.tsx
- components/Course-Details/Course-Sections/course-head.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-detail-5/[courseId]/page.js' \
  'app/(courses)/course-detail-5/index.js' \
  'app/(courses)/course-detail-5/page.js' \
  'components/Course-Details/CourseDetails-Five.js'
```

### /course-detail-6

**진입 파일**:

- app/(courses)/course-detail-6/[courseId]/page.js
- app/(courses)/course-detail-6/page.js

**함께 삭제한 컴포넌트**:

- components/Course-Details/CourseDetails-Six.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BookmarkButton.tsx
- components/Common/CourseBadges.js
- components/Common/Separator.js
- components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Five.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Four.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Seven.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Six.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Three.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Two.js
- components/Course-Details/Course-Sections/Content.js
- components/Course-Details/Course-Sections/Course-Action-Bottom.js
- components/Course-Details/Course-Sections/Course-Menu.js
- components/Course-Details/Course-Sections/Featured.js
- components/Course-Details/Course-Sections/Instructor.js
- components/Course-Details/Course-Sections/Overview.js
- components/Course-Details/Course-Sections/RelatedCourse.js
- components/Course-Details/Course-Sections/Requirements.js
- components/Course-Details/Course-Sections/Review.js
- components/Course-Details/Course-Sections/Viedo.tsx
- components/Course-Details/Course-Sections/course-head.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-detail-6/[courseId]/page.js' \
  'app/(courses)/course-detail-6/index.js' \
  'app/(courses)/course-detail-6/page.js' \
  'components/Course-Details/CourseDetails-Six.js'
```

### /course-detail-7

**진입 파일**:

- app/(courses)/course-detail-7/[courseId]/page.js
- app/(courses)/course-detail-7/page.js

**함께 삭제한 컴포넌트**:

- components/Course-Details/CourseDetails-Seven.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BookmarkButton.tsx
- components/Common/CourseBadges.js
- components/Common/Separator.js
- components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Five.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Four.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Seven.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Six.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Three.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Two.js
- components/Course-Details/Course-Sections/Content.js
- components/Course-Details/Course-Sections/Course-Action-Bottom.js
- components/Course-Details/Course-Sections/Course-Menu.js
- components/Course-Details/Course-Sections/Featured.js
- components/Course-Details/Course-Sections/Instructor.js
- components/Course-Details/Course-Sections/Overview.js
- components/Course-Details/Course-Sections/RelatedCourse.js
- components/Course-Details/Course-Sections/Requirements.js
- components/Course-Details/Course-Sections/Review.js
- components/Course-Details/Course-Sections/Viedo.tsx
- components/Course-Details/Course-Sections/course-head.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-detail-7/[courseId]/page.js' \
  'app/(courses)/course-detail-7/index.js' \
  'app/(courses)/course-detail-7/page.js' \
  'components/Course-Details/CourseDetails-Seven.js'
```

### /course-detail-8

**진입 파일**:

- app/(courses)/course-detail-8/[courseId]/page.js
- app/(courses)/course-detail-8/page.js

**함께 삭제한 컴포넌트**:

- components/Course-Details/CourseDetails-Eight.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BookmarkButton.tsx
- components/Common/CourseBadges.js
- components/Common/Separator.js
- components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Five.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Four.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Seven.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Six.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Three.js
- components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-Two.js
- components/Course-Details/Course-Sections/Content.js
- components/Course-Details/Course-Sections/Course-Action-Bottom.js
- components/Course-Details/Course-Sections/Course-Menu.js
- components/Course-Details/Course-Sections/Featured.js
- components/Course-Details/Course-Sections/Instructor.js
- components/Course-Details/Course-Sections/Overview.js
- components/Course-Details/Course-Sections/RelatedCourse.js
- components/Course-Details/Course-Sections/Requirements.js
- components/Course-Details/Course-Sections/Review.js
- components/Course-Details/Course-Sections/Viedo.tsx
- components/Course-Details/Course-Sections/course-head.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-detail-8/[courseId]/page.js' \
  'app/(courses)/course-detail-8/index.js' \
  'app/(courses)/course-detail-8/page.js' \
  'components/Course-Details/CourseDetails-Eight.js'
```

### /course-filter-one-open

**진입 파일**:

- app/(courses)/course-filter-one-open/[courseId]/page.js
- app/(courses)/course-filter-one-open/page.js

**함께 삭제한 컴포넌트**: 없음

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Category/Filter/CourseFilterOneToggle.tsx
- components/Common/BookmarkButton.tsx
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-filter-one-open/[courseId]/index.js' \
  'app/(courses)/course-filter-one-open/[courseId]/page.js' \
  'app/(courses)/course-filter-one-open/index.js' \
  'app/(courses)/course-filter-one-open/page.js'
```

### /course-filter-one-toggle

**진입 파일**:

- app/(courses)/course-filter-one-toggle/[courseId]/page.js
- app/(courses)/course-filter-one-toggle/page.js

**함께 삭제한 컴포넌트**: 없음

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Category/Filter/CourseFilterOneToggle.tsx
- components/Common/BookmarkButton.tsx
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-filter-one-toggle/[courseId]/index.js' \
  'app/(courses)/course-filter-one-toggle/[courseId]/page.js' \
  'app/(courses)/course-filter-one-toggle/index.js' \
  'app/(courses)/course-filter-one-toggle/page.js'
```

### /course-filter-two-open

**진입 파일**:

- app/(courses)/course-filter-two-open/[courseId]/page.js
- app/(courses)/course-filter-two-open/page.js

**함께 삭제한 컴포넌트**:

- components/Category/CategoryHeadTwo.js
- components/Category/Filter/CourseFilterTwo.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Category/Filter/CourseFilterOneToggle.tsx
- components/Common/BookmarkButton.tsx
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-filter-two-open/[courseId]/index.js' \
  'app/(courses)/course-filter-two-open/[courseId]/page.js' \
  'app/(courses)/course-filter-two-open/index.js' \
  'app/(courses)/course-filter-two-open/page.js' \
  'components/Category/CategoryHeadTwo.js' \
  'components/Category/Filter/CourseFilterTwo.js'
```

### /course-filter-two-toggle

**진입 파일**:

- app/(courses)/course-filter-two-toggle/[courseId]/page.js
- app/(courses)/course-filter-two-toggle/page.js

**함께 삭제한 컴포넌트**:

- components/Category/CategoryHeadTwo.js
- components/Category/Filter/CourseFilterTwo.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Category/Filter/CourseFilterOneToggle.tsx
- components/Common/BookmarkButton.tsx
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-filter-two-toggle/[courseId]/index.js' \
  'app/(courses)/course-filter-two-toggle/[courseId]/page.js' \
  'app/(courses)/course-filter-two-toggle/index.js' \
  'app/(courses)/course-filter-two-toggle/page.js' \
  'components/Category/CategoryHeadTwo.js' \
  'components/Category/Filter/CourseFilterTwo.js'
```

### /course-masonry

**진입 파일**:

- app/(courses)/course-masonry/page.js

**함께 삭제한 컴포넌트**:

- components/Category/Filter/CourseCard-Two.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-masonry/index.js' \
  'app/(courses)/course-masonry/page.js' \
  'components/Category/Filter/CourseCard-Two.js'
```

### /course-with-sidebar

**진입 파일**:

- app/(courses)/course-with-sidebar/page.js

**함께 삭제한 컴포넌트**:

- components/Category/Filter/CourseSidebar.js
- components/Category/Filter/CourseTab.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-with-sidebar/index.js' \
  'app/(courses)/course-with-sidebar/page.js' \
  'components/Category/Filter/CourseSidebar.js' \
  'components/Category/Filter/CourseTab.js'
```

### /course-with-tab

**진입 파일**:

- app/(courses)/course-with-tab/page.js

**함께 삭제한 컴포넌트**:

- components/Category/Filter/CourseTab.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-with-tab/index.js' \
  'app/(courses)/course-with-tab/page.js' \
  'components/Category/Filter/CourseTab.js'
```

### /course-withtab-two

**진입 파일**:

- app/(courses)/course-withtab-two/page.js

**함께 삭제한 컴포넌트**:

- components/Category/Filter/CourseTab-Two.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/Category-Banner.js
- components/Category/CategoryHead.js
- components/Category/Filter/CourseFilter.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/course-withtab-two/index.js' \
  'app/(courses)/course-withtab-two/page.js' \
  'components/Category/Filter/CourseTab-Two.js'
```

### /about

**진입 파일**:

- app/(elements)/about/page.js

**함께 삭제한 컴포넌트**:

- components/Abouts/About-Eight.js
- components/Abouts/About-Five.js
- components/Abouts/About-Four.js
- components/Abouts/About-Saven.js
- components/Abouts/About-Six.js
- components/Abouts/About-Three.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Abouts/About-Two.js
- components/Abouts/About.js
- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/about.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/about/(about)/index.js' \
  'app/(elements)/about/page.js' \
  'components/Abouts/About-Eight.js' \
  'components/Abouts/About-Five.js' \
  'components/Abouts/About-Four.js' \
  'components/Abouts/About-Saven.js' \
  'components/Abouts/About-Six.js' \
  'components/Abouts/About-Three.js'
```

### /accordion

**진입 파일**:

- app/(elements)/accordion/page.js

**함께 삭제한 컴포넌트**:

- components/Accordions/Accordion-Four.js
- components/Accordions/Accordion-Three.js
- components/Accordions/Accordion-Two.js
- components/Accordions/Accordion.js
- components/Accordions/Course.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/accordion.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/accordion/(accordion)/index.js' \
  'app/(elements)/accordion/page.js' \
  'components/Accordions/Accordion-Four.js' \
  'components/Accordions/Accordion-Three.js' \
  'components/Accordions/Accordion-Two.js' \
  'components/Accordions/Accordion.js' \
  'components/Accordions/Course.js'
```

### /advance-tab

**진입 파일**:

- app/(elements)/advance-tab/page.js

**함께 삭제한 컴포넌트**:

- components/AdvanceTab/AdvanceTab-Five.js
- components/AdvanceTab/AdvanceTab-Four.js
- components/AdvanceTab/AdvanceTab-Three.js
- components/AdvanceTab/AdvanceTab-Two.js
- components/AdvanceTab/AdvanceTab.js
- components/AdvanceTab/SectionHead.js

**함께 삭제한 데이터**:

- data/elements/advanceTab.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/advance-tab/(advance-tab)/index.js' \
  'app/(elements)/advance-tab/page.js' \
  'components/AdvanceTab/AdvanceTab-Five.js' \
  'components/AdvanceTab/AdvanceTab-Four.js' \
  'components/AdvanceTab/AdvanceTab-Three.js' \
  'components/AdvanceTab/AdvanceTab-Two.js' \
  'components/AdvanceTab/AdvanceTab.js' \
  'components/AdvanceTab/SectionHead.js' \
  'data/elements/advanceTab.json'
```

### /badge

**진입 파일**:

- app/(elements)/badge/page.js

**함께 삭제한 컴포넌트**:

- components/Badge/Badge.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/badge/(badge)/index.js' \
  'app/(elements)/badge/page.js' \
  'components/Badge/Badge.js'
```

### /brand

**진입 파일**:

- app/(elements)/brand/page.js

**함께 삭제한 컴포넌트**:

- components/Brand/Brand-One.js
- components/Brand/Brand-Three.js
- components/Brand/Brand-Two.js

**함께 삭제한 데이터**:

- data/elements/brands.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/brand/(brand)/index.js' \
  'app/(elements)/brand/page.js' \
  'components/Brand/Brand-One.js' \
  'components/Brand/Brand-Three.js' \
  'components/Brand/Brand-Two.js' \
  'data/elements/brands.json'
```

### /button

**진입 파일**:

- app/(elements)/button/page.js

**함께 삭제한 컴포넌트**:

- components/Button/Button.js
- components/Button/ButtonProps/ColorButton.js
- components/Button/ButtonProps/HoverButton.js
- components/Button/ButtonProps/SectionHead.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/button/(button)/index.js' \
  'app/(elements)/button/page.js' \
  'components/Button/Button.js' \
  'components/Button/ButtonProps/ColorButton.js' \
  'components/Button/ButtonProps/HoverButton.js' \
  'components/Button/ButtonProps/SectionHead.js'
```

### /call-to-action

**진입 파일**:

- app/(elements)/call-to-action/page.js

**함께 삭제한 컴포넌트**:

- components/Call-To-Action/CallToAction-Five.js
- components/Call-To-Action/CallToAction-Four.js
- components/Call-To-Action/CallToAction-Head.js
- components/Call-To-Action/CallToAction-Six.js
- components/Call-To-Action/CallToAction-Three.js
- components/Call-To-Action/CallToAction-Two.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Call-To-Action/CallToAction.js
- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/calltoaction.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/call-to-action/(call-to-action)/index.js' \
  'app/(elements)/call-to-action/page.js' \
  'components/Call-To-Action/CallToAction-Five.js' \
  'components/Call-To-Action/CallToAction-Four.js' \
  'components/Call-To-Action/CallToAction-Head.js' \
  'components/Call-To-Action/CallToAction-Six.js' \
  'components/Call-To-Action/CallToAction-Three.js' \
  'components/Call-To-Action/CallToAction-Two.js'
```

### /card

**진입 파일**:

- app/(elements)/card/page.js

**함께 삭제한 컴포넌트**:

- components/Cards/Card-Five.js
- components/Cards/Card-Four.js
- components/Cards/Card-Three.js
- components/Cards/Card-Two.js

**함께 삭제한 데이터**:

- data/elements/card.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Cards/Card.js
- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/card/(card)/index.js' \
  'app/(elements)/card/page.js' \
  'components/Cards/Card-Five.js' \
  'components/Cards/Card-Four.js' \
  'components/Cards/Card-Three.js' \
  'components/Cards/Card-Two.js' \
  'data/elements/card.json'
```

### /categories

**진입 파일**:

- app/(elements)/categories/page.js

**함께 삭제한 컴포넌트**:

- components/Category/Categories.js
- components/Category/CategoryEight.js
- components/Category/CategoryFive.js
- components/Category/CategoryFour.js
- components/Category/CategoryNine.js
- components/Category/CategorySeven.js
- components/Category/CategorySix.js
- components/Category/CategoryTen.js
- components/Category/CategoryThree.js
- components/Category/CategoryThreeSlider.js
- components/Category/CategoryTwo.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Category/CategoryOne.js
- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/categories/(categories)/index.js' \
  'app/(elements)/categories/page.js' \
  'components/Category/Categories.js' \
  'components/Category/CategoryEight.js' \
  'components/Category/CategoryFive.js' \
  'components/Category/CategoryFour.js' \
  'components/Category/CategoryNine.js' \
  'components/Category/CategorySeven.js' \
  'components/Category/CategorySix.js' \
  'components/Category/CategoryTen.js' \
  'components/Category/CategoryThree.js' \
  'components/Category/CategoryThreeSlider.js' \
  'components/Category/CategoryTwo.js'
```

### /counter

**진입 파일**:

- app/(elements)/counter/page.js

**함께 삭제한 컴포넌트**:

- components/Counters/Counter-Five.js
- components/Counters/Counter-Four.js
- components/Counters/Counter-Six.js
- components/Counters/Counter-Three.js
- components/Counters/Counter-Two.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Counters/Counter-Head.js
- components/Counters/Counter.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/counter.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/counter/(counter)/index.js' \
  'app/(elements)/counter/page.js' \
  'components/Counters/Counter-Five.js' \
  'components/Counters/Counter-Four.js' \
  'components/Counters/Counter-Six.js' \
  'components/Counters/Counter-Three.js' \
  'components/Counters/Counter-Two.js'
```

### /gallery

**진입 파일**:

- app/(elements)/gallery/page.js

**함께 삭제한 컴포넌트**:

- components/Gallery/Gallery.js

**함께 삭제한 데이터**:

- data/elements/gallery.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/gallery/(gallery)/index.js' \
  'app/(elements)/gallery/page.js' \
  'components/Gallery/Gallery.js' \
  'data/elements/gallery.json'
```

### /header-style

**진입 파일**:

- app/(elements)/header-style/page.js

**함께 삭제한 컴포넌트**: 없음

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/header-style/(header-style)/index.js' \
  'app/(elements)/header-style/page.js'
```

### /instagram

**진입 파일**:

- app/(elements)/instagram/page.js

**함께 삭제한 컴포넌트**: 없음

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Instagram/Instagram.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/instagram.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/instagram/(instagram)/index.js' \
  'app/(elements)/instagram/page.js'
```

### /list-style

**진입 파일**:

- app/(elements)/list-style/page.js

**함께 삭제한 컴포넌트**:

- components/ListStyle/List-Style.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/list-style/(list-style)/index.js' \
  'app/(elements)/list-style/page.js' \
  'components/ListStyle/List-Style.js'
```

### /newsletter

**진입 파일**:

- app/(elements)/newsletter/page.js

**함께 삭제한 컴포넌트**:

- components/Newsletters/Newsletter-Four.js
- components/Newsletters/Newsletter.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Counters/CounterWrap.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Newsletters/Newsletter-Three.js
- components/Newsletters/Newsletter-Two.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/newsletter.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/newsletter/(newsletter)/index.js' \
  'app/(elements)/newsletter/page.js' \
  'components/Newsletters/Newsletter-Four.js' \
  'components/Newsletters/Newsletter.js'
```

### /pricing

**진입 파일**:

- app/(elements)/pricing/page.js

**함께 삭제한 컴포넌트**:

- components/Pricing/Plans/BasicPlan-Two.js
- components/Pricing/Plans/BasicPlan.js
- components/Pricing/Plans/ExclusivePlan-Two.js
- components/Pricing/Plans/ExclusivePlan.js
- components/Pricing/Plans/StandardPlan-Two.js
- components/Pricing/Plans/StandardPlan.js
- components/Pricing/Pricing-Five.js
- components/Pricing/Pricing-Four.js
- components/Pricing/Pricing-Three.js
- components/Pricing/Pricing-Two.js
- components/Pricing/Pricing.js

**함께 삭제한 데이터**:

- data/elements/pricing.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/pricing/(pricing)/index.js' \
  'app/(elements)/pricing/page.js' \
  'components/Pricing/Plans/BasicPlan-Two.js' \
  'components/Pricing/Plans/BasicPlan.js' \
  'components/Pricing/Plans/ExclusivePlan-Two.js' \
  'components/Pricing/Plans/ExclusivePlan.js' \
  'components/Pricing/Plans/StandardPlan-Two.js' \
  'components/Pricing/Plans/StandardPlan.js' \
  'components/Pricing/Pricing-Five.js' \
  'components/Pricing/Pricing-Four.js' \
  'components/Pricing/Pricing-Three.js' \
  'components/Pricing/Pricing-Two.js' \
  'components/Pricing/Pricing.js' \
  'data/elements/pricing.json'
```

### /progressbar

**진입 파일**:

- app/(elements)/progressbar/page.js

**함께 삭제한 컴포넌트**:

- components/Progressbars/Progressbar-Four.js
- components/Progressbars/Progressbar-Three.js
- components/Progressbars/Progressbar-Two.js
- components/Progressbars/Progressbar.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/progressbar/(progressbar)/index.js' \
  'app/(elements)/progressbar/page.js' \
  'components/Progressbars/Progressbar-Four.js' \
  'components/Progressbars/Progressbar-Three.js' \
  'components/Progressbars/Progressbar-Two.js' \
  'components/Progressbars/Progressbar.js'
```

### /search

**진입 파일**:

- app/(elements)/search/page.js

**함께 삭제한 컴포넌트**:

- components/Search/Search-Three.js
- components/Search/Search-Two.js
- components/Search/Search.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/search/(search)/index.js' \
  'app/(elements)/search/page.js' \
  'components/Search/Search-Three.js' \
  'components/Search/Search-Two.js' \
  'components/Search/Search.js'
```

### /service

**진입 파일**:

- app/(elements)/service/page.js

**함께 삭제한 컴포넌트**:

- components/Services/Service-Eight.js
- components/Services/Service-Eleven.js
- components/Services/Service-Five.js
- components/Services/Service-Four.js
- components/Services/Service-Nine.js
- components/Services/Service-Saven.js
- components/Services/Service-Six.js
- components/Services/Service-Ten.js
- components/Services/Service-Three.js
- components/Services/Service-Twelve.js
- components/Services/Service-Two.js
- components/Services/Service.js

**함께 삭제한 데이터**:

- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/service/(service)/index.js' \
  'app/(elements)/service/page.js' \
  'components/Services/Service-Eight.js' \
  'components/Services/Service-Eleven.js' \
  'components/Services/Service-Five.js' \
  'components/Services/Service-Four.js' \
  'components/Services/Service-Nine.js' \
  'components/Services/Service-Saven.js' \
  'components/Services/Service-Six.js' \
  'components/Services/Service-Ten.js' \
  'components/Services/Service-Three.js' \
  'components/Services/Service-Twelve.js' \
  'components/Services/Service-Two.js' \
  'components/Services/Service.js' \
  'data/elements/service.json'
```

### /social

**진입 파일**:

- app/(elements)/social/page.js

**함께 삭제한 컴포넌트**:

- components/Socials/Social.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/social/(social)/index.js' \
  'app/(elements)/social/page.js' \
  'components/Socials/Social.js'
```

### /split

**진입 파일**:

- app/(elements)/split/page.js

**함께 삭제한 컴포넌트**:

- components/Split/Split.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Split/Split-Two.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/split.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/split/(split)/index.js' \
  'app/(elements)/split/page.js' \
  'components/Split/Split.js'
```

### /style-guide

**진입 파일**:

- app/(elements)/style-guide/page.js

**함께 삭제한 컴포넌트**:

- components/StyleGuide/Sections/AnimatedHeading.js
- components/StyleGuide/Sections/Avatars.js
- components/StyleGuide/Sections/BorderRadius.js
- components/StyleGuide/Sections/ColorPalette.js
- components/StyleGuide/Sections/ColorPaletteDark.js
- components/StyleGuide/Sections/FormElements.js
- components/StyleGuide/Sections/Gradient.js
- components/StyleGuide/Sections/Pagination.js
- components/StyleGuide/Sections/Tooltips.js
- components/StyleGuide/Sections/Typography.js
- components/StyleGuide/StyleGuide.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/style-guide/(style-guide)/index.js' \
  'app/(elements)/style-guide/page.js' \
  'components/StyleGuide/Sections/AnimatedHeading.js' \
  'components/StyleGuide/Sections/Avatars.js' \
  'components/StyleGuide/Sections/BorderRadius.js' \
  'components/StyleGuide/Sections/ColorPalette.js' \
  'components/StyleGuide/Sections/ColorPaletteDark.js' \
  'components/StyleGuide/Sections/FormElements.js' \
  'components/StyleGuide/Sections/Gradient.js' \
  'components/StyleGuide/Sections/Pagination.js' \
  'components/StyleGuide/Sections/Tooltips.js' \
  'components/StyleGuide/Sections/Typography.js' \
  'components/StyleGuide/StyleGuide.js'
```

### /team

**진입 파일**:

- app/(elements)/team/page.js

**함께 삭제한 컴포넌트**:

- components/Team/TeamEight.js
- components/Team/TeamFive.js
- components/Team/TeamFour.js
- components/Team/TeamHead.js
- components/Team/TeamNine.js
- components/Team/TeamOne.js
- components/Team/TeamSeven.js
- components/Team/TeamSix.js
- components/Team/TeamTen.js
- components/Team/TeamThree.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Team/TeamTwo.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/team.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/team/(team)/index.js' \
  'app/(elements)/team/page.js' \
  'components/Team/TeamEight.js' \
  'components/Team/TeamFive.js' \
  'components/Team/TeamFour.js' \
  'components/Team/TeamHead.js' \
  'components/Team/TeamNine.js' \
  'components/Team/TeamOne.js' \
  'components/Team/TeamSeven.js' \
  'components/Team/TeamSix.js' \
  'components/Team/TeamTen.js' \
  'components/Team/TeamThree.js'
```

### /testimonial

**진입 파일**:

- app/(elements)/testimonial/page.js

**함께 삭제한 컴포넌트**:

- components/Call-To-Action/CallToAction-Four.js
- components/Testimonials/Testimonial-Five.js
- components/Testimonials/Testimonial-Four.js
- components/Testimonials/Testimonial-Three.js
- components/Testimonials/Testimonial-Two.js
- components/Testimonials/Testimonial.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Testimonials/Testimonial-Scroll/Scroll.js
- components/Testimonials/Testimonial-Seven.js
- components/Testimonials/Testimonial-Six.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/calltoaction.json
- data/elements/category.json
- data/elements/testimonial.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(elements)/testimonial/(testimonial)/index.js' \
  'app/(elements)/testimonial/page.js' \
  'components/Call-To-Action/CallToAction-Four.js' \
  'components/Testimonials/Testimonial-Five.js' \
  'components/Testimonials/Testimonial-Four.js' \
  'components/Testimonials/Testimonial-Three.js' \
  'components/Testimonials/Testimonial-Two.js' \
  'components/Testimonials/Testimonial.js'
```

### /about-us-02

**진입 파일**:

- app/(pages)/about-us-02/page.js

**함께 삭제한 컴포넌트**:

- components/About-Us-02/Banner.js
- components/About-Us-02/Video.js
- components/Abouts/About-Six.js
- components/Brand/Brand-Three.js
- components/Call-To-Action/CallToAction-Six.js
- components/Services/Service-Twelve.js
- components/Team/TeamTen.js

**함께 삭제한 데이터**:

- data/elements/brands.json
- data/elements/service.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/about.json
- data/elements/calltoaction.json
- data/elements/category.json
- data/elements/team.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/about-us-02/(about-us-02)/index.js' \
  'app/(pages)/about-us-02/page.js' \
  'components/About-Us-02/Banner.js' \
  'components/About-Us-02/Video.js' \
  'components/Abouts/About-Six.js' \
  'components/Brand/Brand-Three.js' \
  'components/Call-To-Action/CallToAction-Six.js' \
  'components/Services/Service-Twelve.js' \
  'components/Team/TeamTen.js' \
  'data/elements/brands.json' \
  'data/elements/service.json'
```

### /academy-gallery

**진입 파일**:

- app/(pages)/academy-gallery/page.js

**함께 삭제한 컴포넌트**:

- components/Academy-Gallery/AcademyGallery-One.js
- components/Academy-Gallery/AcademyGallery-Three.js
- components/Academy-Gallery/AcademyGallery-Two.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/academy-gallery/(academy-gallery)/index.js' \
  'app/(pages)/academy-gallery/page.js' \
  'components/Academy-Gallery/AcademyGallery-One.js' \
  'components/Academy-Gallery/AcademyGallery-Three.js' \
  'components/Academy-Gallery/AcademyGallery-Two.js'
```

### /admission-guide

**진입 파일**:

- app/(pages)/admission-guide/page.js

**함께 삭제한 컴포넌트**:

- components/Admission-Guide/AdmissionArea.js
- components/Admission-Guide/AdmissionContact.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/admission-guide/(admission-guide)/index.js' \
  'app/(pages)/admission-guide/page.js' \
  'components/Admission-Guide/AdmissionArea.js' \
  'components/Admission-Guide/AdmissionContact.js'
```

### /event-details

**진입 파일**:

- app/(pages)/event-details/[eventId]/page.js
- app/(pages)/event-details/page.js

**함께 삭제한 컴포넌트**:

- components/Call-To-Action/CallToAction-Four.js
- components/Events/Event-Section/EventContent.js
- components/Events/Event-Section/EventDescription.js
- components/Events/Event-Section/EventFaq.js
- components/Events/Event-Section/EventParticipants.js
- components/Events/Event-Section/EventViedo.js
- components/Events/Event-Section/SimilarEvent.js
- components/Events/EventBreadCrumb.js
- components/Events/EventDetails.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/calltoaction.json
- data/elements/category.json
- data/events.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/event-details/[eventId]/page.js' \
  'app/(pages)/event-details/index.js' \
  'app/(pages)/event-details/page.js' \
  'components/Call-To-Action/CallToAction-Four.js' \
  'components/Events/Event-Section/EventContent.js' \
  'components/Events/Event-Section/EventDescription.js' \
  'components/Events/Event-Section/EventFaq.js' \
  'components/Events/Event-Section/EventParticipants.js' \
  'components/Events/Event-Section/EventViedo.js' \
  'components/Events/Event-Section/SimilarEvent.js' \
  'components/Events/EventBreadCrumb.js' \
  'components/Events/EventDetails.js'
```

### /event-grid

**진입 파일**:

- app/(pages)/event-grid/page.js

**함께 삭제한 컴포넌트**:

- components/Events/EventHead.js
- components/Events/Events.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/events.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/event-grid/(event-grid)/index.js' \
  'app/(pages)/event-grid/page.js' \
  'components/Events/EventHead.js' \
  'components/Events/Events.js'
```

### /event-list

**진입 파일**:

- app/(pages)/event-list/page.js

**함께 삭제한 컴포넌트**:

- components/Events/EventHead.js
- components/Events/Events.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/events.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/event-list/(event-list)/index.js' \
  'app/(pages)/event-list/page.js' \
  'components/Events/EventHead.js' \
  'components/Events/Events.js'
```

### /event-sidebar

**진입 파일**:

- app/(pages)/event-sidebar/page.js

**함께 삭제한 컴포넌트**:

- components/Events/EventHead.js
- components/Events/EventSidebar.js
- components/Events/Events.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/events.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/event-sidebar/(event-sidebar)/index.js' \
  'app/(pages)/event-sidebar/page.js' \
  'components/Events/EventHead.js' \
  'components/Events/EventSidebar.js' \
  'components/Events/Events.js'
```

### /my-account

**진입 파일**:

- app/(pages)/my-account/page.js

**함께 삭제한 컴포넌트**:

- components/My-Account/AccountForm.js
- components/My-Account/AccountSidebar.js
- components/My-Account/MyAccount.js

**함께 삭제한 데이터**:

- data/myAccount.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/my-account/(my-account)/index.js' \
  'app/(pages)/my-account/page.js' \
  'components/My-Account/AccountForm.js' \
  'components/My-Account/AccountSidebar.js' \
  'components/My-Account/MyAccount.js' \
  'data/myAccount.json'
```

### /shop

**진입 파일**:

- app/(pages)/shop/page.js

**함께 삭제한 컴포넌트**:

- components/Shop/Shop.js
- components/Shop/ShopHead.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/shop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/shop/(shop)/index.js' \
  'app/(pages)/shop/page.js' \
  'components/Shop/Shop.js' \
  'components/Shop/ShopHead.js'
```

### /single-product

**진입 파일**:

- app/(pages)/single-product/[singleId]/page.js
- app/(pages)/single-product/page.js

**함께 삭제한 컴포넌트**:

- components/Single-Product/ProductBody.js
- components/Single-Product/RelatedProduct.js
- components/Single-Product/ReviewForm.js
- components/Single-Product/SingleProduct.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/shop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/single-product/[singleId]/page.js' \
  'app/(pages)/single-product/index.js' \
  'app/(pages)/single-product/page.js' \
  'components/Single-Product/ProductBody.js' \
  'components/Single-Product/RelatedProduct.js' \
  'components/Single-Product/ReviewForm.js' \
  'components/Single-Product/SingleProduct.js'
```

### /subscription

**진입 파일**:

- app/(pages)/subscription/page.js

**함께 삭제한 컴포넌트**:

- components/Accordions/Accordion-Three.js
- components/Pricing/Plans/BasicPlan.js
- components/Pricing/Plans/ExclusivePlan.js
- components/Pricing/Plans/StandardPlan.js
- components/Pricing/Pricing-Three.js

**함께 삭제한 데이터**:

- data/elements/pricing.json

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/BreadCrumb.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-Three.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/accordion.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/subscription/(subscription)/index.js' \
  'app/(pages)/subscription/page.js' \
  'components/Accordions/Accordion-Three.js' \
  'components/Pricing/Plans/BasicPlan.js' \
  'components/Pricing/Plans/ExclusivePlan.js' \
  'components/Pricing/Plans/StandardPlan.js' \
  'components/Pricing/Pricing-Three.js' \
  'data/elements/pricing.json'
```

## Phase 5 — lesson 데모·profile

### /lesson

**진입 파일**:

- app/(courses)/(lessons)/lesson/page.js

**함께 삭제한 컴포넌트**: 없음

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/lesson/(lesson)/index.js' \
  'app/(courses)/(lessons)/lesson/page.js'
```

### /lesson-assignments

**진입 파일**:

- app/(courses)/(lessons)/lesson-assignments/page.js

**함께 삭제한 컴포넌트**: 없음

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/lesson-assignments/(lesson-assignments)/index.js' \
  'app/(courses)/(lessons)/lesson-assignments/page.js'
```

### /lesson-assignments-submit

**진입 파일**:

- app/(courses)/(lessons)/lesson-assignments-submit/page.js

**함께 삭제한 컴포넌트**:

- components/Lesson/LessonAssignmentsSubmit.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/lesson-assignments-submit/(assignments-submit)/index.js' \
  'app/(courses)/(lessons)/lesson-assignments-submit/page.js' \
  'components/Lesson/LessonAssignmentsSubmit.js'
```

### /lesson-intro

**진입 파일**:

- app/(courses)/(lessons)/lesson-intro/page.js

**함께 삭제한 컴포넌트**: 없음

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/lesson-intro/(intro)/index.js' \
  'app/(courses)/(lessons)/lesson-intro/page.js'
```

### /lesson-quiz

**진입 파일**:

- app/(courses)/(lessons)/lesson-quiz/page.js

**함께 삭제한 컴포넌트**: 없음

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonQuiz.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/lesson-quiz/(quiz)/index.js' \
  'app/(courses)/(lessons)/lesson-quiz/page.js'
```

### /lesson-quiz-result

**진입 파일**:

- app/(courses)/(lessons)/lesson-quiz-result/page.js

**함께 삭제한 컴포넌트**:

- components/Lesson/LessonQuizResult.js
- components/Lesson/Quiz/QuizResult.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Lesson/LessonPagination.js
- components/Lesson/LessonSidebar.js
- components/Lesson/LessonTop.js
- data/lesson.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(courses)/(lessons)/lesson-quiz-result/(quiz-result)/index.js' \
  'app/(courses)/(lessons)/lesson-quiz-result/QuizResultContent.js' \
  'app/(courses)/(lessons)/lesson-quiz-result/page.js' \
  'components/Lesson/LessonQuizResult.js' \
  'components/Lesson/Quiz/QuizResult.js'
```

### /profile

**진입 파일**:

- app/(pages)/profile/[profileId]/page.js
- app/(pages)/profile/page.js

**함께 삭제한 컴포넌트**:

- components/User-Profile/User-Biography.js
- components/User-Profile/User-Courses.js
- components/User-Profile/User-Profile.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(pages)/profile/[profileId]/page.js' \
  'app/(pages)/profile/index.js' \
  'app/(pages)/profile/page.js' \
  'components/User-Profile/User-Biography.js' \
  'components/User-Profile/User-Courses.js' \
  'components/User-Profile/User-Profile.js'
```

## Phase 6 — 블로그

### /blog-details

**진입 파일**:

- app/(blogs)/blog-details/[slug]/page.js
- app/(blogs)/blog-details/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/Blog-Sections/Blog-Author.js
- components/Blogs/Blog-Sections/BlogList-Items.js
- components/Blogs/Blog-Sections/Comment.js
- components/Blogs/Blog-Sections/ComntForm.js
- components/Blogs/BlogDetails.js
- components/Common/Blog-BreadCrumb.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Instagram/Instagram.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/instagram.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/blog-details/[slug]/page.js' \
  'app/(blogs)/blog-details/index.js' \
  'app/(blogs)/blog-details/page.js' \
  'components/Blogs/Blog-Sections/Blog-Author.js' \
  'components/Blogs/Blog-Sections/BlogList-Items.js' \
  'components/Blogs/Blog-Sections/Comment.js' \
  'components/Blogs/Blog-Sections/ComntForm.js' \
  'components/Blogs/BlogDetails.js' \
  'components/Common/Blog-BreadCrumb.js'
```

### /blog-grid

**진입 파일**:

- app/(blogs)/blog-grid/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/BlogGrid.js
- components/Common/Banner.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Blogs/Blog-Sections/BlogGrid-Top.js
- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/blog-grid/(blog-grid)/index.js' \
  'app/(blogs)/blog-grid/page.js' \
  'components/Blogs/BlogGrid.js' \
  'components/Common/Banner.js'
```

### /blog-list

**진입 파일**:

- app/(blogs)/blog-list/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/Blog-Sections/BlogList-Items.js
- components/Blogs/BlogList.js
- components/Common/Banner.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/blog-list/(blog-list)/index.js' \
  'app/(blogs)/blog-list/page.js' \
  'components/Blogs/Blog-Sections/BlogList-Items.js' \
  'components/Blogs/BlogList.js' \
  'components/Common/Banner.js'
```

### /blog-minimal

**진입 파일**:

- app/(blogs)/blog-minimal/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/BlogGridMinimal.js
- components/Common/Banner.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/blog-minimal/(blog-minimal)/index.js' \
  'app/(blogs)/blog-minimal/page.js' \
  'components/Blogs/BlogGridMinimal.js' \
  'components/Common/Banner.js'
```

### /blog-with-sidebar

**진입 파일**:

- app/(blogs)/blog-with-sidebar/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/Blog-Sections/PostSidebar.js
- components/Blogs/Blog-Sections/Sidebar.js
- components/Blogs/BlogSidebar.js
- components/Common/Banner.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Pagination.js
- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/events.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/blog-with-sidebar/(blog-sidebar)/index.js' \
  'app/(blogs)/blog-with-sidebar/page.js' \
  'components/Blogs/Blog-Sections/PostSidebar.js' \
  'components/Blogs/Blog-Sections/Sidebar.js' \
  'components/Blogs/BlogSidebar.js' \
  'components/Common/Banner.js'
```

### /post-format-audio

**진입 파일**:

- app/(blogs)/post-format-audio/[slug]/page.js
- app/(blogs)/post-format-audio/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/Blog-Sections/Blog-Author.js
- components/Blogs/Blog-Sections/BlogList-Items.js
- components/Blogs/Blog-Sections/Comment.js
- components/Blogs/Blog-Sections/ComntForm.js
- components/Blogs/BlogDetails.js
- components/Common/Blog-BreadCrumb.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Instagram/Instagram.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/instagram.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/post-format-audio/[slug]/page.js' \
  'app/(blogs)/post-format-audio/index.js' \
  'app/(blogs)/post-format-audio/page.js' \
  'components/Blogs/Blog-Sections/Blog-Author.js' \
  'components/Blogs/Blog-Sections/BlogList-Items.js' \
  'components/Blogs/Blog-Sections/Comment.js' \
  'components/Blogs/Blog-Sections/ComntForm.js' \
  'components/Blogs/BlogDetails.js' \
  'components/Common/Blog-BreadCrumb.js'
```

### /post-format-gallery

**진입 파일**:

- app/(blogs)/post-format-gallery/[slug]/page.js
- app/(blogs)/post-format-gallery/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/Blog-Sections/Blog-Author.js
- components/Blogs/Blog-Sections/BlogList-Items.js
- components/Blogs/Blog-Sections/Comment.js
- components/Blogs/Blog-Sections/ComntForm.js
- components/Blogs/BlogDetails.js
- components/Common/Blog-BreadCrumb.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Instagram/Instagram.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/instagram.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/post-format-gallery/[slug]/page.js' \
  'app/(blogs)/post-format-gallery/index.js' \
  'app/(blogs)/post-format-gallery/page.js' \
  'components/Blogs/Blog-Sections/Blog-Author.js' \
  'components/Blogs/Blog-Sections/BlogList-Items.js' \
  'components/Blogs/Blog-Sections/Comment.js' \
  'components/Blogs/Blog-Sections/ComntForm.js' \
  'components/Blogs/BlogDetails.js' \
  'components/Common/Blog-BreadCrumb.js'
```

### /post-format-quote

**진입 파일**:

- app/(blogs)/post-format-quote/[slug]/page.js
- app/(blogs)/post-format-quote/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/Blog-Sections/Blog-Author.js
- components/Blogs/Blog-Sections/BlogList-Items.js
- components/Blogs/Blog-Sections/Comment.js
- components/Blogs/Blog-Sections/ComntForm.js
- components/Blogs/BlogDetails.js
- components/Common/Blog-BreadCrumb.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Instagram/Instagram.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/instagram.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/post-format-quote/[slug]/page.js' \
  'app/(blogs)/post-format-quote/index.js' \
  'app/(blogs)/post-format-quote/page.js' \
  'components/Blogs/Blog-Sections/Blog-Author.js' \
  'components/Blogs/Blog-Sections/BlogList-Items.js' \
  'components/Blogs/Blog-Sections/Comment.js' \
  'components/Blogs/Blog-Sections/ComntForm.js' \
  'components/Blogs/BlogDetails.js' \
  'components/Common/Blog-BreadCrumb.js'
```

### /post-format-standard

**진입 파일**:

- app/(blogs)/post-format-standard/[slug]/page.js
- app/(blogs)/post-format-standard/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/Blog-Sections/Blog-Author.js
- components/Blogs/Blog-Sections/BlogList-Items.js
- components/Blogs/Blog-Sections/Comment.js
- components/Blogs/Blog-Sections/ComntForm.js
- components/Blogs/BlogDetails.js
- components/Common/Blog-BreadCrumb.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Instagram/Instagram.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/instagram.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/post-format-standard/[slug]/page.js' \
  'app/(blogs)/post-format-standard/index.js' \
  'app/(blogs)/post-format-standard/page.js' \
  'components/Blogs/Blog-Sections/Blog-Author.js' \
  'components/Blogs/Blog-Sections/BlogList-Items.js' \
  'components/Blogs/Blog-Sections/Comment.js' \
  'components/Blogs/Blog-Sections/ComntForm.js' \
  'components/Blogs/BlogDetails.js' \
  'components/Common/Blog-BreadCrumb.js'
```

### /post-format-video

**진입 파일**:

- app/(blogs)/post-format-video/[slug]/page.js
- app/(blogs)/post-format-video/page.js

**함께 삭제한 컴포넌트**:

- components/Blogs/Blog-Sections/Blog-Author.js
- components/Blogs/Blog-Sections/BlogList-Items.js
- components/Blogs/Blog-Sections/Comment.js
- components/Blogs/Blog-Sections/ComntForm.js
- components/Blogs/BlogDetails.js
- components/Common/Blog-BreadCrumb.js

**함께 삭제한 데이터**: 없음

**쓰던 유지 파일(삭제 안 함)**:

- components/Common/Separator.js
- components/Footer/CopyRight.js
- components/Footer/Footer-One.js
- components/Footer/FooterProps/SingleFooter.js
- components/Header/Category/Category.js
- components/Header/Category/CategoryProps/SingleCategory.js
- components/Header/DashboardNav.js
- components/Header/Header-Right/HeaderRight-Two.js
- components/Header/Header-Top/HeaderTop-Eight.js
- components/Header/HeaderStyle-Ten.js
- components/Header/HeaderTopBar/HeaderTopBar.js
- components/Header/Headers/Header-Eight.js
- components/Header/MobileMenu.js
- components/Header/Nav.js
- components/Header/NavProps/CourseLayout.js
- components/Header/NavProps/ElementsLayout.js
- components/Header/NavProps/PageLayout.js
- components/Header/Offcanvas/Cart.js
- components/Header/Offcanvas/Search.js
- components/Header/Offcanvas/User.js
- components/Header/dark-switch.js
- components/Instagram/Instagram.js
- data/MegaMenu.json
- data/blog/blog-1.md
- data/blog/blog-10.md
- data/blog/blog-11.md
- data/blog/blog-12.md
- data/blog/blog-13.md
- data/blog/blog-14.md
- data/blog/blog-15.md
- data/blog/blog-16.md
- data/blog/blog-17.md
- data/blog/blog-2.md
- data/blog/blog-3.md
- data/blog/blog-4.md
- data/blog/blog-5.md
- data/blog/blog-6.md
- data/blog/blog-7.md
- data/blog/blog-8.md
- data/blog/blog-9.md
- data/blog/blog.json
- data/course-details/courseData.json
- data/elements/category.json
- data/elements/instagram.json
- data/footer.json
- data/headerTop.json
- data/user.json

**복구 명령**:

```bash
git checkout pre-demo-removal -- \
  'app/(blogs)/post-format-video/[slug]/page.js' \
  'app/(blogs)/post-format-video/index.js' \
  'app/(blogs)/post-format-video/page.js' \
  'components/Blogs/Blog-Sections/Blog-Author.js' \
  'components/Blogs/Blog-Sections/BlogList-Items.js' \
  'components/Blogs/Blog-Sections/Comment.js' \
  'components/Blogs/Blog-Sections/ComntForm.js' \
  'components/Blogs/BlogDetails.js' \
  'components/Common/Blog-BreadCrumb.js'
```

## 화면에 속하지 않는 삭제 파일

없음 — 삭제 집합 전부가 위 라우트 섹션의 복구 명령에 들어 있다.

## 삭제하지 않은 후보

**notDeletedCandidates**: 없음

`alreadyDead`는 태그 시점에 어느 진입점·소비자에서도 import로 닿지 않던 코드 파일이다(예: 이미 죽은 위젯). import로 안 보일 뿐 실제로 쓰일 수 있음(예: `types/*.d.ts`, `components/ui/*`) — 미사용으로 단정하지 말 것.

**alreadyDead**:

- app/(dashboard)/(student)/student-certificates/(certificates)/index.js
- app/fonts/dohyeon.ts
- app/hooks/useProgressDebounce.ts
- app/lib/actions/adminOrderActions.ts
- app/lib/actions/badgeActions.js
- app/lib/actions/courseContentActions.js
- app/lib/actions/getInstructorEnrolledStudents.ts
- app/lib/actions/topicActions.js
- app/lib/adapters/enrollmentAdapter.ts
- app/lib/auth/adminToken.js
- app/lib/auth/adminTokenProd.js
- app/lib/certificate/templates/index.js
- app/lib/course-providers/CourseProvider.ts
- app/lib/services/enrollmentService.ts
- app/lib/utils/authHelpers.ts
- app/lib/utils/lessonDataMapper.js
- app/lib/utils/permissions.ts
- app/lib/utils/settingsRoutes.ts
- app/lib/utils/testCourseDataMapper.ts
- components/Auth/RoleProtection.tsx
- components/Category/Filter/CourseFilterOneOpen.js
- components/Checkout/AddressForm.tsx
- components/Checkout/CartSummary.tsx
- components/Checkout/PayPalButton.tsx
- components/Common/Preloader.js
- components/Common/ProfileCompletionBanner.js
- components/Common/ThemePreloader.js
- components/Header/Header-Top/HeaderTop.js
- components/Instructor/Assignments.js
- components/Instructor/BadgeManagement.js
- components/Instructor/Dashboard-Section/widgets/BlogPostWidget.js
- components/Instructor/Dashboard-Section/widgets/EventWidget.js
- components/Instructor/Dashboard-Section/widgets/TeamWidget.js
- components/Instructor/Dashboard-Section/widgets/TestimonialWidget.js
- components/Instructor/Eenrolled-Course.js
- components/Instructor/EnrolledStudents.tsx
- components/Instructor/Reviews.js
- components/Lesson/Quiz/QuizHead.js
- components/Maintenance/Maintenance.js
- components/Student/Announcements.js
- components/Student/Assignments.js
- components/Student/Certificates.js
- components/Student/Eenrolled-Course.js
- components/Student/EnrolledCourses.tsx
- components/Student/EnrolledCoursesEnhanced.tsx
- components/create-course/InfoForm.js
- components/create-course/TextEditorWrapper.tsx
- components/create-course/TopicModal.js
- components/create-course/TopicModal.tsx
- components/ui/avatar.tsx
- components/ui/badge.tsx
- components/ui/button.tsx
- components/ui/card.tsx
- components/ui/chart.tsx
- components/ui/checkbox.tsx
- components/ui/dialog.tsx
- components/ui/dropdown-menu.tsx
- components/ui/form.tsx
- components/ui/input.tsx
- components/ui/label.tsx
- components/ui/progress.tsx
- components/ui/select.tsx
- components/ui/separator.tsx
- components/ui/skeleton.tsx
- components/ui/table.tsx
- components/ui/tabs.tsx
- components/ui/theme-toggle.tsx
- components/ui/toaster.tsx
- components/ui/tooltip.tsx
- context/useFetch.js
- context/utilities.js
- data/blog/blog.json
- data/dashboard/admin/sidebar.json
- data/dashboard/instructor/siderbar.json
- data/dashboard/student/siderbar.json
- data/elements/health.json
- types/enrollment.ts
- types/next-auth.d.ts
- types/paypal__checkout-server-sdk.d.ts
- types/shims.d.ts

`packagesOnlyInDeleted`는 삭제 파일만 import하던 npm 의존성이다 — 지금 제거하지 않고 후보로만 남긴다(T5 참고).

**packagesOnlyInDeleted**:

- framer-motion
- plyr
- react-circular-progressbar
- typed.js

## 기존 링크 결함

아래는 데모 삭제와 무관하게 `--links` 검사에서 이미 나와 있던 `missing`(헤더·푸터 데이터 밖) 항목이다 — 기록만 한다. 일부는 실제 라우트 링크가 아닐 수 있다(예: `revalidatePath` 인자, 옛 주소 별칭 키, Admin 앱 경로, `/404`).

- `app/(auth)/reset-password/page.tsx:135` — `/auth/forgot-password`
- `app/(pages)/checkout/success/CapturePayment.tsx:275` — `/student/dashboard`
- `app/(pages)/checkout/success/page.tsx:183` — `/student/dashboard?ref=order-${orderDetails.orderId}`
- `app/(pages)/checkout/success/page.tsx:184` — `/courses`
- `app/auth/sso/start/page.js:94` — `/admin-dashboard`
- `app/lib/actions/announcementActions.js:82` — `/instructor/announcements`
- `app/lib/actions/announcementActions.js:83` — `/student/announcements`
- `app/lib/actions/announcementActions.js:154` — `/instructor/announcements`
- `app/lib/actions/announcementActions.js:155` — `/student/announcements`
- `app/lib/actions/announcementActions.js:218` — `/instructor/announcements`
- `app/lib/actions/announcementActions.js:219` — `/student/announcements`
- `app/lib/actions/courseActions.ts:307` — `/courses`
- `app/lib/actions/courseActions.ts:662` — `/courses/${courseId}`
- `app/lib/actions/courseActions.ts:751` — `/courses/${courseId}`
- `app/lib/actions/courseActions.ts:805` — `/courses/${lesson.course_id}`
- `app/lib/actions/courseActions.ts:870` — `/courses/${courseId}`
- `app/lib/actions/courseActions.ts:872` — `/courses`
- `app/lib/actions/courseActions.ts:1566` — `/courses`
- `app/lib/actions/progressActions.ts:55` — `/course/${courseId}`
- `app/lib/auth/sso-issue.js:83` — `/admin-dashboard`
- `app/lib/constants/routes.ts:16` — `/auth/login`
- `app/lib/constants/routes.ts:17` — `/auth/register`
- `app/lib/constants/routes.ts:18` — `/auth/forgot-password`
- `app/lib/constants/routes.ts:19` — `/auth/reset-password`
- `app/lib/constants/routes.ts:39` — `/instructor/courses/${id}/edit`
- `app/lib/constants/routes.ts:41` — `/instructor/courses/${courseId}/edit/assignment/${assignmentId}`
- `app/lib/constants/routes.ts:43` — `/instructor-analytics`
- `app/lib/constants/routes.ts:52` — `/course-preview/${id}`
- `app/lib/constants/routes.ts:57` — `/lesson/${id}/quiz`
- `app/lib/constants/routes.ts:74` — `/instructor/courses`
- `app/lib/constants/routes.ts:75` — `/instructor-my-courses`
- `app/lib/constants/routes.ts:78` — `/enrolled-courses`
- `app/lib/constants/routes.ts:79` — `/my-courses`
- `app/lib/constants/routes.ts:80` — `/browse-courses`
- `app/lib/utils/roleRoutes.ts:165` — `/student-announcements`
- `app/lib/utils/roleRoutes.ts:172` — `/student-assignments`
- `components/01-Main-Demo/01-Main-Demo.js:188` — `/blog`
- `components/Cart/CartPage.tsx:72` — `/course-filter`
- `components/Category/CategoryHead.js:127` — `/course-with-tab-two`
- `components/Category/CategoryHead.js:177` — `/course-with-tab-two`
- `components/Header/DashboardNav.js:21` — `/admin`
- `components/Header/DashboardNav.js:33` — `/admin`
- `components/Lesson/LessonSidebar.js:83` — `/quiz-passing-grade`
- `data/user.json:35` — `/instructor-my-quiz-attempts`

## 삭제한 파일 전체 목록

```text
app/(blogs)/blog-details/[slug]/page.js
app/(blogs)/blog-details/index.js
app/(blogs)/blog-details/page.js
app/(blogs)/blog-grid/(blog-grid)/index.js
app/(blogs)/blog-grid/page.js
app/(blogs)/blog-list/(blog-list)/index.js
app/(blogs)/blog-list/page.js
app/(blogs)/blog-minimal/(blog-minimal)/index.js
app/(blogs)/blog-minimal/page.js
app/(blogs)/blog-with-sidebar/(blog-sidebar)/index.js
app/(blogs)/blog-with-sidebar/page.js
app/(blogs)/post-format-audio/[slug]/page.js
app/(blogs)/post-format-audio/index.js
app/(blogs)/post-format-audio/page.js
app/(blogs)/post-format-gallery/[slug]/page.js
app/(blogs)/post-format-gallery/index.js
app/(blogs)/post-format-gallery/page.js
app/(blogs)/post-format-quote/[slug]/page.js
app/(blogs)/post-format-quote/index.js
app/(blogs)/post-format-quote/page.js
app/(blogs)/post-format-standard/[slug]/page.js
app/(blogs)/post-format-standard/index.js
app/(blogs)/post-format-standard/page.js
app/(blogs)/post-format-video/[slug]/page.js
app/(blogs)/post-format-video/index.js
app/(blogs)/post-format-video/page.js
app/(courses)/(lessons)/all-questions/(question)/index.js
app/(courses)/(lessons)/all-questions/page.js
app/(courses)/(lessons)/lesson-assignments-submit/(assignments-submit)/index.js
app/(courses)/(lessons)/lesson-assignments-submit/page.js
app/(courses)/(lessons)/lesson-assignments/(lesson-assignments)/index.js
app/(courses)/(lessons)/lesson-assignments/page.js
app/(courses)/(lessons)/lesson-intro/(intro)/index.js
app/(courses)/(lessons)/lesson-intro/page.js
app/(courses)/(lessons)/lesson-quiz-result/(quiz-result)/index.js
app/(courses)/(lessons)/lesson-quiz-result/QuizResultContent.js
app/(courses)/(lessons)/lesson-quiz-result/page.js
app/(courses)/(lessons)/lesson-quiz/(quiz)/index.js
app/(courses)/(lessons)/lesson-quiz/page.js
app/(courses)/(lessons)/lesson/(lesson)/index.js
app/(courses)/(lessons)/lesson/page.js
app/(courses)/(lessons)/pagination-quiz/(pagination)/index.js
app/(courses)/(lessons)/pagination-quiz/page.js
app/(courses)/(lessons)/questions-types/(types)/index.js
app/(courses)/(lessons)/questions-types/page.js
app/(courses)/(lessons)/quiz-with-custom-timer/(timer)/index.js
app/(courses)/(lessons)/quiz-with-custom-timer/page.js
app/(courses)/(lessons)/quiz-with-point/(point)/index.js
app/(courses)/(lessons)/quiz-with-point/page.js
app/(courses)/(lessons)/single-question/(single)/index.js
app/(courses)/(lessons)/single-question/page.js
app/(courses)/course-card-2/index.js
app/(courses)/course-card-2/page.js
app/(courses)/course-card-3/index.js
app/(courses)/course-card-3/page.js
app/(courses)/course-detail-2/[courseId]/page.js
app/(courses)/course-detail-2/index.js
app/(courses)/course-detail-2/page.js
app/(courses)/course-detail-3/[courseId]/page.js
app/(courses)/course-detail-3/index.js
app/(courses)/course-detail-3/page.js
app/(courses)/course-detail-4/[courseId]/page.js
app/(courses)/course-detail-4/index.js
app/(courses)/course-detail-4/page.js
app/(courses)/course-detail-5/[courseId]/page.js
app/(courses)/course-detail-5/index.js
app/(courses)/course-detail-5/page.js
app/(courses)/course-detail-6/[courseId]/page.js
app/(courses)/course-detail-6/index.js
app/(courses)/course-detail-6/page.js
app/(courses)/course-detail-7/[courseId]/page.js
app/(courses)/course-detail-7/index.js
app/(courses)/course-detail-7/page.js
app/(courses)/course-detail-8/[courseId]/page.js
app/(courses)/course-detail-8/index.js
app/(courses)/course-detail-8/page.js
app/(courses)/course-filter-one-open/[courseId]/index.js
app/(courses)/course-filter-one-open/[courseId]/page.js
app/(courses)/course-filter-one-open/index.js
app/(courses)/course-filter-one-open/page.js
app/(courses)/course-filter-one-toggle/[courseId]/index.js
app/(courses)/course-filter-one-toggle/[courseId]/page.js
app/(courses)/course-filter-one-toggle/index.js
app/(courses)/course-filter-one-toggle/page.js
app/(courses)/course-filter-two-open/[courseId]/index.js
app/(courses)/course-filter-two-open/[courseId]/page.js
app/(courses)/course-filter-two-open/index.js
app/(courses)/course-filter-two-open/page.js
app/(courses)/course-filter-two-toggle/[courseId]/index.js
app/(courses)/course-filter-two-toggle/[courseId]/page.js
app/(courses)/course-filter-two-toggle/index.js
app/(courses)/course-filter-two-toggle/page.js
app/(courses)/course-masonry/index.js
app/(courses)/course-masonry/page.js
app/(courses)/course-with-sidebar/index.js
app/(courses)/course-with-sidebar/page.js
app/(courses)/course-with-tab/index.js
app/(courses)/course-with-tab/page.js
app/(courses)/course-withtab-two/index.js
app/(courses)/course-withtab-two/page.js
app/(elements)/about/(about)/index.js
app/(elements)/about/page.js
app/(elements)/accordion/(accordion)/index.js
app/(elements)/accordion/page.js
app/(elements)/advance-tab/(advance-tab)/index.js
app/(elements)/advance-tab/page.js
app/(elements)/badge/(badge)/index.js
app/(elements)/badge/page.js
app/(elements)/brand/(brand)/index.js
app/(elements)/brand/page.js
app/(elements)/button/(button)/index.js
app/(elements)/button/page.js
app/(elements)/call-to-action/(call-to-action)/index.js
app/(elements)/call-to-action/page.js
app/(elements)/card/(card)/index.js
app/(elements)/card/page.js
app/(elements)/categories/(categories)/index.js
app/(elements)/categories/page.js
app/(elements)/counter/(counter)/index.js
app/(elements)/counter/page.js
app/(elements)/gallery/(gallery)/index.js
app/(elements)/gallery/page.js
app/(elements)/header-style/(header-style)/index.js
app/(elements)/header-style/page.js
app/(elements)/instagram/(instagram)/index.js
app/(elements)/instagram/page.js
app/(elements)/list-style/(list-style)/index.js
app/(elements)/list-style/page.js
app/(elements)/newsletter/(newsletter)/index.js
app/(elements)/newsletter/page.js
app/(elements)/pricing/(pricing)/index.js
app/(elements)/pricing/page.js
app/(elements)/progressbar/(progressbar)/index.js
app/(elements)/progressbar/page.js
app/(elements)/search/(search)/index.js
app/(elements)/search/page.js
app/(elements)/service/(service)/index.js
app/(elements)/service/page.js
app/(elements)/social/(social)/index.js
app/(elements)/social/page.js
app/(elements)/split/(split)/index.js
app/(elements)/split/page.js
app/(elements)/style-guide/(style-guide)/index.js
app/(elements)/style-guide/page.js
app/(elements)/team/(team)/index.js
app/(elements)/team/page.js
app/(elements)/testimonial/(testimonial)/index.js
app/(elements)/testimonial/page.js
app/(pages)/about-us-02/(about-us-02)/index.js
app/(pages)/about-us-02/page.js
app/(pages)/academy-gallery/(academy-gallery)/index.js
app/(pages)/academy-gallery/page.js
app/(pages)/admission-guide/(admission-guide)/index.js
app/(pages)/admission-guide/page.js
app/(pages)/event-details/[eventId]/page.js
app/(pages)/event-details/index.js
app/(pages)/event-details/page.js
app/(pages)/event-grid/(event-grid)/index.js
app/(pages)/event-grid/page.js
app/(pages)/event-list/(event-list)/index.js
app/(pages)/event-list/page.js
app/(pages)/event-sidebar/(event-sidebar)/index.js
app/(pages)/event-sidebar/page.js
app/(pages)/my-account/(my-account)/index.js
app/(pages)/my-account/page.js
app/(pages)/profile/[profileId]/page.js
app/(pages)/profile/index.js
app/(pages)/profile/page.js
app/(pages)/shop/(shop)/index.js
app/(pages)/shop/page.js
app/(pages)/single-product/[singleId]/page.js
app/(pages)/single-product/index.js
app/(pages)/single-product/page.js
app/(pages)/subscription/(subscription)/index.js
app/(pages)/subscription/page.js
app/02-course-school/(course-school)/index.js
app/02-course-school/page.js
app/03-online-school/(online-school)/index.js
app/03-online-school/page.js
app/04-kindergarten/(kindergarten)/index.js
app/04-kindergarten/page.js
app/05-classic-lms/(classic-lms)/index.js
app/05-classic-lms/page.js
app/06-university-status/(university-status)/index.js
app/06-university-status/page.js
app/07-instructor-portfolio/(instructor-portfolio)/index.js
app/07-instructor-portfolio/page.js
app/08-language-academy/(language-academy)/index.js
app/08-language-academy/page.js
app/10-online-course/(online-course)/index.js
app/10-online-course/page.js
app/11-single-course/(single-course)/index.js
app/11-single-course/page.js
app/12-marketplace/(marketplace)/index.js
app/12-marketplace/page.js
app/13-university-classic/(university-classic)/index.js
app/13-university-classic/page.js
app/14-home-elegant/(home-elegant)/index.js
app/14-home-elegant/page.js
app/15-home-technology/(home-technology)/index.js
app/15-home-technology/page.js
app/16-udemy-affiliate/(udemy-affiliate)/index.js
app/16-udemy-affiliate/page.js
app/17-online-academy/(online-academy)/index.js
app/17-online-academy/page.js
app/18-instructors-coaches/(instructors-coaches)/index.js
app/18-instructors-coaches/page.js
app/19-modern-university/(modern-university)/index.js
app/19-modern-university/page.js
app/20-multilingual/(multilingual)/index.js
app/20-multilingual/page.js
app/21-art-design-school/(art-design-school)/index.js
app/21-art-design-school/page.js
app/22-wishlist/(wishlist)/index.js
app/22-wishlist/page.js
app/23-coaching/(coaching)/index.js
app/23-coaching/page.js
app/24-health-wellness-institute/(health-wellness-institute)/index.js
app/24-health-wellness-institute/page.js
app/25-life-coach/(life-coach)/index.js
app/25-life-coach/page.js
app/26-islamic-center/(islamic-center)/index.js
app/26-islamic-center/page.js
components/02-course-school/CourseSchool.js
components/03-online-school/OnlineSchool.js
components/03-online-school/OnlineSchoolForm.js
components/04-kindergarten/04-kindergarten.js
components/05-classic-lms/05-ClassicLms.js
components/06-university-status/UniversityStatus.js
components/07-instructor-portfolio/InstructorForm.js
components/07-instructor-portfolio/InstructorPortfolio.js
components/08-language-academy/LanguageAcademy.js
components/10-online-course/OnlineCourse.js
components/10-online-course/OnlineCourseBanner.js
components/11-single-course/CourseLessonProp.js
components/11-single-course/CourseSlider.js
components/11-single-course/SingleCourse.js
components/11-single-course/SingleCourseBanner.js
components/11-single-course/SingleCourseProp.js
components/12-Marketplace/12-Marketplace.js
components/13-university-classic/13-University-Classic.js
components/13-university-classic/UniversityBanner.js
components/14-home-elegant/14-Home-Elegant.js
components/14-home-elegant/CrashCourse.js
components/14-home-elegant/HomeElegantBanner.js
components/15-home-technology/HomeTechnology.js
components/15-home-technology/HomeTechnologyBanner.js
components/16-udemy-affiliate/UdemyAffiliate-Banner.js
components/16-udemy-affiliate/UdemyAffiliate.js
components/17-online-academy/OnlineAcademy-Banner.js
components/17-online-academy/OnlineAcademy.js
components/18-instructors-coaches/InstructorsCoaches-Banner.js
components/18-instructors-coaches/InstructorsCoaches.js
components/19-modern-university/ModernUniversity-Banner.js
components/19-modern-university/ModernUniversity-Props.js
components/19-modern-university/ModernUniversity.js
components/20-multilingual/Multilingual-Banner.js
components/20-multilingual/Multilingual.js
components/21-art-design-school/ArtDesignSchool-Banner.js
components/21-art-design-school/ArtDesignSchool.js
components/22-wishlist/Wishlist-Banner.js
components/22-wishlist/Wishlist.js
components/23-coaching/Coaching-Banner.js
components/23-coaching/Coaching.js
components/23-coaching/CoachingForm.js
components/24-health-wellness-institute/Health-Banner.js
components/24-health-wellness-institute/HealthFeature.js
components/24-health-wellness-institute/HealthGoal.js
components/24-health-wellness-institute/HealthInstitute.js
components/24-health-wellness-institute/InstituteGallery.js
components/25-life-coach/LifeCoach-Banner.js
components/25-life-coach/LifeCoach.js
components/25-life-coach/LifeCoachFeature.js
components/26-islamic-center/IslamicCenter-Banner.js
components/26-islamic-center/IslamicCenter.js
components/About-Us-02/Banner.js
components/About-Us-02/Video.js
components/Abouts/About-Eight.js
components/Abouts/About-Five.js
components/Abouts/About-Four.js
components/Abouts/About-Saven.js
components/Abouts/About-Six.js
components/Abouts/About-Three.js
components/Academy-Gallery/AcademyGallery-One.js
components/Academy-Gallery/AcademyGallery-Three.js
components/Academy-Gallery/AcademyGallery-Two.js
components/Accordions/Accordion-Four.js
components/Accordions/Accordion-Three.js
components/Accordions/Accordion-Two.js
components/Accordions/Accordion.js
components/Accordions/Course.js
components/Admission-Guide/AdmissionArea.js
components/Admission-Guide/AdmissionContact.js
components/AdvanceTab/AdvanceTab-Five.js
components/AdvanceTab/AdvanceTab-Four.js
components/AdvanceTab/AdvanceTab-Three.js
components/AdvanceTab/AdvanceTab-Two.js
components/AdvanceTab/AdvanceTab.js
components/AdvanceTab/SectionHead.js
components/Badge/Badge.js
components/Blogs/Blog-Sections/Blog-Author.js
components/Blogs/Blog-Sections/BlogList-Items.js
components/Blogs/Blog-Sections/Comment.js
components/Blogs/Blog-Sections/ComntForm.js
components/Blogs/Blog-Sections/PostSidebar.js
components/Blogs/Blog-Sections/Sidebar.js
components/Blogs/BlogDetails.js
components/Blogs/BlogGrid.js
components/Blogs/BlogGridMinimal.js
components/Blogs/BlogList.js
components/Blogs/BlogSidebar.js
components/Brand/Brand-One.js
components/Brand/Brand-Three.js
components/Brand/Brand-Two.js
components/Button/Button.js
components/Button/ButtonProps/ColorButton.js
components/Button/ButtonProps/HoverButton.js
components/Button/ButtonProps/SectionHead.js
components/Call-To-Action/CallToAction-Five.js
components/Call-To-Action/CallToAction-Four.js
components/Call-To-Action/CallToAction-Head.js
components/Call-To-Action/CallToAction-Six.js
components/Call-To-Action/CallToAction-Three.js
components/Call-To-Action/CallToAction-Two.js
components/Cards/Card-Five.js
components/Cards/Card-Four.js
components/Cards/Card-Seven.js
components/Cards/Card-Six.js
components/Cards/Card-Three.js
components/Cards/Card-Two.js
components/Category/Categories.js
components/Category/CategoryEight.js
components/Category/CategoryFive.js
components/Category/CategoryFour.js
components/Category/CategoryHeadTwo.js
components/Category/CategoryNine.js
components/Category/CategorySeven.js
components/Category/CategorySix.js
components/Category/CategoryTen.js
components/Category/CategoryThree.js
components/Category/CategoryThreeSlider.js
components/Category/CategoryTwo.js
components/Category/Filter/Course-Six.js
components/Category/Filter/CourseCard-Three.js
components/Category/Filter/CourseCard-Two.js
components/Category/Filter/CourseFilterTwo.js
components/Category/Filter/CourseSidebar.js
components/Category/Filter/CourseTab-Two.js
components/Category/Filter/CourseTab.js
components/Common/Banner.js
components/Common/Blog-BreadCrumb.js
components/Common/CourseTag-Two.js
components/Counters/CountDownTwo.js
components/Counters/Counter-Five.js
components/Counters/Counter-Four.js
components/Counters/Counter-Six.js
components/Counters/Counter-Three.js
components/Counters/Counter-Two.js
components/Course-Details/CourseDetails-Eight.js
components/Course-Details/CourseDetails-Five.js
components/Course-Details/CourseDetails-Four.js
components/Course-Details/CourseDetails-Seven.js
components/Course-Details/CourseDetails-Six.js
components/Course-Details/CourseDetails-Three.js
components/Course-Details/CourseDetails-Two.js
components/Events/Event-Section/EventContent.js
components/Events/Event-Section/EventDescription.js
components/Events/Event-Section/EventFaq.js
components/Events/Event-Section/EventParticipants.js
components/Events/Event-Section/EventViedo.js
components/Events/Event-Section/SimilarEvent.js
components/Events/EventBreadCrumb.js
components/Events/EventDetails.js
components/Events/EventHead.js
components/Events/EventSidebar.js
components/Events/Events.js
components/Footer/FooterFive.js
components/Footer/FooterFour.js
components/Gallery/Gallery.js
components/Header/Category/SearchWithCategory.js
components/Header/Header-Right/HeaderRight-Three.js
components/Header/Header-Top/Header-Language.js
components/Header/Header-Top/HeaderMid-One.js
components/Header/Header-Top/HeaderTop-Four.js
components/Header/Header-Top/HeaderTop-Seven.js
components/Header/Header-Top/HeaderTop-Two.js
components/Header/Header-Top/HeaderTopMid-Three.js
components/Header/HeaderStyle-Eight.js
components/Header/HeaderStyle-Eleven.js
components/Header/HeaderStyle-Five.js
components/Header/HeaderStyle-Four.js
components/Header/HeaderStyle-Nine.js
components/Header/HeaderStyle-Seven.js
components/Header/HeaderStyle-Six.js
components/Header/HeaderStyle-Thirteen.js
components/Header/HeaderStyle-Three.js
components/Header/HeaderStyle-Twelve.js
components/Header/Headers/Header-Eleven.js
components/Header/Headers/Header-Five.js
components/Header/Headers/Header-Four.js
components/Header/Headers/Header-Nine.js
components/Header/Headers/Header-Seven.js
components/Header/Headers/Header-Six.js
components/Header/Headers/Header-Ten.js
components/Header/Headers/Header-Two.js
components/Header/SideNav.js
components/Header/package/HeaderType-Container-Four.js
components/Lesson/LessonAssignmentsSubmit.js
components/Lesson/LessonQuizResult.js
components/Lesson/PaginationQuiz.js
components/Lesson/QuestionAll.js
components/Lesson/QuestionType.js
components/Lesson/Quiz/FillBlanks.js
components/Lesson/Quiz/MutipleSelect.js
components/Lesson/Quiz/Ordering.js
components/Lesson/Quiz/QuizResult.js
components/Lesson/Quiz/SingleSelect.js
components/Lesson/Quiz/Summary.js
components/Lesson/Quiz/TrueFalse.js
components/Lesson/SingleQuestion.js
components/Lesson/Timer.js
components/ListStyle/List-Style.js
components/My-Account/AccountForm.js
components/My-Account/AccountSidebar.js
components/My-Account/MyAccount.js
components/Newsletters/Newsletter-Four.js
components/Newsletters/Newsletter.js
components/Pricing/Plans/BasicPlan-Two.js
components/Pricing/Plans/BasicPlan.js
components/Pricing/Plans/ExclusivePlan-Two.js
components/Pricing/Plans/ExclusivePlan.js
components/Pricing/Plans/StandardPlan-Two.js
components/Pricing/Plans/StandardPlan.js
components/Pricing/Pricing-Five.js
components/Pricing/Pricing-Four.js
components/Pricing/Pricing-Three.js
components/Pricing/Pricing-Two.js
components/Pricing/Pricing.js
components/Progressbars/Progressbar-Four.js
components/Progressbars/Progressbar-Three.js
components/Progressbars/Progressbar-Two.js
components/Progressbars/Progressbar.js
components/Search/Search-Three.js
components/Search/Search-Two.js
components/Search/Search.js
components/Services/Service-Eight.js
components/Services/Service-Eleven.js
components/Services/Service-Five.js
components/Services/Service-Four.js
components/Services/Service-Nine.js
components/Services/Service-Saven.js
components/Services/Service-Six.js
components/Services/Service-Ten.js
components/Services/Service-Three.js
components/Services/Service-Twelve.js
components/Services/Service-Two.js
components/Services/Service.js
components/Shop/Shop.js
components/Shop/ShopHead.js
components/Single-Product/ProductBody.js
components/Single-Product/RelatedProduct.js
components/Single-Product/ReviewForm.js
components/Single-Product/SingleProduct.js
components/Socials/Social.js
components/Split/Split.js
components/StyleGuide/Sections/AnimatedHeading.js
components/StyleGuide/Sections/Avatars.js
components/StyleGuide/Sections/BorderRadius.js
components/StyleGuide/Sections/ColorPalette.js
components/StyleGuide/Sections/ColorPaletteDark.js
components/StyleGuide/Sections/FormElements.js
components/StyleGuide/Sections/Gradient.js
components/StyleGuide/Sections/Pagination.js
components/StyleGuide/Sections/Tooltips.js
components/StyleGuide/Sections/Typography.js
components/StyleGuide/StyleGuide.js
components/Team/TeamEight.js
components/Team/TeamFive.js
components/Team/TeamFour.js
components/Team/TeamHead.js
components/Team/TeamNine.js
components/Team/TeamOne.js
components/Team/TeamSeven.js
components/Team/TeamSix.js
components/Team/TeamTen.js
components/Team/TeamThree.js
components/Testimonials/Testimonial-Five.js
components/Testimonials/Testimonial-Four.js
components/Testimonials/Testimonial-Three.js
components/Testimonials/Testimonial-Two.js
components/Testimonials/Testimonial.js
components/User-Profile/User-Biography.js
components/User-Profile/User-Courses.js
components/User-Profile/User-Profile.js
data/elements/advanceTab.json
data/elements/brands.json
data/elements/card.json
data/elements/gallery.json
data/elements/pricing.json
data/elements/service.json
data/myAccount.json
data/pages/11-singleCourse.json
data/pages/healthInstitute.json
data/pages/lifeCoach.json
```
