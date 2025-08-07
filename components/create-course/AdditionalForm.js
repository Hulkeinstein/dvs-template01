import React from 'react';

const AdditionalForm = ({ formData, onFormDataChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: value,
    });
  };
  return (
    <>
      <div
        id="accCollapseSix"
        className="accordion-collapse collapse"
        aria-labelledby="accSix"
        data-bs-parent="#tutionaccordionExamplea1"
      >
        <div className="accordion-body card-body rbt-course-field-wrapper rbt-default-form row row-15">
          <div className="col-lg-6">
            <div className="course-field mb--15">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="col-lg-6">
            <div className="course-field mb--15">
              <label htmlFor="language">Language</label>
              <div className="rbt-modern-select bg-transparent height-50 mb--10">
                <select
                  className="w-100"
                  id="language"
                  name="language"
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
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="course-field mb--15">
              <label htmlFor="whatLearn">Requirements</label>
              <textarea
                id="whatLearn"
                name="requirements"
                rows="5"
                placeholder="Add your course requirements here."
                value={formData.requirements || ''}
                onChange={handleInputChange}
              ></textarea>
              <small className="d-block mt_dec--5">
                <i className="feather-info"></i> Enter for per line.
              </small>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="course-field mb--15">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Add your course description here."
                value={formData.description || ''}
                onChange={handleInputChange}
              ></textarea>
              <small className="d-block mt_dec--5">
                <i className="feather-info"></i> Enter for per line.
              </small>
            </div>
          </div>

          <div className="col-lg-12">
            <hr className="mt--10 mb--20" />
          </div>

          <div className="col-lg-12">
            <div className="course-field mb--15">
              <label>Total Course Duration</label>
              <div className="row row--15">
                <div className="col-lg-6">
                  <input
                    type="number"
                    name="totalDurationHours"
                    placeholder="00"
                    value={formData.totalDurationHours || ''}
                    onChange={handleInputChange}
                    min="0"
                  />
                  <small className="d-block mt_dec--5">
                    <i className="feather-info"></i> Hour.
                  </small>
                </div>
                <div className="col-lg-6">
                  <input
                    type="number"
                    name="totalDurationMinutes"
                    placeholder="00"
                    value={formData.totalDurationMinutes || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="59"
                  />
                  <small className="d-block mt_dec--5">
                    <i className="feather-info"></i> Minute.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <hr className="mt--10 mb--20" />
          </div>

          <div className="col-lg-12">
            <div className="course-field mb--15">
              <label htmlFor="courseTag">Course Tags</label>
              <textarea
                id="courseTag"
                name="courseTags"
                rows="5"
                placeholder="Add your course tags here."
                value={formData.courseTags || ''}
                onChange={handleInputChange}
              ></textarea>
              <small className="d-block mt_dec--5">
                <i className="feather-info"></i> Maximum of 15 keywords covering
                features, usage, and styling. Keywords should all be in
                lowercase and separated by commas. e.g. photography, gallery,
                modern, jquery, wordpress theme.
              </small>
            </div>
          </div>

          <div className="col-lg-12">
            <hr className="mt--10 mb--20" />
          </div>

          <div className="col-lg-12">
            <div className="course-field mb--15">
              <label htmlFor="targeted">Targeted Audience</label>
              <textarea
                id="targeted"
                name="targetedAudience"
                rows="5"
                placeholder="Specify your target audience here."
                value={formData.targetedAudience || ''}
                onChange={handleInputChange}
              ></textarea>
              <small className="d-block mt_dec--5">
                <i className="feather-info"></i> Specify the target audience
                that will benefit the most from the course.
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdditionalForm;
