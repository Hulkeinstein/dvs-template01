'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { debounce } from '@/app/lib/utils/debounce';

import img from '../../public/images/others/thumbnail-placeholder.svg';

const InfoFormNew = ({ formData, onFormDataChange, onThumbnailChange }) => {
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [slugSuggestion, setSlugSuggestion] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const fileInputRef = useRef(null);

  // 슬러그 생성 함수
  const generateSlugFromTitle = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s가-힣-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 슬러그 중복 체크 함수
  const checkSlugAvailability = useCallback(
    debounce(async (slug) => {
      if (!slug || slug.length < 3) {
        setSlugAvailable(null);
        return;
      }

      setIsCheckingSlug(true);
      try {
        const response = await fetch('/api/check-slug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });

        const data = await response.json();
        setSlugAvailable(data.available);
        setSlugSuggestion(data.suggestion || '');
      } catch (error) {
        console.error('Slug check error:', error);
        setSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 제목 변경 시 슬러그 자동 생성
    if (name === 'title' && !formData.slug) {
      const generatedSlug = generateSlugFromTitle(value);
      onFormDataChange({
        ...formData,
        title: value,
        slug: generatedSlug,
      });
      checkSlugAvailability(generatedSlug);
      return;
    }

    // 슬러그 직접 입력 시 중복 체크
    if (name === 'slug') {
      const cleanSlug = value.toLowerCase().replace(/[^a-z0-9가-힣-]/g, '-');
      onFormDataChange({
        ...formData,
        slug: cleanSlug,
      });
      checkSlugAvailability(cleanSlug);
      return;
    }

    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: parseFloat(value) || 0,
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/i)) {
        alert('Please select a valid image file (JPG, JPEG, PNG, GIF, WEBP)');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Pass file to parent component
      onThumbnailChange(file);
    }
  };

  return (
    <>
      <div className="rbt-course-field-wrapper rbt-default-form">
        <div className="course-field mb--15">
          <label htmlFor="field-1">Course Title</label>
          <input
            id="field-1"
            name="title"
            type="text"
            placeholder="Introduction to Web Development"
            value={formData.title || ''}
            onChange={handleInputChange}
            required
          />
          <small className="d-block mt_dec--5">
            <i className="feather-info"></i> Title should be descriptive and
            clear.
          </small>
        </div>

        <div className="course-field mb--15">
          <label htmlFor="slug">
            Course URL Slug
            {isCheckingSlug && (
              <span className="text-muted ms-2">
                <i className="feather-loader"></i> 확인 중...
              </span>
            )}
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="web-development-intro"
            value={formData.slug || ''}
            onChange={handleInputChange}
          />

          {/* URL 미리보기 및 상태 메시지 */}
          <small className="d-block mt_dec--5">
            <i className="feather-link"></i> URL: courses/
            {formData.slug || 'your-course-slug'}
          </small>

          {/* 슬러그 상태 메시지 */}
          {slugAvailable === true && (
            <small className="d-block mt_dec--5 text-success">
              <i className="feather-check-circle"></i> 사용 가능한 URL입니다
            </small>
          )}

          {slugAvailable === false && (
            <>
              <small className="d-block mt_dec--5 text-danger">
                <i className="feather-alert-circle"></i> 이미 사용 중인
                URL입니다
              </small>
              {slugSuggestion && (
                <small className="d-block mt_dec--5">
                  <i className="feather-info"></i> 추천:{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onFormDataChange({
                        ...formData,
                        slug: slugSuggestion,
                      });
                      setSlugAvailable(true);
                      setSlugSuggestion('');
                    }}
                    className="text-primary"
                  >
                    {slugSuggestion}
                  </a>
                </small>
              )}
            </>
          )}
        </div>

        <div className="course-field mb--15">
          <label htmlFor="field-2">Short Description</label>
          <input
            id="field-2"
            name="shortDescription"
            type="text"
            placeholder="Brief description of the course"
            value={formData.shortDescription || ''}
            onChange={handleInputChange}
            required
          />
          <small className="d-block mt_dec--5">
            <i className="feather-info"></i> A brief summary that appears in
            course listings.
          </small>
        </div>

        <div className="course-field mb--15">
          <label htmlFor="description">Course Description</label>
          <textarea
            id="description"
            name="description"
            rows="10"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Describe what students will learn in this course..."
          ></textarea>
          <small className="d-block mt_dec--5">
            <i className="feather-info"></i> Detailed description of the course
            content and objectives.
          </small>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="course-field mb--20">
              <label htmlFor="category">Course Category</label>
              <div className="rbt-modern-select bg-transparent height-45 mb--10">
                <select
                  id="category"
                  name="category"
                  className="w-100"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="programming">Programming Languages</option>
                  <option value="data-science">Data Science</option>
                  <option value="business">Business</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="personal-development">
                    Personal Development
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="course-field mb--20">
              <label htmlFor="level">Difficulty Level</label>
              <div className="rbt-modern-select bg-transparent height-45 mb--10">
                <select
                  className="w-100"
                  id="level"
                  name="level"
                  value={formData.level || 'all_levels'}
                  onChange={handleInputChange}
                >
                  <option value="all_levels">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="course-field mb--20">
              <label htmlFor="language">Course Language</label>
              <div className="rbt-modern-select bg-transparent height-45 mb--10">
                <select
                  id="language"
                  name="language"
                  className="w-100"
                  value={formData.language || 'English'}
                  onChange={handleInputChange}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Russian">Russian</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="course-field mb--20">
              <label htmlFor="duration">Course Duration (hours)</label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="0"
                placeholder="e.g. 10"
                value={formData.duration || ''}
                onChange={handleNumberInputChange}
              />
              <small>
                <i className="feather-info"></i> Estimated total hours
              </small>
            </div>
          </div>
        </div>

        <div className="course-field mb--15 edu-bg-gray p-4 rounded">
          <h6 className="mb-3">Course Pricing</h6>
          <div className="row">
            <div className="col-lg-6">
              <div className="course-field mb--15">
                <label htmlFor="price">Course Price ($)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price || ''}
                  onChange={handleNumberInputChange}
                  required
                />
                <small className="d-block mt_dec--5">
                  <i className="feather-info"></i> Set to 0 for free courses
                </small>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="course-field mb--15">
                <label htmlFor="discountPrice">Discount Price ($)</label>
                <input
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.discountPrice || ''}
                  onChange={handleNumberInputChange}
                />
                <small className="d-block mt_dec--5">
                  <i className="feather-info"></i> Optional discounted price
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="course-field mb--15 edu-bg-gray p-4 rounded">
          <h6 className="mb-3">Course Settings</h6>
          <div className="row">
            <div className="col-lg-6">
              <div className="course-field mb--20">
                <label htmlFor="maxStudents">Maximum Students</label>
                <input
                  id="maxStudents"
                  type="number"
                  name="maxStudents"
                  min="0"
                  placeholder="0"
                  value={formData.maxStudents || 0}
                  onChange={handleNumberInputChange}
                />
                <small>
                  <i className="feather-info"></i> Set 0 for unlimited
                </small>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="course-field mb--20">
                <label htmlFor="passingGrade">Passing Grade (%)</label>
                <input
                  id="passingGrade"
                  type="number"
                  name="passingGrade"
                  min="0"
                  max="100"
                  placeholder="70"
                  value={formData.passingGrade || 70}
                  onChange={handleNumberInputChange}
                />
                <small>
                  <i className="feather-info"></i> Minimum grade to pass
                </small>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className="course-field mb--20">
                <label
                  className="form-check-label d-inline-block"
                  htmlFor="certificateEnabled"
                >
                  Enable Certificate
                </label>
                <div className="form-check form-switch mb--10">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="certificateEnabled"
                    name="certificateEnabled"
                    checked={formData.certificateEnabled || false}
                    onChange={handleInputChange}
                  />
                </div>
                <small>
                  <i className="feather-info"></i> Issue certificates on
                  completion
                </small>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="course-field mb--20">
                <label
                  className="form-check-label d-inline-block"
                  htmlFor="lifetimeAccess"
                >
                  Lifetime Access
                </label>
                <div className="form-check form-switch mb--10">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="lifetimeAccess"
                    name="lifetimeAccess"
                    checked={formData.lifetimeAccess !== false}
                    onChange={handleInputChange}
                  />
                </div>
                <small>
                  <i className="feather-info"></i> Students can access forever
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="course-field mb--20">
          <h6>Course Thumbnail</h6>
          <div className="rbt-create-course-thumbnail upload-area">
            <div className="upload-area">
              <div className="brows-file-wrapper" data-black-overlay="9">
                <input
                  name="createinputfile"
                  id="createinputfile"
                  type="file"
                  className="inputfile"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  ref={fileInputRef}
                />
                <Image
                  id="createfileImage"
                  src={thumbnailPreview || img}
                  width={797}
                  height={262}
                  alt="file image"
                  style={{ objectFit: 'cover' }}
                />

                <label
                  className="d-flex"
                  htmlFor="createinputfile"
                  title="No File Choosen"
                >
                  <i className="feather-upload"></i>
                  <span className="text-center">Choose a File</span>
                </label>
              </div>
            </div>
          </div>

          <small>
            <i className="feather-info"></i> <b>Size:</b> 700x430 pixels,
            <b>File Support:</b> JPG, JPEG, PNG, GIF, WEBP
          </small>
        </div>
      </div>
    </>
  );
};

export default InfoFormNew;
