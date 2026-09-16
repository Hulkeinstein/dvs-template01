interface CreatorInfoProps {
  channelName: string;
  channelUrl: string;
  videoUrl: string;
  originalTitle?: string; // Optional as it wasn't strictly in the snippet but useful
}

const CreatorInfo: React.FC<CreatorInfoProps> = ({
  channelName,
  channelUrl,
  videoUrl,
  originalTitle,
}) => {
  if (!channelName) return null;

  return (
    <div className="rbt-creator-integration pt--20">
      <div className="inner">
        <div className="section-title text-start">
          <h4 className="title">{originalTitle}</h4>
        </div>
        <div className="rbt-instructor-list-wrapper">
          <div className="rbt-instructor-list">
            <div className="rbt-instructor-info">
              <div className="instructor-content">
                <h5 className="title">
                  <a
                    href={channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-flex align-items-center"
                  >
                    <i className="feather-youtube me-2 text-danger"></i>
                    {channelName}
                  </a>
                </h5>
                <span className="b3">
                  이 영상의 모든 권리는 원작자에게 있습니다.{' '}
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-decoration-underline ms-1"
                  >
                    YouTube에서 원본 보기
                    <i
                      className="feather-external-link ms-1"
                      style={{ fontSize: '12px' }}
                    ></i>
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorInfo;
