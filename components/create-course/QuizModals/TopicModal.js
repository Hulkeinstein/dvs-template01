import React from "react";

const TopicModal = () => {
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
                      <input id="topicModalName" type="text" />
                      <small>
                        <i className="feather-info"></i> Topic titles are
                        displayed publicly wherever required. Each topic may
                        contain one or more lessons, quiz and assignments.
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <label htmlFor="topicModalSummary">Topic Summary</label>
                      <textarea id="topicModalSummary"></textarea>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopicModal;
