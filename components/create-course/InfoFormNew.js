'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

import img from '../../public/images/others/thumbnail-placeholder.svg';

const InfoFormNew = ({ formData, onFormDataChange, onThumbnailChange }) => {
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
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
              <select
                id="category"
                name="category"
                className="form-select"
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
          <div className="col-lg-6">
            <div className="course-field mb--20">
              <label htmlFor="level">Difficulty Level</label>
              <select
                className="form-select"
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

        <div className="row">
          <div className="col-lg-6">
            <div className="course-field mb--20">
              <label htmlFor="language">Course Language</label>
              <select
                id="language"
                name="language"
                className="form-select"
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
