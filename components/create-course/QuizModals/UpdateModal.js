import React, { useState, useEffect } from "react";

const UpdateModal = ({ modalId = "UpdateTopic", topicData, onUpdateTopic }) => {
  const [formData, setFormData] = useState({
    name: '',
    summary: ''
  });
  
  useEffect(() => {
    if (topicData) {
      setFormData({
        name: topicData.name || '',
        summary: topicData.summary || ''
      });
    }
  }, [topicData]);
  
  const handleSubmit = () => {
    if (formData.name.trim() && onUpdateTopic) {
      onUpdateTopic(formData);
      
      // Close modal
      const modal = document.getElementById(modalId);
      const modalInstance = window.bootstrap?.Modal?.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  };
  return (
    <>
      <div
        className="rbt-default-modal modal fade"
        id={modalId}
        tabIndex="-1"
        aria-labelledby={`${modalId}Label`}
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
                    <h5
                      className="modal-title mb--20"
                      id={`${modalId}Label`}
                    >
                      Update Topic
                    </h5>
                    <div className="course-field mb--20">
                      <label htmlFor="updateModalTopicName">Topic Name</label>
                      <input 
                        id="updateModalTopicName" 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <small>
                        <i className="feather-info"></i> Topic titles are
                        displayed publicly wherever required. Each topic may
                        contain one or more lessons, quiz and assignments.
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <label htmlFor="updateModalTopicSummary">Topic Summary</label>
                      <textarea 
                        id="updateModalTopicSummary"
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      ></textarea>
                      <small>
                        <i className="feather-info"></i> Add a summary of short
                        text to prepare students for the activities for the
                        topic. The text is shown on the course page beside the
                        tooltip beside the topic name.
                      </small>
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
                <button 
                  type="button" 
                  className="rbt-btn btn-gradient btn-md"
                  onClick={handleSubmit}
                  data-bs-dismiss="modal"
                >
                  Update Topic
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateModal;
