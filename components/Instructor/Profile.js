import Link from "next/link";

const Profile = ({ userProfile }) => {
  // 사용자 데이터가 없을 때 기본값 설정
  const userData = userProfile || {
    name: 'N/A',
    email: 'N/A',
    created_at: null,
    phone_number: null,
    skill: null,
    biography: null,
    role: 'N/A'
  };

  // created_at 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // 이름을 First Name과 Last Name으로 분리
  const nameParts = userData.name ? userData.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || 'N/A';
  const lastName = nameParts.slice(1).join(' ') || 'N/A';

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title d-flex justify-content-between align-items-center">
            <h4 className="rbt-title-style-3 mb-0">My Profile</h4>
            <Link
              href="/instructor-settings"
              className="rbt-btn btn-sm btn-gradient hover-icon-reverse"
            >
              <span className="icon-reverse-wrapper">
                <span className="btn-text">Edit Profile</span>
                <span className="btn-icon">
                  <i className="feather-edit"></i>
                </span>
                <span className="btn-icon">
                  <i className="feather-edit"></i>
                </span>
              </span>
            </Link>
          </div>
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Registration Date</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {formatDate(userData.created_at)}
              </div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">First Name</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{firstName}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Last Name</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{lastName}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Role</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{userData.role || 'N/A'}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Email</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{userData.email}</div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Phone Number</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.phone_number || 'Not provided'}
              </div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Skill/Occupation</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.skill || 'Not provided'}
              </div>
            </div>
          </div>
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Biography</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.biography || 'No biography provided'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
