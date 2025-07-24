"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

import img from "../../../public/images/others/thumbnail-placeholder.svg";

const LessonModal = () => {
  const fileInputRef = useRef(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);

  const handleImportClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file type - more flexible validation
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeatureImagePreview(reader.result);
      };
      reader.onerror = (error) => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <div
        className="rbt-default-modal modal fade"
        id="Lesson"
        tabIndex="-1"
        aria-labelledby="LessonLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="rbt-round-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="feather-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="inner rbt-default-form">
                <div className="row">
                  <div className="col-lg-12">
                    <h5 className="modal-title mb--20" id="LessonLabel">
                      Add Lesson
                    </h5>
                    <div className="course-field mb--20">
                      <label htmlFor="lessonModalName">Lesson Name</label>
                      <input id="lessonModalName" type="text" />
                      <small>
                        <i className="feather-info"></i> Lesson titles are
                        displayed publicly wherever required. Each Lesson may
                        contain one or more lessons, quiz and assignments.
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <label htmlFor="lessonModalSummary">Lesson Summary</label>
                      <textarea id="lessonModalSummary"></textarea>
                      <small>
                        <i className="feather-info"></i> Add a summary of short
                        text to prepare students for the activities for the
                        Lesson. The text is shown on the course page beside the
                        tooltip beside the Lesson name.
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <h6>Feature Image</h6>
                      <div className="rbt-create-course-thumbnail upload-area">
                        <div className="upload-area">
                          <div
                            className="brows-file-wrapper"
                            data-black-overlay="9"
                          >
                            <input
                              name="lessonFeatureImage"
                              id="lessonFeatureImage"
                              type="file"
                              className="inputfile"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            <Image
                              id="lessonFeatureImagePreview"
                              src={featureImagePreview || img}
                              width={797}
                              height={262}
                              alt="file image"
                              style={{ objectFit: 'cover' }}
                            />

                            <label
                              className="d-flex"
                              htmlFor="lessonFeatureImage"
                              title="No File Choosen"
                            >
                              <i className="feather-upload"></i>
                              <span className="text-center">Choose a File</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <small>
                        <i className="feather-info"></i> <b>Size:</b> 700x430
                        pixels, <b>File Support:</b> JPG, JPEG, PNG, GIF, WEBP
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <h6>Video Source</h6>
                      <div className="rbt-modern-select bg-transparent height-45 w-100 mb--10">
                        <select className="w-100">
                          <option>Select Video Source</option>
                          <option>External URL </option>
                          <option>Youtube </option>
                          <option>Vimo</option>
                          <option>facebook</option>
                          <option>twitter</option>
                        </select>
                      </div>
                    </div>
                    <div className="course-field mb--15">
                      <label>Video playback time</label>
                      <div className="row row--15">
                        <div className="col-lg-4">
                          <input type="number" placeholder="00" />
                          <small className="d-block mt_dec--5">
                            <i className="feather-info"></i> Hour.
                          </small>
                        </div>
                        <div className="col-lg-4">
                          <input type="number" placeholder="00" />
                          <small className="d-block mt_dec--5">
                            <i className="feather-info"></i> Minute.
                          </small>
                        </div>
                        <div className="col-lg-4">
                          <input type="number" placeholder="00" />
                          <small className="d-block mt_dec--5">
                            <i className="feather-info"></i> Second.
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="course-field mb--20">
                      <h6>Upload exercise files to the Lesson</h6>
                      <div className="rbt-modern-select bg-transparent height-45 w-100 mb--10">
                        <button
                          className="rbt-btn btn-md btn-border hover-icon-reverse"
                          onClick={handleImportClick}
                        >
                          <span className="icon-reverse-wrapper">
                            <span className="btn-text">Upload Attachments</span>
                            <span className="btn-icon">
                              <i className="feather-paperclip"></i>
                            </span>
                            <span className="btn-icon">
                              <i className="feather-paperclip"></i>
                            </span>
                          </span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    <div className="course-field mb--20">
                      <p className="rbt-checkbox-wrapper mb--5 d-flex">
                        <input
                          id="rbt-checkbox-11"
                          name="rbt-checkbox-11"
                          type="checkbox"
                          defaultValue="yes"
                        />
                        <label htmlFor="rbt-checkbox-11">
                          Enable Course Preview
                        </label>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="top-circle-shape"></div>
            <div className="modal-footer pt--30 justify-content-between">
              <button
                type="button"
                className="rbt-btn btn-border btn-md radius-round-10"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <div className="content">
                <button type="button" className="rbt-btn btn-md">
                  Update Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonModal;
