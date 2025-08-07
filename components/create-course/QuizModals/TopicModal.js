import React, { useState } from 'react';

const TopicModal = ({ onAddTopic }) => {
  const [topicData, setTopicData] = useState({
    name: '',
    summary: '',
  });

  const handleSubmit = () => {
    if (topicData.name.trim()) {
      onAddTopic(topicData);
      // Reset form
      setTopicData({ name: '', summary: '' });
      // Close modal using Bootstrap's modal API
      const modal = document.getElementById('topicModal');
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
        id="topicModal"
        tabIndex="-1"
        aria-labelledby="topicModalLabel"
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
                    <h5 className="modal-title mb--20" id="topicModalLabel">
                      Add Topic
                    </h5>
                    <div className="course-field mb--20">
                      <label htmlFor="topicModalName">Topic Name</label>
                      <input
                        id="topicModalName"
                        type="text"
                        value={topicData.name}
                        onChange={(e) =>
                          setTopicData({ ...topicData, name: e.target.value })
                        }
                      />
                      <small>
                        <i className="feather-info"></i> Topic titles are
                        displayed publicly wherever required. Each topic may
                        contain one or more lessons, quiz and assignments.
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <label htmlFor="topicModalSummary">Topic Summary</label>
                      <textarea
                        id="topicModalSummary"
                        value={topicData.summary}
                        onChange={(e) =>
                          setTopicData({
                            ...topicData,
                            summary: e.target.value,
                          })
                        }
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
            <div className="modal-footer pt--30">
              <button
                type="button"
                className="rbt-btn btn-border btn-md radius-round-10"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rbt-btn btn-gradient btn-md"
                onClick={handleSubmit}
                data-bs-dismiss="modal"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopicModal;
