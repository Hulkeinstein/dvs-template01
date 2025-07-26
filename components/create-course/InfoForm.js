"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fileToBase64, validateFileSize, validateFileType } from '@/app/lib/utils/fileUpload';

import img from "../../public/images/others/thumbnail-placeholder.svg";

const InfoForm = ({ formData, onFormDataChange, onThumbnailChange }) => {
  console.log('InfoForm rendered with thumbnailPreview:', formData.thumbnailPreview);
  const [thumbnailPreview, setThumbnailPreview] = useState(formData.thumbnailPreview || null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  // formData.thumbnailPreview가 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    console.log('useEffect - thumbnailPreview changed:', formData.thumbnailPreview);
    if (formData.thumbnailPreview) {
      setThumbnailPreview(formData.thumbnailPreview);
    }
  }, [formData.thumbnailPreview]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNumberInputChange = (e) => {
    const { value } = e.target;
    // Allow only numeric characters
    const sanitizedValue = value.replace(/[^0-9]/g, "");
    onFormDataChange({
      ...formData,
      maxStudents: sanitizedValue
    });
  };

  const handleIncrement = () => {
    onFormDataChange({
      ...formData,
      maxStudents: parseInt(formData.maxStudents || 0) + 1
    });
  };

  const handleDecrement = () => {
    onFormDataChange({
      ...formData,
      maxStudents: Math.max(0, parseInt(formData.maxStudents || 0) - 1)
    });
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validateFileType(file, allowedTypes)) {
        setFileError('Only image files (JPEG, PNG, GIF, WebP) are allowed');
        e.target.value = '';
        return;
      }

      // Validate file size (5MB limit)
      if (!validateFileSize(file, 5)) {
        setFileError('File size must be less than 5MB');
        e.target.value = '';
        return;
      }

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        
        // Set preview
        setThumbnailPreview(base64);
        
        // Pass both file and base64 to parent
        onThumbnailChange({
          file: file,
          base64: base64
        });
        
        // Update form data with preview
        onFormDataChange({
          ...formData,
          thumbnailPreview: base64
        });
      } catch (error) {
        setFileError('Failed to process the image file');
        console.error('File processing error:', error);
      }
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
            placeholder="Course Title*" 
            value={formData.title || ''}
            onChange={handleInputChange}
            required
          />
          <small className="d-block mt_dec--5">
            <i className="feather-info"></i> Title should be descriptive and clear.
          </small>
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
            <i className="feather-info"></i> A brief summary that appears in course listings.
          </small>
        </div>

        <div className="course-field mb--15">
          <label htmlFor="field-slug">Course Slug</label>
          <input 
            id="field-slug" 
            name="slug"
            type="text" 
            placeholder="Course Slug*" 
            value={formData.slug || ''}
            onChange={handleInputChange}
            required
          />
          <small className="d-block mt_dec--5">
            <i className="feather-info"></i> URL-friendly version of the course name.
          </small>
        </div>

        <div className="course-field mb--15">
          <label htmlFor="field-duration">Course Duration (hours)</label>
          <input 
            id="field-duration" 
            name="duration"
            type="number" 
            placeholder="Course Duration*" 
            value={formData.duration || ''}
            onChange={handleInputChange}
            required
          />
          <small className="d-block mt_dec--5">
            <i className="feather-info"></i> Total duration of the course in hours.
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
            <i className="feather-info"></i> Detailed description of the course content and objectives.
          </small>
        </div>

        <div className="course-field mb--15 edu-bg-gray">
          <h6>Course Settings</h6>
          <div className="rbt-course-settings-content">
            <div className="row g-5">
              <div className="col-lg-4">
                <div className="advance-tab-button advance-tab-button-1">
                  <ul
                    className="rbt-default-tab-button nav nav-tabs"
                    id="courseSetting"
                    role="tablist"
                  >
                    <li className="nav-item" role="presentation">
                      <a
                        href="#"
                        className="active"
                        id="general-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#general"
                        role="tab"
                        aria-controls="general"
                        aria-selected="true"
                      >
                        <span>General</span>
                      </a>
                    </li>
                    <li className="nav-item" role="presentation">
                      <a
                        href="#"
                        id="content-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#content"
                        role="tab"
                        aria-controls="content"
                        aria-selected="false"
                      >
                        <span>Content Drip</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="tab-content">
                  <div
                    className="tab-pane fade advance-tab-content-1 active show"
                    id="general"
                    role="tabpanel"
                    aria-labelledby="general-tab"
                  >
                    <div className="course-field mb--20">
                      <label htmlFor="field-3">Maximum Students</label>
                      <div className="pro-quantity">
                        <div className="pro-qty m-0">
                          <span
                            className="dec qtybtn"
                            onClick={handleDecrement}
                          >
                            -
                          </span>
                          <input
                            id="field-3"
                            type="text"
                            name="maxStudents"
                            value={formData.maxStudents || 0}
                            onChange={handleNumberInputChange}
                          />
                          <span
                            className="inc qtybtn"
                            onClick={handleIncrement}
                          >
                            +
                          </span>
                        </div>
                      </div>
                      <small>
                        <i className="feather-info"></i> Number of students that
                        can enrol in this course. Set 0 for no limits.
                      </small>
                    </div>

                    <div className="course-field mb--20">
                      <label htmlFor="field-4">Difficulty Level</label>
                      <div className="rbt-modern-select bg-transparent height-45 mb--10">
                        <select 
                          className="w-100" 
                          id="field-4"
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
                      <small>
                        <i className="feather-info"></i> Course difficulty level
                      </small>
                    </div>

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
                        <i className="feather-info"></i> Issue certificates to students who complete the course.
                      </small>
                    </div>

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
                        <i className="feather-info"></i> Students can access the course forever
                      </small>
                    </div>
                  </div>

                  <div
                    className="tab-pane fade advance-tab-content-1"
                    id="content"
                    role="tabpanel"
                    aria-labelledby="content-tab"
                  >
                    <div className="rbt-content-drip-content">
                      <div className="course-field pb--20">
                        <p className="rbt-checkbox-wrapper mb--5">
                          <input
                            id="rbt-checkbox-1"
                            name="contentDripEnabled"
                            type="checkbox"
                            value="yes"
                            checked={formData.contentDripEnabled || false}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="rbt-checkbox-1">Enable</label>
                        </p>
                        <small>
                          <i className="feather-info"></i>
                          Enable / Disable content drip
                        </small>
                      </div>
                      <hr className="rbt-separator m-0" />

                      <div className="rbt-course-drip-option pt--20">
                        <h6 className="mb--10">Content Drip Type</h6>
                        <p className="mb--10 b3">
                          You can schedule your course content using the above
                          content drip options.
                        </p>
                        <div className="course-drop-option">
                          <div className="rbt-form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="contentDripType"
                              value="by_date"
                              id="rbt-radio-1"
                              checked={formData.contentDripType === 'by_date'}
                              onChange={handleInputChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="rbt-radio-1"
                            >
                              Schedule course contents by date
                            </label>
                          </div>
                          <div className="rbt-form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="contentDripType"
                              value="after_enrollment"
                              id="rbt-radio-2"
                              checked={formData.contentDripType === 'after_enrollment'}
                              onChange={handleInputChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="rbt-radio-2"
                            >
                              Content available after X days from enrollment
                            </label>
                          </div>
                          <div className="rbt-form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="contentDripType"
                              value="sequential"
                              id="rbt-radio-3"
                              checked={formData.contentDripType === 'sequential'}
                              onChange={handleInputChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="rbt-radio-3"
                            >
                              Course content available sequentially
                            </label>
                          </div>
                          <div className="rbt-form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="contentDripType"
                              value="after_prerequisites"
                              id="rbt-radio-4"
                              checked={formData.contentDripType === 'after_prerequisites'}
                              onChange={handleInputChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="rbt-radio-4"
                            >
                              Course content unlocked after finishing
                              prerequisites
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="course-field mb--15 edu-bg-gray">
          <h6>Course Price</h6>
          <div className="rbt-course-settings-content">
            <div className="row">
              <div className="col-lg-4">
                <div className="advance-tab-button advance-tab-button-1">
                  <ul
                    className="rbt-default-tab-button nav nav-tabs"
                    id="coursePrice"
                    role="tablist"
                  >
                    <li className="nav-item w-100" role="presentation">
                      <a
                        href="#"
                        className={formData.price > 0 ? "active" : ""}
                        id="paid-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#paid"
                        role="tab"
                        aria-controls="paid"
                        aria-selected={formData.price > 0}
                        onClick={() => onFormDataChange({ ...formData, price: formData.price || 1 })}
                      >
                        <span>Paid</span>
                      </a>
                    </li>
                    <li className="nav-item w-100" role="presentation">
                      <a
                        href="#"
                        className={formData.price === 0 ? "active" : ""}
                        id="free-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#free"
                        role="tab"
                        aria-controls="free"
                        aria-selected={formData.price === 0}
                        onClick={() => onFormDataChange({ ...formData, price: 0 })}
                      >
                        <span>Free</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="tab-content">
                  <div
                    className={`tab-pane fade advance-tab-content-1 ${formData.price > 0 ? 'active show' : ''}`}
                    id="paid"
                    role="tabpanel"
                    aria-labelledby="paid-tab"
                  >
                    <div className="course-field mb--15">
                      <label htmlFor="price-1">Course Price ($)</label>
                      <input
                        id="price-1"
                        name="price"
                        type="number"
                        placeholder="Course Price*"
                        value={formData.price || ''}
                        onChange={handleInputChange}
                        required
                      />
                      <small className="d-block mt_dec--5">
                        <i className="feather-info"></i> The Course Price
                        Includes Your Author Fee.
                      </small>
                    </div>

                    <div className="course-field mb--15">
                      <label htmlFor="discountPrice-1">
                        Discount Price ($)
                      </label>
                      <input
                        id="discountPrice-1"
                        name="discountPrice"
                        type="number"
                        placeholder="$ Discount Price"
                        value={formData.discountPrice || ''}
                        onChange={handleInputChange}
                      />
                      <small className="d-block mt_dec--5">
                        <i className="feather-info"></i> The Course Price
                        Includes Your Author Fee.
                      </small>
                    </div>
                  </div>

                  <div
                    className={`tab-pane fade advance-tab-content-1 ${formData.price === 0 ? 'active show' : ''}`}
                    id="free"
                    role="tabpanel"
                    aria-labelledby="free-tab"
                  >
                    <div className="course-field">
                      <p className="b3">This Course is free for everyone.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="course-field mb--20">
          <h6>Choose Categories</h6>
          <div className="rbt-modern-select bg-transparent height-45 w-100 mb--10">
            <select 
              className="w-100"
              name="category"
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
              <option value="personal-development">Personal Development</option>
            </select>
          </div>
        </div>

        <div className="course-field mb--20">
          <label htmlFor="createinputfile">Course Thumbnail*</label>
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
          {fileError && (
            <div className="alert alert-danger mt-2" role="alert">
              {fileError}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InfoForm;
