"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getCourseById, updateCourse } from "@/app/lib/actions/courseActions";
import { createLesson, updateLesson, deleteLesson, reorderLessons, getLessonsByCourse } from "@/app/lib/actions/lessonActions";
import InfoForm from "@/components/create-course/InfoForm";
import LessonItem from "./LessonItem";
import AddLessonModal from "./AddLessonModal";
import EditLessonModal from "./EditLessonModal";

const EditCourse = ({ courseId, userProfile }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Course data
  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({});
  const [lessons, setLessons] = useState([]);
  
  // Modal states
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course details
      const courseResult = await getCourseById(courseId);
      if (!courseResult.success) {
        setError(courseResult.error || 'Failed to load course');
        return;
      }
      
      // Check ownership
      if (courseResult.course.instructor_id !== userProfile.id) {
        setError('You are not authorized to edit this course');
        return;
      }
      
      setCourse(courseResult.course);
      setFormData({
        title: courseResult.course.title || '',
        shortDescription: courseResult.course.short_description || '',
        description: courseResult.course.description || '',
        category: courseResult.course.category || '',
        level: courseResult.course.level || 'all_levels',
        language: courseResult.course.language || 'English',
        price: courseResult.course.price || 0,
        duration: courseResult.course.duration_hours || 0,
        maxStudents: courseResult.course.max_students || 0,
        thumbnailPreview: courseResult.course.thumbnail_url
      });
      
      // Fetch lessons
      const lessonsResult = await getLessonsByCourse(courseId);
      if (lessonsResult.success) {
        setLessons(lessonsResult.lessons || []);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFormDataChange = (newData) => {
    setFormData(newData);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        short_description: formData.shortDescription,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        language: formData.language,
        price: parseFloat(formData.price) || 0,
        duration_hours: parseInt(formData.duration) || 0,
        max_students: parseInt(formData.maxStudents) || 0
      };
      
      const result = await updateCourse(courseId, updateData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update course');
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = lessons.findIndex(lesson => lesson.id === active.id);
      const newIndex = lessons.findIndex(lesson => lesson.id === over.id);
      
      const newLessons = arrayMove(lessons, oldIndex, newIndex);
      setLessons(newLessons);
      
      // Update order in database
      const lessonOrders = newLessons.map((lesson, index) => ({
        id: lesson.id,
        order: index
      }));
      
      const result = await reorderLessons(courseId, lessonOrders);
      if (!result.success) {
        // Revert on error
        setLessons(lessons);
        setError('Failed to reorder lessons');
      }
    }
  };

  const handleAddLesson = async (lessonData) => {
    try {
      const result = await createLesson({
        courseId,
        ...lessonData
      });
      
      if (result.success) {
        await fetchCourseData(); // Refresh lessons
        setShowAddLessonModal(false);
      } else {
        setError(result.error || 'Failed to add lesson');
      }
    } catch (err) {
      console.error('Error adding lesson:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setShowEditLessonModal(true);
  };

  const handleUpdateLesson = async (lessonId, updates) => {
    try {
      const result = await updateLesson(lessonId, updates);
      
      if (result.success) {
        await fetchCourseData(); // Refresh lessons
        setShowEditLessonModal(false);
        setEditingLesson(null);
      } else {
        setError(result.error || 'Failed to update lesson');
      }
    } catch (err) {
      console.error('Error updating lesson:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    try {
      const result = await deleteLesson(lessonId);
      
      if (result.success) {
        await fetchCourseData(); // Refresh lessons
      } else {
        setError(result.error || 'Failed to delete lesson');
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('An unexpected error occurred');
    }
  };

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <Link href="/instructor/dashboard" className="rbt-btn btn-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title mb--30">
            <h4 className="rbt-title-style-3">Edit Course</h4>
            {course && (
              <p className="text-muted">Editing: {course.title}</p>
            )}
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              Course updated successfully!
              <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
            </div>
          )}

          {/* Course Information */}
          <div className="rbt-dashboard-content-wrapper">
            <div className="tutor-bg-photo bg_image height-245"></div>
            <div className="rbt-tutor-information">
              <div className="rbt-tutor-information-left">
                <div className="section-title mb--30">
                  <h5 className="title">Course Information</h5>
                </div>
                <InfoForm 
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onThumbnailChange={() => {}} // Thumbnail update handled separately
                />
              </div>
            </div>
          </div>

          {/* Lessons Management */}
          <div className="mt--50">
            <div className="section-title mb--20">
              <h5 className="title">Course Lessons</h5>
              <button 
                className="rbt-btn btn-sm"
                onClick={() => setShowAddLessonModal(true)}
              >
                Add Lesson
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No lessons yet. Add your first lesson to get started.</p>
              </div>
            ) : (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={lessons.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="rbt-dashboard-table table-responsive">
                    <table className="rbt-table table table-borderless">
                      <thead>
                        <tr>
                          <th width="30"></th>
                          <th>Title</th>
                          <th>Duration</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessons.map((lesson) => (
                          <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            onEdit={handleEditLesson}
                            onDelete={handleDeleteLesson}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt--30">
            <button 
              className="rbt-btn btn-gradient hover-icon-reverse"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              <span className="icon-reverse-wrapper">
                <span className="btn-text">
                  {saving ? 'Saving...' : 'Save Changes'}
                </span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </span>
            </button>
            <button 
              className="rbt-btn btn-border ms-2"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Add Lesson Modal */}
      {showAddLessonModal && (
        <AddLessonModal
          isOpen={showAddLessonModal}
          onClose={() => setShowAddLessonModal(false)}
          onSave={handleAddLesson}
        />
      )}

      {/* Edit Lesson Modal */}
      {showEditLessonModal && editingLesson && (
        <EditLessonModal
          isOpen={showEditLessonModal}
          lesson={editingLesson}
          onClose={() => {
            setShowEditLessonModal(false);
            setEditingLesson(null);
          }}
          onSave={(updates) => handleUpdateLesson(editingLesson.id, updates)}
        />
      )}
    </>
  );
};

export default EditCourse;