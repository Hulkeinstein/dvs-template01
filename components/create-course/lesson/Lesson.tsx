'use client';

import React, { useEffect, useState } from 'react';

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import SingleLesson from './SingleLesson';
import { contentHelpers } from '@/app/lib/utils/contentHelpers';
import { logger } from '@/app/lib/utils/logger';
import LessonModal from '../QuizModals/LessonModal';
import QuizModal from '../QuizModals/QuizModal';
import AssignmentModal from '../QuizModals/AssignmentModal';
import UpdateModal from '../QuizModals/UpdateModal';

import type {
  LessonComponentProps,
  LessonData,
  VideoLesson,
  QuizLesson,
  AssignmentLesson,
} from '@/types/create-course';

// ContentItem type from contentHelpers - union of lesson types with optional fields
type ContentItem = (VideoLesson | QuizLesson | AssignmentLesson) & {
  type?: string;
  order?: number;
  sort_order?: number;
};

const Lesson: React.FC<LessonComponentProps> = ({
  handleFileChange,
  handleImportClick,
  fileInputRef,
  target,
  expanded,
  text,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  start: _start,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  end: _end,
  id,
  topicId,
  topicData,
  onDeleteTopic,
  onUpdateTopic,
  onAddLesson,
  onAddQuiz,
  onUpdateQuiz,
  onAddAssignment,
  onDeleteContent,
  onEditLesson,
  onUploadLesson,
}) => {
  const [courseList, setCourseList] = useState<ContentItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toggle, setToggle] = useState(expanded || false);
  const [editingLesson, setEditingLesson] = useState<VideoLesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<QuizLesson | null>(null);
  const [editingAssignment, setEditingAssignment] =
    useState<AssignmentLesson | null>(null);

  // Update courseList when topicData changes - combine lessons and quizzes
  useEffect(() => {
    // Use contentHelpers to combine all content types
    const combinedContents = contentHelpers.combineContents(
      topicData || {}
    ) as ContentItem[];

    logger.log();

    setCourseList(combinedContents);
  }, [topicData, id, topicId]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCourseList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  if (!hydrated) {
    return null;
  }

  return (
    <>
      <div className="accordion-item card mb--20">
        <h2
          className="accordion-header card-header rbt-course"
          id={id}
          onClick={() => setToggle(!toggle)}
        >
          <button
            className={`accordion-button ${!toggle ? 'collapsed' : ''}`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#${target}`}
            aria-expanded={toggle}
            aria-controls={target}
          >
            {text}
          </button>
          <span
            className="rbt-course-icon rbt-course-edit"
            data-bs-toggle="modal"
            data-bs-target={`#UpdateTopic${id}`}
          ></span>
          <span
            className="rbt-course-icon rbt-course-del"
            onClick={onDeleteTopic}
            style={{ cursor: 'pointer' }}
          ></span>
        </h2>
        <div
          id={target}
          className={`accordion-collapse collapse ${toggle ? 'show' : ''}`}
          aria-labelledby={id}
          data-bs-parent="#tutionaccordionExamplea12"
        >
          <div className="accordion-body card-body">
            {topicData?.summary && (
              <div className="mb-3">
                <p className="text-muted">{topicData.summary}</p>
                <hr />
              </div>
            )}

            {courseList.length === 0 ? (
              <div className="text-center py-3 mb-3">
                <p className="text-muted">
                  <i className="feather-info"></i> No lessons added yet. Click
                  the &quot;Lesson&quot; button below to add your first lesson.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={courseList}
                  strategy={verticalListSortingStrategy}
                >
                  {courseList.map((course) => (
                    <SingleLesson
                      key={course.id}
                      course={
                        course as Parameters<typeof SingleLesson>[0]['course']
                      }
                      topicId={id}
                      onDelete={(lessonId: string | number) => {
                        if (onDeleteContent) {
                          // course 객체 전체를 전달
                          const contentToDelete = courseList.find(
                            (c) => c.id === lessonId
                          );
                          if (contentToDelete) {
                            onDeleteContent(topicData.id, lessonId);
                          }
                        }
                      }}
                      onEdit={(lesson: ContentItem) => {
                        logger.log();

                        const contentType = lesson.content_type;

                        if (contentType === 'quiz') {
                          setEditingQuiz(lesson as QuizLesson);
                        } else if (contentType === 'assignment') {
                          setEditingAssignment(lesson as AssignmentLesson);
                        } else {
                          setEditingLesson(lesson as VideoLesson);
                          if (onEditLesson) {
                            onEditLesson(id, lesson as LessonData);
                          }
                        }
                      }}
                      onUpload={(lessonId: string | number) => {
                        if (onUploadLesson) {
                          onUploadLesson(id, lessonId);
                        } else {
                          // console.log('레슨 업로드:', lessonId);
                          // 업로드 기능 구현
                        }
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div className="gap-3 d-flex flex-wrap">
                <button
                  className="rbt-btn btn-border hover-icon-reverse rbt-sm-btn"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target={`#LessonModal${id}`}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Lesson</span>
                    <span className="btn-icon">
                      <i className="feather-plus-square"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-plus-square"></i>
                    </span>
                  </span>
                </button>
                <button
                  className="rbt-btn btn-border hover-icon-reverse rbt-sm-btn"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target={`#QuizModal${id}`}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Quiz</span>
                    <span className="btn-icon">
                      <i className="feather-plus-square"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-plus-square"></i>
                    </span>
                  </span>
                </button>
                <button
                  className="rbt-btn btn-border hover-icon-reverse rbt-sm-btn"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target={`#AssignmentModal${id}`}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Assignments </span>
                    <span className="btn-icon">
                      <i className="feather-plus-square"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-plus-square"></i>
                    </span>
                  </span>
                </button>
              </div>
              <div className="mt-3 mt-md-0">
                <button
                  className="rbt-btn btn-border hover-icon-reverse rbt-sm-btn"
                  onClick={handleImportClick}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Import Quiz </span>
                    <span className="btn-icon">
                      <i className="feather-download"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-download"></i>
                    </span>
                  </span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Modal for this topic */}
      <LessonModal
        modalId={`LessonModal${id}`}
        onAddLesson={onAddLesson}
        editingLesson={editingLesson}
        onEditComplete={() => setEditingLesson(null)}
      />

      {/* Quiz Modal for this topic */}
      <QuizModal
        modalId={`QuizModal${id}`}
        topicId={id}
        onAddQuiz={onAddQuiz}
        onUpdateQuiz={onUpdateQuiz}
        editingQuiz={editingQuiz}
        onEditComplete={() => setEditingQuiz(null)}
      />

      {/* Assignment Modal for this topic */}
      <AssignmentModal
        modalId={`AssignmentModal${id}`}
        onAddAssignment={onAddAssignment as any} // TODO(ANY-TODO #19): AssignmentModal uses different AssignmentData type from sampleAssignmentData
        editingAssignment={editingAssignment as any} // TODO(ANY-TODO #19): Type mismatch between AssignmentLesson and AssignmentData
        onEditComplete={() => setEditingAssignment(null)}
      />

      {/* Update Modal for this topic */}
      <UpdateModal
        modalId={`UpdateTopic${id}`}
        topicData={topicData}
        onUpdateTopic={onUpdateTopic}
      />
    </>
  );
};

export default React.memo(Lesson);
